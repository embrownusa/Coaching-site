import { useEffect, useRef, useState } from 'react'
import startStopwatch from '../ascii/stopwatch'
import startRunner from '../ascii/runner'
import startCyclist from '../ascii/cyclist'
import stopwatchUrl from '../ascii/stopwatch.png'
import runnerUrl from '../ascii/runner.png'
import cyclistUrl from '../ascii/cyclist.png'

/*
 * Discipline page openings: an ASCII artwork with a word drawn in characters on it
 * (GO on the stopwatch, READY riding the runner's blue streak, SET in the cyclist's
 * back wheel). Pressing the word fires a starting pistol: a flash, a shock ring, and
 * the art breaking into bright pixels that blow outward while the page appears.
 */

type Scene = {
  start: (canvas: HTMLCanvasElement, url: string) => () => void
  url: string
  /** The artifact's own layout (see src/ascii/*.ts): image size and where its centre sits across the screen. */
  img: { w: number; h: number; centre: number }
  /** Where the word sits (its centre, or its right end when it drifts), and how wide it is, in image pixels. */
  at: { x: number; y: number; width: number }
  /** Narrowest the word may get on screen, so it stays readable on phones. */
  minPx?: number
  word: string
  /** READY drifts left along the streak, fading out and back in. */
  drift?: boolean
}

export const SCENES = {
  stopwatch: { start: startStopwatch, url: stopwatchUrl, img: { w: 794, h: 942, centre: 0.5 }, at: { x: 430, y: 575, width: 99 }, word: 'GO' },
  // Just behind the runner's back, on the streaks at chest height.
  runner: { start: startRunner, url: runnerUrl, img: { w: 896, h: 924, centre: 0.6 }, at: { x: 285, y: 345, width: 190 }, minPx: 118, word: 'READY', drift: true },
  // The hub of the back (disc) wheel.
  cyclist: { start: startCyclist, url: cyclistUrl, img: { w: 764, h: 778, centre: 0.6 }, at: { x: 191, y: 549, width: 120 }, word: 'SET' },
} satisfies Record<string, Scene>

// Same glyph ramp as the stopwatch artifact, from faint to dense.
const BUCKETS = [' ', ".'`", ':;,-~', '!/\\|()[]{}<>?+=', 'tfjrxnuvczil', 'XYUJCLQ0OZmwqpdbkhao', '#MW&8%B', '@$']

const GO_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif'

/** Width over height of the word as drawn, so the character grid can match its shape. */
function wordAspect(word: string) {
  const g = document.createElement('canvas').getContext('2d')!
  g.font = `900 100px ${GO_FONT}`
  const m = g.measureText(word)
  return (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)
}

/** The word sampled onto a character grid the same size as the art's, as coverage levels 0..7. */
function wordLevels(word: string, cols: number, rows: number) {
  const k = 6
  const c = document.createElement('canvas')
  c.width = cols * k
  c.height = rows * k
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.font = `900 100px ${GO_FONT}`
  const m = g.measureText(word)
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  // Stretch the letters to fill the grid exactly.
  g.setTransform(c.width / w, 0, 0, c.height / h, 0, 0)
  g.fillText(word, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent)
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

/** Where the word sits on screen, following the artifact's layout and the canvas's object-fit: contain. */
function anchorOnScreen(canvas: HTMLCanvasElement, sc: Scene) {
  const { w: IMG_W, h: IMG_H, centre } = sc.img
  const W = canvas.width
  const H = canvas.height
  let Hd = H * 0.86
  let Wd = (Hd * IMG_W) / IMG_H
  if (Wd > W * 0.62) {
    Wd = W * 0.62
    Hd = (Wd * IMG_H) / IMG_W
  }
  const X0 = W * centre - Wd / 2
  const Y0 = (H - Hd) / 2 + H * 0.01
  const box = canvas.getBoundingClientRect()
  const s = Math.min(box.width / W, box.height / H)
  const ox = (box.width - W * s) / 2
  const oy = (box.height - H * s) / 2
  const wordPx = Math.max(sc.minPx ?? 0, ((sc.at.width * Wd) / IMG_W) * s)
  return {
    x: ox + (X0 + (sc.at.x * Wd) / IMG_W) * s - (sc.drift ? wordPx / 2 : 0),
    y: oy + (Y0 + (sc.at.y * Hd) / IMG_H) * s,
    // The word spans 0.42 of this (GO on the stopwatch's dial radius); it also sets how far the burst reaches.
    r: wordPx / 0.42,
    // Screen pixels per image pixel, for the READY drift.
    k: (Wd / IMG_W) * s,
    s,
  }
}

type Anchor = { x: number; y: number; r: number; k: number; s: number }

export function AsciiStart({ scene, label, onReveal, onDone }: { scene: keyof typeof SCENES; label: string; onReveal: () => void; onDone: () => void }) {
  const sc: Scene = SCENES[scene]
  const art = useRef<HTMLCanvasElement>(null)
  const burst = useRef<HTMLCanvasElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const pos = useRef({ dx: 0 })
  const stop = useRef<() => void>(() => {})
  const [dial, setDial] = useState<Anchor | null>(null)
  const [fired, setFired] = useState(false)
  const [goArt, setGoArt] = useState('')
  const [glyph, setGlyph] = useState(1)

  // The word is drawn with characters the size of the art's own.
  useEffect(() => {
    if (!dial) return
    // On small screens the art's characters are large, so shrink the word's a little to keep the letters readable.
    const width = dial.r * 0.42
    const scale = Math.min(dial.s, width / (11 * sc.word.length * 6))
    setGlyph(scale)
    const charW = 6 * scale
    const charH = 12 * scale
    const cols = Math.round(width / charW)
    const rows = Math.max(5, Math.round(width / wordAspect(sc.word) / charH))
    const levels = wordLevels(sc.word, cols, rows)
    setGoArt(goText(levels))
    const timer = window.setInterval(() => setGoArt(goText(levels)), 260)
    return () => window.clearInterval(timer)
  }, [dial, sc.word])

  // READY rides the blue streak: it slides left with the flow, fades out, and comes back behind the runner.
  useEffect(() => {
    if (!dial || !sc.drift || fired) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = button.current
    if (!el) return
    const travel = Math.max(0, Math.min(dial.k * 420, dial.x - dial.r * 0.21 - 16))
    const period = 3.6
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = (((now - t0) / 1000) % period) / period
      const dx = -travel * p
      // In over the first fifth, gone by the end, then back at the start.
      const alpha = Math.min(1, p / 0.18) * Math.min(1, (1 - p) / 0.35)
      pos.current.dx = dx
      el.style.setProperty('--dx', `${dx}px`)
      el.style.setProperty('--fade', alpha.toFixed(3))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [dial, sc.drift, fired])

  // Run the art and keep the button on its spot.
  useEffect(() => {
    const canvas = art.current
    if (!canvas) return
    stop.current = sc.start(canvas, sc.url)
    const place = () => setDial(anchorOnScreen(canvas, sc))
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
    // Fire from wherever the word is right now (READY moves).
    const origin = { ...dial, x: dial.x + pos.current.dx }

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
        const dx = px - origin.x
        const dy = py - origin.y
        const d = Math.hypot(dx, dy) || 1
        // Closer to the pistol, faster out; a little randomness so it reads as smoke and sparks.
        const speed = (260 + Math.random() * 620) * (0.6 + 0.8 * Math.max(0, 1 - d / (origin.r * 3)))
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
        x: origin.x,
        y: origin.y,
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

      // Muzzle flash, then a shock ring rolling out from the origin.
      if (t < 0.22) {
        ctx.fillStyle = `rgba(255, 250, 235, ${0.85 * (1 - t / 0.22)})`
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }
      if (t < 0.9) {
        const k = t / 0.9
        ctx.strokeStyle = `rgba(120, 175, 255, ${0.7 * (1 - k)})`
        ctx.lineWidth = 6 * (1 - k) + 1
        ctx.beginPath()
        ctx.arc(origin.x, origin.y, origin.r * 0.2 + k * maxR * 0.7, 0, Math.PI * 2)
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
    <div className={`track-start scene-${scene} ${fired ? 'is-fired' : ''}`}>
      <canvas ref={art} className="ascii-canvas" role="img" aria-label={label} />
      {dial && (
        <button
          ref={button}
          type="button"
          className={`go-button${sc.drift ? ' is-drifting' : ''}`}
          onClick={fire}
          aria-label={`${sc.word[0]}${sc.word.slice(1).toLowerCase()}: open the page`}
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
