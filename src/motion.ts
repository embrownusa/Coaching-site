/*
 * Small scroll and cursor effects, written as CSS variables:
 *   [data-scrub] --progress   0..1 as the element scrolls through the screen
 *   .button etc. --bx --by    cursor position inside a button, for a gentle pull
 * Nothing moves when the visitor has asked for reduced motion.
 */
export function startMotion(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => el.style.setProperty('--progress', '1'))
    return () => {}
  }

  let frame = 0
  let running = true

  const onPointer = (event: PointerEvent) => {
    const target = (event.target as Element | null)?.closest?.('.button, .nav-cta, .circle-link') as HTMLElement | null
    document.querySelectorAll<HTMLElement>('.is-magnet').forEach((el) => {
      if (el !== target) {
        el.classList.remove('is-magnet')
        el.style.removeProperty('--bx')
        el.style.removeProperty('--by')
      }
    })
    if (target) {
      const rect = target.getBoundingClientRect()
      target.classList.add('is-magnet')
      target.style.setProperty('--bx', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3))
      target.style.setProperty('--by', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3))
    }
  }

  const tick = () => {
    if (!running) return
    const vh = window.innerHeight
    document.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => {
      const r = el.getBoundingClientRect()
      // 0 when the top enters the lower part of the screen, 1 when it reaches the upper third.
      const p = (vh * 0.9 - r.top) / (vh * 0.55)
      el.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3))
    })
    frame = requestAnimationFrame(tick)
  }

  window.addEventListener('pointermove', onPointer, { passive: true })
  frame = requestAnimationFrame(tick)
  return () => {
    running = false
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onPointer)
  }
}
