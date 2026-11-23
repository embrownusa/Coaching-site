import heroImage from '../assets/endurance-hero.jpg'
import { Link } from '../components/Link'
import { InkCanvas } from '../components/InkCanvas'
import { PatternTile } from '../components/PatternTile'
import { ScrubText } from '../components/ScrubText'
import { SectionGuide } from '../components/SectionGuide'

const sections = [
  { id: 'start', label: 'Start' },
  { id: 'who', label: 'Who we coach' },
  { id: 'disciplines', label: 'Disciplines' },
  { id: 'picture-it', label: 'Picture it' },
  { id: 'long-view', label: 'The long view' },
]

// Training-zone tags placed around the hero, like readings on an instrument.
const readings = [
  { label: 'Zone 2 · aerobic base', top: '18%', left: '64%' },
  { label: 'Threshold', top: '30%', left: '74%' },
  { label: 'VO₂ max', top: '62%', left: '58%' },
  { label: 'Cadence 180', top: '70%', left: '84%' },
  { label: 'Recovery', top: '17%', left: '84%' },
]

export function Home() {
  return (
    <main className="home">
      <SectionGuide sections={sections} />

      <section id="start" className="hero" data-pattern="cells">
        <img src={heroImage} alt="Distance runner training on a mountain road at dawn" />
        <div className="hero-shade" />
        <div className="readings" aria-hidden="true">
          {readings.map((r) => (
            <span key={r.label} className="reading" style={{ top: r.top, left: r.left }}>
              {r.label}
            </span>
          ))}
        </div>
        <div className="hero-content">
          <p className="eyebrow light">Private endurance coaching · 800m to Ironman</p>
          <h1>
            Go farther.
            <br />
            <em>Stay yourself.</em>
          </h1>
          <p className="hero-copy">
            Thoughtful, one-to-one coaching built around your physiology, your ambition, and the life
            you actually live.
          </p>
          <Link className="button button-light" href="/book">
            <PatternTile pattern="cells" cell={7} className="btn-pattern" />
            <span className="btn-label">Book a free consultation</span> <span>↗</span>
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <strong className="stat-words">Collegiate &amp; professional coaching experience</strong>
          </div>
          <div>
            <strong className="stat-words">Science based</strong>
          </div>
          <div>
            <strong>100%</strong>
            <span>Individualized</span>
          </div>
        </div>
      </section>

      <section id="who" className="intro section-pad" data-pattern="lens">
        <div className="section-label">01 / Who we coach</div>
        <div className="intro-copy">
          <ScrubText as="h2" className="royal" text="Serious about your goals. Not at the expense of your life." accentFrom={4} />
          <p>
            We coach curious, committed athletes—from first-time half marathoners to seasoned
            triathletes—who want a smarter path forward. No templates. No noise. Just training that
            meets you where you are and evolves with you.
          </p>
          <Link className="text-link" href="/philosophy">
            Our approach <span>→</span>
          </Link>
        </div>
      </section>

      <section id="disciplines" className="disciplines" data-pattern="lens">
        {[
          { n: '01', name: 'Track', detail: '800m · 1500m · 5K', pattern: 'rings' as const },
          { n: '02', name: 'Road', detail: '10K · Half · Marathon', pattern: 'flow' as const },
          { n: '03', name: 'Triathlon', detail: 'Sprint · Olympic · Long course', pattern: 'burst' as const },
        ].map((d) => (
          <Link key={d.name} href="/coaches" className="discipline">
            <PatternTile pattern={d.pattern} cell={16} className="discipline-art" />
            <span className="discipline-n">{d.n}</span>
            <h3>{d.name}</h3>
            <p>{d.detail}</p>
            <span className="discipline-go" aria-hidden="true">Meet the coaches →</span>
          </Link>
        ))}
      </section>

      <section id="picture-it" className="ink-section section-pad" data-pattern="tiles">
        <div className="ink-copy">
          <p className="eyebrow light">02 / Picture it</p>
          <h2 className="royal">Sketch your <em>finish line.</em></h2>
          <p>
            A goal you can see is a goal you can work toward. Draw the race you are dreaming of, the
            route you love, or the time on the clock. Save it and bring it to your first
            conversation with us.
          </p>
        </div>
        <InkCanvas />
      </section>

      <section id="long-view" className="quote-section section-pad" data-pattern="burst">
        <p className="eyebrow">The long view</p>
        <ScrubText
          as="blockquote"
          className="royal"
          text="“The best plan is the one that makes you stronger—and keeps you wanting to come back.”"
        />
        <Link className="button button-dark" href="/coaches">
          <PatternTile pattern="cells" cell={7} className="btn-pattern" />
          <span className="btn-label">Meet the team</span> <span>→</span>
        </Link>
      </section>
    </main>
  )
}
