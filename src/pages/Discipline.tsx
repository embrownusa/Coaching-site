import { useEffect, useRef, useState } from 'react'
import { Link } from '../components/Link'
import { PatternTile } from '../components/PatternTile'
import { coaches, disciplines } from '../content'
import type { DisciplineSlug } from '../router'
import stopwatchUrl from '../ascii/stopwatch.png'
import runnerUrl from '../ascii/runner.png'
import cyclistUrl from '../ascii/cyclist.png'

const art = {
  stopwatch: { load: () => import('../ascii/stopwatch'), image: stopwatchUrl },
  runner: { load: () => import('../ascii/runner'), image: runnerUrl },
  cyclist: { load: () => import('../ascii/cyclist'), image: cyclistUrl },
}

/** The full-screen ASCII animation that opens each discipline page. */
function AsciiStage({ kind, label }: { kind: keyof typeof art; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // The animation lays itself out for the window size, so start it again when the width changes.
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    let timer = 0
    const onResize = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => setWidth(window.innerWidth), 400)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    art[kind].load().then(({ default: start }) => {
      if (!cancelled && canvas.current) stop = start(canvas.current, art[kind].image)
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [kind, width])

  return <canvas key={width} ref={canvas} className="ascii-canvas" role="img" aria-label={label} />
}

export function Discipline({ slug }: { slug: DisciplineSlug }) {
  const d = disciplines[slug]
  const stage = useRef<HTMLElement>(null)

  // The menu stays out of the way on the opening screen and slides in once you scroll.
  useEffect(() => {
    const shell = document.querySelector('.site-shell')
    const update = () => {
      const past = (stage.current?.getBoundingClientRect().bottom ?? 0) < window.innerHeight * 0.55
      shell?.classList.toggle('past-stage', past)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      shell?.classList.remove('past-stage')
    }
  }, [])

  const team = coaches.filter((c) => d.coaches.includes(c.name))

  return (
    <main className="discipline-page">
      <section ref={stage} className="ascii-stage">
        <AsciiStage kind={d.art} label={d.artLabel} />
        <a className="stage-cue" href="#discipline-intro" onClick={(e) => {
          e.preventDefault()
          document.getElementById('discipline-intro')?.scrollIntoView({ behavior: 'smooth' })
        }}>
          <span>{d.n} / {d.name}</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section id="discipline-intro" className="discipline-intro">
        <p className="eyebrow">{d.n} / {d.name} · {d.events}</p>
        <h1>{d.headline}</h1>
        <p className="discipline-lead">{d.intro}</p>
      </section>

      <section className="discipline-focus">
        {d.focus.map(([title, text], i) => (
          <article key={title}>
            <span className="discipline-n">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="discipline-team">
        <p className="eyebrow">Your {d.name.toLowerCase()} coach{team.length > 1 ? 'es' : ''}</p>
        <div>
          {team.map((c) => (
            <Link key={c.name} className="discipline-coach" href={`/contact?coach=${encodeURIComponent(c.name)}`}>
              <strong>{c.name}</strong>
              <span>{c.role}</span>
              <span className="discipline-go">Train with {c.name.split(' ')[0]} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="discipline-cta">
        <h2>Start with a conversation.</h2>
        <p>A free 20-minute consultation to talk through your racing, your week and your goals.</p>
        <Link className="button button-light" href="/book">
          <PatternTile pattern="cells" cell={7} className="btn-pattern" />
          <span className="btn-label">Book a free consultation</span> <span>↗</span>
        </Link>
      </section>
    </main>
  )
}
