/*
 * Drives the moving shapes. It writes a few CSS variables and the CSS does the rest:
 *   :root --mx, --my       cursor position, -1..1 from the centre of the window
 *   :root --scroll         pixels scrolled
 *   [data-parallax] --p    where that element sits in the window, -1 (below) .. 1 (above)
 *   .button etc. --bx --by cursor position inside a button, for the magnetic pull
 * Nothing moves when the visitor has asked for reduced motion.
 */
export function startMotion(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const root = document.documentElement
  let mx = 0
  let my = 0
  let tx = 0
  let ty = 0
  let frame = 0
  let running = true

  const onPointer = (event: PointerEvent) => {
    tx = (event.clientX / window.innerWidth) * 2 - 1
    ty = (event.clientY / window.innerHeight) * 2 - 1
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
    // Ease toward the cursor so shapes glide instead of snapping.
    mx += (tx - mx) * 0.08
    my += (ty - my) * 0.08
    root.style.setProperty('--mx', mx.toFixed(4))
    root.style.setProperty('--my', my.toFixed(4))
    root.style.setProperty('--scroll', String(Math.round(window.scrollY)))
    const vh = window.innerHeight
    document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.bottom < -200 || rect.top > vh + 200) return
      const p = 1 - ((rect.top + rect.height / 2) / vh) * 2
      el.style.setProperty('--p', Math.max(-1.5, Math.min(1.5, p)).toFixed(4))
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
