import { PatternTile } from '../components/PatternTile'
import { ScrubText } from '../components/ScrubText'
import { coaches } from '../content'
import { Link } from '../components/Link'

export function Coaches() {
  return (
    <main className="inner-page">
      <section className="page-hero" data-pattern="cells">
        <p className="eyebrow">The people in your corner</p>
        <h1>Coaching is personal. <em>So are we.</em></h1>
        <p>Experienced athletes, attentive listeners, and students of the sport.</p>
      </section>
      <section className="coach-grid section-pad">
        {coaches.map((coach, index) => (
          <article className="coach-card" key={coach.name}>
            <div className={`coach-portrait portrait-${index + 1}`}>
              <PatternTile pattern={index % 2 ? 'lens' : 'cells'} cell={18} className="portrait-pattern" />
              <span>{coach.initials}</span>
              <small>{coach.specialty}</small>
            </div>
            <p className="eyebrow">{coach.role}</p>
            <h2>{coach.name}</h2>
            <p className="bio">{coach.bio}</p>
            <ul>
              {coach.credentials.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link className="text-link coach-link" href={`/contact?coach=${encodeURIComponent(coach.name)}`}>
              Train with {coach.name.split(' ')[0]} <span>→</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="statement">
        <ScrubText as="p" text="One athlete. One coach. One evolving conversation." />
      </section>
    </main>
  )
}
