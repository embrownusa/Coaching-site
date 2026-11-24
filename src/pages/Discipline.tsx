import { useEffect, useRef, useState } from 'react'
import { Link } from '../components/Link'
import { GlassLink, refreshGlass } from '../components/GlassLink'
import { PatternTile } from '../components/PatternTile'
import { AsciiStart } from '../components/AsciiStart'
import { coaches, disciplines } from '../content'
import type { DisciplineSlug } from '../router'

export function Discipline({ slug }: { slug: DisciplineSlug }) {
  // Each page opens on its ASCII art with a word to press (GO, READY, SET) that fires the starting pistol.
  return <InteractiveDiscipline slug={slug} />
}

function InteractiveDiscipline({ slug }: { slug: DisciplineSlug }) {
  const [phase, setPhase] = useState<'start' | 'revealing' | 'done'>('start')
  const [run, setRun] = useState(0)

  // Hold the page still and hide the menu until the start has been fired.
  useEffect(() => {
    const shell = document.querySelector('.site-shell')
    const root = document.documentElement
    if (phase === 'start') {
      window.scrollTo(0, 0)
      root.style.overflow = 'hidden'
      shell?.classList.remove('past-stage')
    } else {
      root.style.overflow = ''
      shell?.classList.add('past-stage')
    }
    // Once the page has faded in, the glass button needs a fresh look at it.
    if (phase === 'done') refreshGlass(300)
    return () => {
      root.style.overflow = ''
      shell?.classList.remove('past-stage')
    }
  }, [phase])

  return (
    <main className={`discipline-page is-interactive phase-${phase}`}>
      {phase !== 'done' && (
        <AsciiStart key={run} scene={disciplines[slug].art} label={disciplines[slug].artLabel} onReveal={() => setPhase('revealing')} onDone={() => setPhase('done')} />
      )}
      <DisciplineBody slug={slug} />
      {phase === 'done' && (
        <button
          type="button"
          className="replay-start"
          onClick={() => {
            setRun((n) => n + 1)
            setPhase('start')
          }}
        >
          ↺ Replay the start
        </button>
      )}
    </main>
  )
}

function DisciplineBody({ slug }: { slug: DisciplineSlug }) {
  const d = disciplines[slug]
  const team = coaches.filter((c) => d.coaches.includes(c.name))
  return (
    <div className="discipline-body">

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
        <GlassLink className="button button-light" href="/book">
          <span className="btn-label">Book a free consultation</span> <span>↗</span>
        </GlassLink>
      </section>
    </div>
  )
}
