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

const GO_ART = [
  ' .d8888b.   .d88888b.  ',
  'd88P  Y88b d88P" "Y88b ',
  '888    888 888     888 ',
  '888        888     888 ',
  '888  88888 888     888 ',
  '888    888 888     888 ',
  'Y88b  d88P Y88b. .d88P ',
  ' "Y8888P88  "Y88888P"  ',
].join('\n')

const COLORS = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#00c7be', '#2f7bff', '#5e5ce6', '#bf5af2', '#ff2d92', '#ffffff']

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
  }
}

export function TrackStart({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const art = useRef<HTMLCanvasElement>(null)
  const burst = useRef<HTMLCanvasElement>(null)
  const stop = useRef<() => void>(() => {})
  const [dial, setDial] = useState<{ x: number; y: number; r: number } | null>(null)
  const [fired, setFired] = useState(false)

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
          color: COLORS[(Math.random() * COLORS.length) | 0],
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
        color: COLORS[(Math.random() * COLORS.length) | 0],
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
        ctx.strokeStyle = `rgba(255, 214, 10, ${0.7 * (1 - k)})`
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
          style={{ left: dial.x, top: dial.y, fontSize: Math.max(7, (dial.r * 1.25) / 13.5) }}
        >
          <pre aria-hidden="true">{GO_ART}</pre>
          <span className="go-hint">Tap to start</span>
        </button>
      )}
      <canvas ref={burst} className="burst-canvas" aria-hidden="true" />
    </div>
  )
}
