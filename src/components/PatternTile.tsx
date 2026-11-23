import { useEffect, useRef } from 'react'
import { fitCanvas, patterns, reducedMotion, type PatternName } from '../patterns'

/*
 * A pattern drawn inside one element: a button, a card, a portrait.
 * Hovering moves its lens to the cursor; otherwise the lens drifts slowly.
 * It only animates while on screen.
 */
export function PatternTile({
  pattern,
  cell = 14,
  strength = 1,
  className = '',
}: {
  pattern: PatternName
  cell?: number
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')!
    const still = reducedMotion()
    const seed = Math.random() * 10
    let visible = false
    let hovering = false
    let mx = 0
    let my = 0
    let tx = 0
    let ty = 0
    let focus = 0.35
    let frame = 0
    const start = performance.now()

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      hovering = true
    }
    const onLeave = () => {
      hovering = false
    }

    const draw = (now: number) => {
      frame = 0
      const { w, h, ratio } = fitCanvas(canvas)
      const t = (now - start) / 1000 + seed
      if (!hovering) {
        tx = w * (0.5 + 0.35 * Math.sin(t * 0.5))
        ty = h * (0.5 + 0.3 * Math.cos(t * 0.37))
      }
      mx += (tx - mx) * 0.15
      my += (ty - my) * 0.15
      focus += ((hovering ? 1 : 0.35) - focus) * 0.08
      const r = host.getBoundingClientRect()
      const scroll = 1 - (r.top + r.height / 2) / window.innerHeight
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)
      patterns[pattern]({ ctx, w, h, t: still ? 0 : t, mx, my, focus, scroll, alpha: strength, cell })
      if (visible && !still) frame = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(draw)
    })
    io.observe(canvas)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    frame = requestAnimationFrame(draw)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [pattern, cell, strength])

  return <canvas ref={ref} className={`pattern-tile ${className}`} aria-hidden="true" />
}
