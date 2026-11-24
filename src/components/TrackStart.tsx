import { useEffect, useRef, useState } from 'react'
import startStopwatch from '../ascii/stopwatch'
import stopwatchUrl from '../ascii/stopwatch.png'

/*
 * Track page opening: the ASCII stopwatch with "GO" on its dial. Pressing GO
 * fires a starting pistol: a flash, a shock ring, and the stopwatch breaking
 * into bright pixels that blow outward while the page underneath appears.
 */

// The stopwatch artifact's own layout (see src/ascii/stopwatch.ts): image size and dial.
const IMG_W = 794
const IMG_H = 942
const DIAL = { cx: 430, cy: 575, R: 236 }

// Same glyph ramp as the stopwatch artifact, from faint to dense.
const BUCKETS = [' ', ".'`", ':;,-~', '!/\\|()[]{}<>?+=', 'tfjrxnuvczil', 'XYUJCLQ0OZmwqpdbkhao', '#MW&8%B', '@$']

const GO_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif'

/** Width over height of the letters "GO" as drawn, so the character grid can match their shape. */
function goAspect() {
  const g = document.createElement('canvas').getContext('2d')!
  g.font = `900 100px ${GO_FONT}`
  const m = g.measureText('GO')
  return (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)
}

/** "GO" sampled onto a character grid the same size as the stopwatch's, as coverage levels 0..7. */
function goLevels(cols: number, rows: number) {
  const k = 6
  const c = document.createElement('canvas')
  c.width = cols * k
  c.height = rows * k
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.font = `900 100px ${GO_FONT}`
  const m = g.measureText('GO')
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  // Stretch the letters to fill the grid exactly.
  g.setTransform(c.width / w, 0, 0, c.height / h, 0, 0)
  g.fillText('GO', m.actualBoundingBoxLeft, m.actualBoundingBoxAscent)
  const d = g.getImageData(0, 0, c.width, c.height).data
  const levels: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let q = 0; q < cols; q++) {
      let sum = 0
      for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) sum += d[((r * k + y) * c.width + q * k + x) * 4 + 3]
      const cover = sum / (k * k * 255)
      row.push(cover < 0.12 ? 0 : Math.min(7, 2 + Math.floor(cover * 6)))
    }
    levels.push(row)
  }
  return levels
}

/** Turns coverage levels into text, picking a fresh glyph in each level so it shimmers like the art. */
function goText(levels: number[][]) {
  return levels
    .map((row) => row.map((l) => BUCKETS[l][(Math.random() * BUCKETS[l].length) | 0]).join(''))
    .join('\n')
}

// Shades of blue, with the odd red fleck.
const BLUES = ['#06246e', '#0a3aa8', '#1249c9', '#1d5fd1', '#2f7bff', '#4b8dff', '#6aa6ff', '#8fbfff', '#b8d6ff', '#dbeaff', '#1e90ff', '#3a6fd8']
const pickColor = () => (Math.random() < 0.035 ? (Math.random() < 0.5 ? '#ff3b30' : '#e0222b') : BLUES[(Math.random() * BLUES.length) | 0])

type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; spin: number }

/** Where the dial sits on screen, following the artifact's layout and the canvas's object-fit: contain. */
function dialOnScreen(canvas: HTMLCanvasElement) {
  const W = canvas.width
  const H = canvas.height
  let Hd = H * 0.86
  let Wd = (Hd * IMG_W) / IMG_H
  if (Wd > W * 0.62) {
    Wd = W * 0.62
    Hd = (Wd * IMG_H) / IMG_W
  }
  const X0 = W * 0.5 - Wd / 2
  const Y0 = (H - Hd) / 2 + H * 0.01
  const box = canvas.getBoundingClientRect()
  const s = Math.min(box.width / W, box.height / H)
  const ox = (box.width - W * s) / 2
  const oy = (box.height - H * s) / 2
  return {
    x: ox + (X0 + (DIAL.cx * Wd) / IMG_W) * s,
    y: oy + (Y0 + (DIAL.cy * Hd) / IMG_H) * s,
    r: ((DIAL.R * Wd) / IMG_W) * s,
    s,
  }
}

export function TrackStart({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const art = useRef<HTMLCanvasElement>(null)
  const burst = useRef<HTMLCanvasElement>(null)
  const stop = useRef<() => void>(() => {})
  const [dial, setDial] = useState<{ x: number; y: number; r: number; s: number } | null>(null)
  const [fired, setFired] = useState(false)
  const [goArt, setGoArt] = useState('')
  const [glyph, setGlyph] = useState(1)

  // GO spans about 0.42 of the dial radius (a third of the first try), drawn with characters the size of the stopwatch's own.
  useEffect(() => {
    if (!dial) return
    // On small screens the art's characters are large, so shrink GO's a little to keep the letters readable.
    const width = dial.r * 0.42
    const scale = Math.min(dial.s, width / (22 * 6))
    setGlyph(scale)
    const charW = 6 * scale
    const charH = 12 * scale
    const cols = Math.round(width / charW)
    const rows = Math.max(5, Math.round(width / goAspect() / charH))
    const levels = goLevels(cols, rows)
    setGoArt(goText(levels))
    const timer = window.setInterval(() => setGoArt(goText(levels)), 260)
    return () => window.clearInterval(timer)
  }, [dial])

  // Run the stopwatch and keep the GO button on its dial.
  useEffect(() => {
    const canvas = art.current
    if (!canvas) return
    stop.current = startStopwatch(canvas, stopwatchUrl)
    const place = () => setDial(dialOnScreen(canvas))
    place()
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('resize', place)
      stop.current()
    }
  }, [])

  const fire = () => {
    if (fired) return
    setFired(true)
    stop.current()
    const canvas = art.current
    const fx = burst.current
    if (!canvas || !fx || !dial) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      onReveal()
      window.setTimeout(onDone, 300)
      return
    }

    // Turn the last frame of the stopwatch into particles.
    const box = canvas.getBoundingClientRect()
    const W = canvas.width
    const H = canvas.height
    const s = Math.min(box.width / W, box.height / H)
    const ox = (box.width - W * s) / 2
    const oy = (box.height - H * s) / 2
    const data = canvas.getContext('2d')!.getImageData(0, 0, W, H).data
    const step = Math.max(3, Math.round(4 / s))
    const parts: Particle[] = []
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const k = (y * W + x) * 4
        const lum = data[k] + data[k + 1] + data[k + 2]
        if (lum < 140) continue
        const px = ox + x * s
        const py = oy + y * s
        const dx = px - dial.x
        const dy = py - dial.y
        const d = Math.hypot(dx, dy) || 1
        // Closer to the pistol, faster out; a little randomness so it reads as smoke and sparks.
        const speed = (260 + Math.random() * 620) * (0.6 + 0.8 * Math.max(0, 1 - d / (dial.r * 3)))
        const a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9
        parts.push({
          x: px,
          y: py,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 60,
          size: 2 + Math.random() * 3,
          color: pickColor(),
          life: 0.9 + Math.random() * 0.9,
          spin: Math.random() * 6,
        })
      }
    }
    // Sparks straight from the muzzle.
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = 500 + Math.random() * 900
      parts.push({
        x: dial.x,
        y: dial.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 2 + Math.random() * 2.5,
        color: pickColor(),
        life: 0.6 + Math.random() * 0.8,
        spin: 0,
      })
    }
    // Keep it smooth on slower phones.
    while (parts.length > 9000) parts.splice((Math.random() * parts.length) | 0, 1)

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    fx.width = window.innerWidth * ratio
    fx.height = window.innerHeight * ratio
    const ctx = fx.getContext('2d')!
    ctx.scale(ratio, ratio)
    const t0 = performance.now()
    let last = t0
    let revealed = false
    const maxR = Math.hypot(window.innerWidth, window.innerHeight)

    const frame = (now: number) => {
      // rAF can hand back a timestamp from just before the click, so never let time run backwards.
      const t = Math.max(0, (now - t0) / 1000)
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Muzzle flash, then a shock ring rolling out from the dial.
      if (t < 0.22) {
        ctx.fillStyle = `rgba(255, 250, 235, ${0.85 * (1 - t / 0.22)})`
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }
      if (t < 0.9) {
        const k = t / 0.9
        ctx.strokeStyle = `rgba(120, 175, 255, ${0.7 * (1 - k)})`
        ctx.lineWidth = 6 * (1 - k) + 1
        ctx.beginPath()
        ctx.arc(dial.x, dial.y, dial.r * 0.2 + k * maxR * 0.7, 0, Math.PI * 2)
        ctx.stroke()
      }

      let alive = 0
      for (const p of parts) {
        if (t > p.life) continue
        alive++
        p.vx *= 1 - 1.6 * dt
        p.vy = p.vy * (1 - 1.6 * dt) + 120 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        const fade = 1 - t / p.life
        ctx.globalAlpha = Math.max(0, fade)
        ctx.fillStyle = p.color
        const size = p.size * (0.6 + 0.4 * fade)
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1

      if (!revealed && t > 0.25) {
        revealed = true
        onReveal()
      }
      if (alive > 0 && t < 2.2) requestAnimationFrame(frame)
      else onDone()
    }
    requestAnimationFrame(frame)
  }

  return (
    <div className={`track-start ${fired ? 'is-fired' : ''}`}>
      <canvas
        ref={art}
        className="ascii-canvas"
        role="img"
        aria-label="A stopwatch drawn in ASCII characters, with a blue seconds hand sweeping the dial"
      />
      {dial && (
        <button
          type="button"
          className="go-button"
          onClick={fire}
          aria-label="Go: start the Track page"
          style={{ left: dial.x, top: dial.y, fontSize: 10 * glyph, lineHeight: `${12 * glyph}px` }}
        >
          <pre aria-hidden="true">{goArt}</pre>
          <span className="go-hint">Tap to start</span>
        </button>
      )}
      <canvas ref={burst} className="burst-canvas" aria-hidden="true" />
    </div>
  )
}
