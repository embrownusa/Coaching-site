import { useEffect, useState } from 'react'
import { Link } from './Link'

/*
 * Instrument-panel chrome for the home page, after byotone.com:
 * a numbered guide to the sections, a scroll gauge on the right edge,
 * and a status strip with a live "scroll pace" readout.
 */
export function SectionGuide({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [pace, setPace] = useState<string>('—:——')

  useEffect(() => {
    let lastY = window.scrollY
    let lastT = performance.now()
    let speed = 0
    let frame = 0
    const tick = (now: number) => {
      const y = window.scrollY
      const dt = Math.max(16, now - lastT)
      const v = Math.abs(y - lastY) / (dt / 1000)
      speed += (v - speed) * 0.08
      lastY = y
      lastT = now
      // Faster scrolling reads as a quicker pace per kilometre.
      if (speed < 30) setPace('—:——')
      else {
        const secs = Math.round(Math.max(170, Math.min(600, 640 - speed * 0.35)))
        setPace(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`)
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? y / max : 0)
      const mid = window.innerHeight * 0.45
      let idx = 0
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= mid) idx = i
      })
      setActive(idx)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [sections])

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <nav className="section-guide" aria-label="Sections on this page">
        {sections.map((s, i) => (
          <button key={s.id} className={i === active ? 'active' : ''} onClick={() => jump(s.id)} aria-current={i === active}>
            <span className="node">{String(i + 1).padStart(2, '0')}</span>
            <span className="label">{s.label}</span>
          </button>
        ))}
      </nav>
      <div className="scroll-gauge" aria-hidden="true">
        <i style={{ transform: `translateY(${progress * 400}%)` }} />
      </div>
      <div className="status-strip">
        <Link className="status-chip" href="/book">
          <span className="pulse" aria-hidden="true" /> Free 20-min consultation
        </Link>
        <p className="pace-readout" aria-hidden="true">
          Scroll pace <strong>{pace}</strong> /km
        </p>
      </div>
    </>
  )
}
