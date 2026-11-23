import { useEffect, useRef } from 'react'
import { fitCanvas, patterns, reducedMotion, type PatternName } from '../patterns'

/*
 * The live backdrop behind the whole site. Each section names its pattern with
 * data-pattern="…"; as you scroll, the backdrop cross-fades to the pattern of
 * the section in the middle of the screen, and every pattern bends around the
 * cursor. With no cursor (phones), the lens drifts slowly on its own.
 */
export function PatternField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const still = reducedMotion()
    let current: PatternName = 'cells'
    let previous: PatternName | null = null
    let fade = 1
    let mx = window.innerWidth * 0.65
    let my = window.innerHeight * 0.4
    let tx = mx
    let ty = my
    let lastMove = -1e9
    let focus = 0.6
    let frame = 0
    const start = performance.now()

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      lastMove = performance.now()
    }

    const pick = () => {
      const mid = window.innerHeight * 0.45
      const sections = document.querySelectorAll<HTMLElement>('[data-pattern]')
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) {
          return { name: s.dataset.pattern as PatternName, progress: (mid - r.top) / Math.max(r.height, 1) }
        }
      }
      return null
    }

    const draw = (now: number) => {
      const { w, h, ratio } = fitCanvas(canvas)
      const t = (now - start) / 1000
      const active = pick()
      if (active && active.name !== current && patterns[active.name]) {
        previous = current
        current = active.name
        fade = still ? 1 : 0
      }
      fade = Math.min(1, fade + 0.04)

      const idle = now - lastMove > 2500
      if (idle) {
        // Wander slowly so the page still breathes without a cursor.
        tx = w * (0.5 + 0.3 * Math.sin(t * 0.21))
        ty = h * (0.45 + 0.25 * Math.sin(t * 0.17 + 1.3))
      }
      mx += (tx - mx) * (idle ? 0.02 : 0.12)
      my += (ty - my) * (idle ? 0.02 : 0.12)
      focus += ((idle ? 0.55 : 1) - focus) * 0.05

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const cell = w < 700 ? 26 : 34
      const base = { ctx, w, h, t: still ? 0 : t, mx, my, focus, scroll: active?.progress ?? 0, cell }
      if (previous && fade < 1) patterns[previous]({ ...base, alpha: 1 - fade })
      patterns[current]({ ...base, alpha: fade })

      if (!still) frame = requestAnimationFrame(draw)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    const redraw = () => still && requestAnimationFrame(draw)
    window.addEventListener('scroll', redraw, { passive: true })
    window.addEventListener('resize', redraw)
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', redraw)
      window.removeEventListener('resize', redraw)
    }
  }, [])

  return <canvas ref={ref} className="pattern-field" aria-hidden="true" />
}
