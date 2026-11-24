/*
 * Generative patterns in the spirit of Book of Shapes (https://bookofshapes.com):
 * grids, radial bursts, flow bands and tiles, drawn live on a canvas so they can
 * respond to the cursor and to scrolling.
 *
 * Every pattern is a function of the same inputs, so any canvas on the site
 * (the full-page backdrop, a button, a card) can draw any of them.
 */

export type PatternName = 'cells' | 'lens' | 'rings' | 'flow' | 'burst' | 'tiles' | 'none'

export type PatternInput = {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  /** Seconds since start. */
  t: number
  /** Cursor position in canvas pixels, and how present it is (0..1). */
  mx: number
  my: number
  focus: number
  /** Scroll progress through the section, roughly 0..1. */
  scroll: number
  /** Overall opacity multiplier. */
  alpha: number
  /** Grid spacing in pixels. */
  cell: number
}

const SILVER = '226, 233, 237'

const ink = (ctx: CanvasRenderingContext2D, a: number) => {
  const v = `rgba(${SILVER}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`
  ctx.fillStyle = v
  ctx.strokeStyle = v
}

/** 1 at the cursor, falling to 0 at `radius`. */
const near = (x: number, y: number, p: PatternInput, radius: number) => {
  const d = Math.hypot(x - p.mx, y - p.my)
  return p.focus * Math.max(0, 1 - d / radius) ** 2
}

/** Cell Shift: a dot grid whose dots swell under a lens that follows the cursor. */
function cells(p: PatternInput) {
  const { ctx, w, h, cell, t } = p
  const r = Math.max(w, h) * 0.32
  for (let y = cell / 2; y < h; y += cell) {
    for (let x = cell / 2; x < w; x += cell) {
      const k = near(x, y, p, r)
      const wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.009 + t * 0.8)
      const size = cell * (0.07 + 0.06 * wave + 0.34 * k)
      ink(ctx, p.alpha * (0.18 + 0.12 * wave + 0.7 * k))
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** Lens Grid: straight lines that bulge around the cursor like glass. */
function lens(p: PatternInput) {
  const { ctx, w, h, cell } = p
  const r = Math.max(w, h) * 0.3
  const bend = (x: number, y: number): [number, number] => {
    const dx = x - p.mx
    const dy = y - p.my
    const d = Math.hypot(dx, dy) || 1
    const k = p.focus * Math.max(0, 1 - d / r) ** 2 * r * 0.35
    return [x + (dx / d) * k, y + (dy / d) * k]
  }
  ctx.lineWidth = 1
  const step = 12
  for (let x = 0; x <= w; x += cell) {
    ink(ctx, p.alpha * (0.14 + 0.5 * near(x, p.my, p, r)))
    ctx.beginPath()
    for (let y = 0; y <= h; y += step) {
      const [bx, by] = bend(x, y)
      y === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)
    }
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += cell) {
    ink(ctx, p.alpha * (0.14 + 0.5 * near(p.mx, y, p, r)))
    ctx.beginPath()
    for (let x = 0; x <= w; x += step) {
      const [bx, by] = bend(x, y)
      x === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)
    }
    ctx.stroke()
  }
}

/** Track rings: concentric dotted ovals, like lanes, turning as you scroll. */
function rings(p: PatternInput) {
  const { ctx, w, h, t, scroll } = p
  const cx = w / 2 + (p.mx - w / 2) * 0.08 * p.focus
  const cy = h / 2 + (p.my - h / 2) * 0.08 * p.focus
  const lanes = 8
  const base = Math.min(w, h) * 0.12
  const gap = Math.min(w, h) * 0.055
  for (let i = 0; i < lanes; i++) {
    const rx = (base + i * gap) * 1.6
    const ry = base + i * gap
    const dots = Math.round(28 + i * 10)
    const turn = scroll * Math.PI * (i % 2 ? 1 : -1) * 0.6 + t * 0.05 * (i + 1)
    for (let j = 0; j < dots; j++) {
      const a = (j / dots) * Math.PI * 2 + turn
      const x = cx + Math.cos(a) * rx
      const y = cy + Math.sin(a) * ry
      const k = near(x, y, p, Math.min(w, h) * 0.35)
      ink(ctx, p.alpha * (0.16 + 0.75 * k))
      ctx.beginPath()
      ctx.arc(x, y, 1.2 + 3.5 * k, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** Receding road: horizontal bars that shorten toward a vanishing line and stream with scroll. */
function flow(p: PatternInput) {
  const { ctx, w, h, t, scroll } = p
  const rows = Math.max(10, Math.round(h / 22))
  for (let i = 0; i < rows; i++) {
    const depth = i / rows // 0 far, 1 near
    const y = h * (0.12 + 0.84 * depth ** 1.6)
    const thick = 1 + depth * 6
    const segs = 6 + Math.round(depth * 10)
    const shift = ((t * 30 + scroll * 900) * (0.3 + depth)) % (w / segs)
    for (let s = -1; s < segs + 1; s++) {
      const x = s * (w / segs) + shift
      const len = (w / segs) * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(s * 1.7 + i)))
      const k = near(x + len / 2, y, p, w * 0.3)
      ink(ctx, p.alpha * (0.1 + 0.3 * depth + 0.6 * k))
      ctx.fillRect(x, y - thick / 2 - k * 4, len, thick + k * 8)
    }
  }
}

/** Bar Burst: rays radiating from a point that leans toward the cursor. */
function burst(p: PatternInput) {
  const { ctx, w, h, t, scroll } = p
  const ox = w / 2 + (p.mx - w / 2) * 0.25 * p.focus
  const oy = h * 0.92
  const rays = 64
  const reach = Math.min(w, h * 1.6) * 0.62
  for (let i = 0; i < rays; i++) {
    const a = Math.PI + (i / (rays - 1)) * Math.PI
    const n = 0.5 + 0.5 * Math.sin(i * 2.3 + t * 0.9 + scroll * 6)
    const segs = 5
    for (let s = 0; s < segs; s++) {
      const r0 = reach * (0.18 + (s / segs) * 0.82)
      const len = reach * 0.1 * (0.4 + n)
      const x = ox + Math.cos(a) * r0
      const y = oy + Math.sin(a) * r0
      const k = near(x, y, p, reach * 0.5)
      ink(ctx, p.alpha * (0.12 + 0.25 * n + 0.6 * k))
      ctx.lineWidth = 2 + 4 * k + s * 0.6
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.stroke()
    }
  }
}

/** Slide Tiles: quarter-circle tiles that turn as you scroll and flip under the cursor. */
function tiles(p: PatternInput) {
  const { ctx, w, h, scroll } = p
  const size = p.cell * 2
  for (let y = 0; y < h + size; y += size) {
    for (let x = 0; x < w + size; x += size) {
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      const r = seed - Math.floor(seed)
      const k = near(x + size / 2, y + size / 2, p, size * 4)
      const quarter = Math.floor(r * 4) + Math.round(scroll * 4 * (r > 0.5 ? 1 : -1)) + (k > 0.35 ? 1 : 0)
      const a = (quarter * Math.PI) / 2
      ctx.save()
      ctx.translate(x + size / 2, y + size / 2)
      ctx.rotate(a)
      ink(ctx, p.alpha * (0.025 + 0.05 * r + 0.3 * k))
      ctx.beginPath()
      ctx.moveTo(-size / 2, -size / 2)
      ctx.arc(-size / 2, -size / 2, size * (0.92 + 0.08 * k), 0, Math.PI / 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }
}

// 'none': sections Emily wants plain black; the backdrop fades out over them.
const none = () => {}

export const patterns: Record<PatternName, (p: PatternInput) => void> = { cells, lens, rings, flow, burst, tiles, none }

/** Keeps a canvas sized to its box at the device's pixel density. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const { width, height } = canvas.getBoundingClientRect()
  const w = Math.max(1, Math.round(width * ratio))
  const h = Math.max(1, Math.round(height * ratio))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  return { w: width, h: height, ratio }
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
