/*
 * Liquid glass for existing elements, adapted from liquid-glass-js by Armagan Amcalar
 * (https://github.com/dashersw/liquid-glass-js, MIT licence, see LICENSE).
 *
 * Same method as the library's Container: one html2canvas snapshot of the page, and a
 * small WebGL canvas behind each glass element that samples the snapshot under it with
 * the library's refraction, blur and tint shader (shader.ts, unchanged). Changes for a
 * single-page React site:
 *  - attaches to an element that already exists (our links) instead of building its own;
 *  - takes a fresh snapshot when the page changes (route, resize, content height);
 *  - scales the snapshot down to the GPU's texture limit so long pages still work;
 *  - renders at the screen's pixel ratio, and cleans up (destroy) when React unmounts;
 *  - the site's moving backdrop (.pattern-field, fixed to the screen) is not in the snapshot,
 *    so each frame the glass composites the live backdrop with the snapshot of the page
 *    around it, and refracts that. The shader then sees a small local texture.
 */
import html2canvas from 'html2canvas'
import { fragmentShader } from './shader'

export type GlassShape = 'pill' | 'circle'

const vertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texcoord;
  varying vec2 v_texcoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texcoord = a_texcoord;
  }
`

// The library's demo look (window.glassControls in container.js), with less blur and a
// stronger rim so the thin lines and dots of this dark site still read through the glass.
const LOOK = {
  blurRadius: 2.2,
  edgeIntensity: 0.03,
  rimIntensity: 0.1,
  baseIntensity: 0.01,
  edgeDistance: 0.15,
  rimDistance: 0.8,
  baseDistance: 0.1,
  cornerBoost: 0.04,
  rippleEffect: 0.1,
}

// ---------------------------------------------------------------- shared page snapshot

type Snapshot = { canvas: HTMLCanvasElement; pageW: number; pageH: number; scale: number; version: number }

let snapshot: Snapshot | null = null
let capturing = false
let again = false
let version = 0
let timer = 0
const glasses = new Set<LiquidGlass>()

function maxTexture() {
  const gl = document.createElement('canvas').getContext('webgl')
  const max = gl ? (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) : 4096
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return Math.min(max, 8192)
}
let MAX = 0

async function capture() {
  if (capturing) {
    again = true
    return
  }
  capturing = true
  try {
    MAX ||= maxTexture()
    const pageW = document.documentElement.scrollWidth
    const pageH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const scale = Math.min(1, MAX / pageW, MAX / pageH)
    const canvas = await html2canvas(document.body, {
      scale,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      onclone: async (doc) => {
        // Transparent page background, so the live backdrop shows through in the composite.
        doc.documentElement.style.background = 'transparent'
        doc.body.style.background = 'transparent'
        // Hide the glass itself and things pinned to the screen (menu bar, backdrop, the discipline
        // opening), which would otherwise be pasted into the page at one scroll spot. Hidden, not
        // removed, so the copy keeps exactly the same layout as the real page.
        doc.querySelectorAll<HTMLElement>('.liquid-glass, .site-header, .pattern-field, .track-start, .replay-start').forEach((el) => {
          el.style.visibility = 'hidden'
        })
        // Wait for the web fonts in the copy too, or its text (and so the layout) comes out different.
        const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.style} ${f.weight} 16px "${f.family.replace(/"/g, '')}"`)
        await Promise.all(fonts.map((f) => doc.fonts.load(f).catch(() => null)))
        await doc.fonts.ready
      },
    })
    snapshot = { canvas, pageW, pageH, scale: canvas.width / pageW, version: ++version }
    glasses.forEach((g) => g.useSnapshot())
  } catch (error) {
    console.warn('Liquid glass: page snapshot failed', error)
  } finally {
    capturing = false
    if (again) {
      again = false
      schedule(300)
    }
  }
}

/** Takes a new snapshot once the page has settled. */
export function refreshGlass(delay = 700) {
  schedule(delay)
}

function schedule(delay: number) {
  clearTimeout(timer)
  timer = window.setTimeout(() => {
    if (glasses.size) void capture()
  }, delay)
}

let watching = false
function watchPage() {
  if (watching) return
  watching = true
  let lastW = window.innerWidth
  let lastH = document.documentElement.scrollHeight
  window.addEventListener('resize', () => {
    glasses.forEach((g) => g.resize())
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth
      schedule(600)
    }
  })
  window.addEventListener('scroll', () => glasses.forEach((g) => g.render()), { passive: true })
  // Content that loads late (images, fonts, lazy sections) changes the page under the glass.
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight
    if (Math.abs(h - lastH) > 40) {
      lastH = h
      schedule(900)
    }
  }).observe(document.body)
  document.fonts?.ready.then(() => schedule(300))
}

// ---------------------------------------------------------------- one glass surface

export class LiquidGlass {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext | null
  private program: WebGLProgram | null = null
  private texture: WebGLTexture | null = null
  private loc: Record<string, WebGLUniformLocation | null> = {}
  private version = 0
  private w = 0
  private h = 0
  private radius = 0
  private raf = 0
  private observer?: ResizeObserver
  private host: HTMLElement
  private shape: GlassShape
  private tint: number
  private local = document.createElement('canvas')
  private visible = false
  private loop = 0
  private io?: IntersectionObserver

  /** host: the element that looks like glass; canvas: an empty canvas inside it, behind its content. */
  constructor(host: HTMLElement, canvas: HTMLCanvasElement, shape: GlassShape = 'pill', tint = 0.1) {
    this.host = host
    this.shape = shape
    this.tint = tint
    host.classList.add('liquid-glass', `liquid-glass-${shape}`)
    this.canvas = canvas
    this.gl = this.canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
    if (!this.gl) return
    this.setup()
    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(host)
    // The buttons lift on hover, so follow them for the length of the transition.
    host.addEventListener('pointerenter', this.follow)
    host.addEventListener('pointerleave', this.follow)
    // Animate only while on screen: the backdrop behind the glass keeps moving.
    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      cancelAnimationFrame(this.loop)
      if (this.visible) this.animate()
    })
    this.io.observe(host)
    glasses.add(this)
    watchPage()
    this.resize()
    if (snapshot) this.useSnapshot()
    else schedule(500)
  }

  private animate = () => {
    this.render()
    if (this.visible) this.loop = requestAnimationFrame(this.animate)
  }

  private follow = () => {
    const until = performance.now() + 450
    cancelAnimationFrame(this.raf)
    const step = () => {
      this.render()
      if (performance.now() < until) this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  private setup() {
    const gl = this.gl!
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s))
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)
    this.program = program

    const buffer = (data: number[], name: string) => {
      const b = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
      const at = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(at)
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    }
    buffer([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1], 'a_position')
    buffer([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0], 'a_texcoord')

    for (const name of ['u_image', 'u_resolution', 'u_textureSize', 'u_scrollY', 'u_pageHeight', 'u_viewportHeight', 'u_blurRadius', 'u_borderRadius', 'u_containerPosition', 'u_warp', 'u_edgeIntensity', 'u_rimIntensity', 'u_baseIntensity', 'u_edgeDistance', 'u_rimDistance', 'u_baseDistance', 'u_cornerBoost', 'u_rippleEffect', 'u_tintOpacity']) {
      this.loc[name] = gl.getUniformLocation(program, name)
    }
    gl.uniform1f(this.loc.u_blurRadius, LOOK.blurRadius)
    gl.uniform1f(this.loc.u_warp, 0)
    gl.uniform1f(this.loc.u_edgeIntensity, LOOK.edgeIntensity)
    gl.uniform1f(this.loc.u_rimIntensity, LOOK.rimIntensity)
    gl.uniform1f(this.loc.u_baseIntensity, LOOK.baseIntensity)
    gl.uniform1f(this.loc.u_edgeDistance, LOOK.edgeDistance)
    gl.uniform1f(this.loc.u_rimDistance, LOOK.rimDistance)
    gl.uniform1f(this.loc.u_baseDistance, LOOK.baseDistance)
    gl.uniform1f(this.loc.u_cornerBoost, LOOK.cornerBoost)
    gl.uniform1f(this.loc.u_rippleEffect, LOOK.rippleEffect)
    gl.uniform1f(this.loc.u_tintOpacity, this.tint)
    gl.uniform1i(this.loc.u_image, 0)
    gl.clearColor(0, 0, 0, 0)

    this.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  useSnapshot() {
    const gl = this.gl
    if (!gl || !this.program || !snapshot || snapshot.version === this.version) return
    this.version = snapshot.version
    gl.uniform1f(this.loc.u_pageHeight, snapshot.pageH)
    this.host.classList.add('glass-ready')
    this.render()
  }

  resize() {
    const gl = this.gl
    if (!gl || !this.program) return
    const w = this.host.offsetWidth
    const h = this.host.offsetHeight
    if (!w || !h) return
    if (w !== this.w || h !== this.h) {
      this.w = w
      this.h = h
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      this.canvas.width = Math.round(w * ratio)
      this.canvas.height = Math.round(h * ratio)
      gl.viewport(0, 0, this.canvas.width, this.canvas.height)
      this.radius = this.shape === 'circle' ? Math.min(w, h) / 2 : h / 2
      gl.uniform2f(this.loc.u_resolution, w, h)
      gl.uniform1f(this.loc.u_borderRadius, this.radius)
    }
    gl.uniform1f(this.loc.u_viewportHeight, window.innerHeight)
    this.render()
  }

  render() {
    const gl = this.gl
    if (!gl || !this.program || !this.version || !snapshot) return
    const box = this.host.getBoundingClientRect()
    if (box.bottom < -50 || box.top > window.innerHeight + 50) return

    // What is behind the glass right now, plus a margin for refraction and blur, in screen pixels.
    const m = 48
    const rx = box.left - m
    const ry = box.top - m
    const rw = Math.ceil(box.width + 2 * m)
    const rh = Math.ceil(box.height + 2 * m)
    if (this.local.width !== rw || this.local.height !== rh) {
      this.local.width = rw
      this.local.height = rh
    }
    const g = this.local.getContext('2d')!
    g.fillStyle = getComputedStyle(document.body).backgroundColor || '#000'
    g.fillRect(0, 0, rw, rh)
    // The live backdrop canvas, fixed to the screen.
    const field = document.querySelector<HTMLCanvasElement>('canvas.pattern-field')
    if (field && field.width) {
      const fb = field.getBoundingClientRect()
      const sx = field.width / fb.width
      const sy = field.height / fb.height
      g.drawImage(field, (rx - fb.left) * sx, (ry - fb.top) * sy, rw * sx, rh * sy, 0, 0, rw, rh)
    }
    // The page itself, from the snapshot, where it sits at the current scroll.
    const k = snapshot.scale
    g.drawImage(snapshot.canvas, (rx + window.scrollX) * k, (ry + window.scrollY) * k, rw * k, rh * k, 0, 0, rw, rh)
    // Panels the glass sits on (the menu bar, the phone menu) are left out of the snapshot,
    // so lay their own colour over the patch, the way they cover the page on screen.
    for (const tint of this.panels()) {
      g.fillStyle = tint
      g.fillRect(0, 0, rw, rh)
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.local)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // The shader thinks in page pixels; here the "page" is the local patch around the glass.
    gl.uniform2f(this.loc.u_textureSize, rw, rh)
    gl.uniform1f(this.loc.u_scrollY, 0)
    gl.uniform2f(this.loc.u_containerPosition, m + box.width / 2, m + box.height / 2)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  /** Background colours of the glass's ancestors, outermost first (only the ones with any colour). */
  private panels() {
    const out: string[] = []
    for (let el = this.host.parentElement; el && el !== document.body; el = el.parentElement) {
      const bg = getComputedStyle(el).backgroundColor
      const m = bg.match(/rgba?\(([^)]+)\)/)
      if (!m) continue
      const parts = m[1].split(',').map((x) => parseFloat(x))
      if (parts.length === 4 && parts[3] === 0) continue
      out.unshift(bg)
    }
    return out
  }

  destroy() {
    glasses.delete(this)
    cancelAnimationFrame(this.raf)
    cancelAnimationFrame(this.loop)
    this.visible = false
    this.io?.disconnect()
    this.observer?.disconnect()
    this.host.removeEventListener('pointerenter', this.follow)
    this.host.removeEventListener('pointerleave', this.follow)
    this.host.classList.remove('liquid-glass', `liquid-glass-${this.shape}`, 'glass-ready')
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
