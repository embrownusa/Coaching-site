import heroImage from '../assets/endurance-hero.jpg'
import { Link } from '../components/Link'
import { InkCanvas } from '../components/InkCanvas'
import { ArchShape, BloomShape, SparkShape, WaveShape } from '../components/Shapes'

export function Home() {
  return (
    <main>
      <section className="hero">
        <img src={heroImage} alt="Distance runner training on a mountain road at dawn" />
        <div className="hero-shade" />
        <SparkShape className="shape-accent hero-spark" />
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
          <Link className="button button-light" href="/contact">
            Find your coach <span>↗</span>
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <strong>17+</strong>
            <span>Years coaching</span>
          </div>
          <div>
            <strong>240</strong>
            <span>Finish lines crossed</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Individualized</span>
          </div>
        </div>
      </section>

      <section className="intro section-pad">
        <div className="section-label">01 / Who we coach</div>
        <div className="intro-copy">
          <h2>Serious about your goals. <em>Not at the expense of your life.</em></h2>
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

      <section className="disciplines">
        <article>
          <span>01</span>
          <div className="discipline-icon track-icon" />
          <h3>Track</h3>
          <p>800m · 1500m · 5K</p>
        </article>
        <article>
          <span>02</span>
          <div className="discipline-icon road-icon" />
          <h3>Road</h3>
          <p>10K · Half · Marathon</p>
        </article>
        <article>
          <span>03</span>
          <div className="discipline-icon tri-icon">△</div>
          <h3>Triathlon</h3>
          <p>Sprint · Olympic · Long course</p>
        </article>
      </section>

      <section className="ink-section section-pad">
        <BloomShape className="shape-accent ink-bloom" />
        <div className="ink-copy">
          <p className="eyebrow light">02 / Picture it</p>
          <h2>Sketch your <em>finish line.</em></h2>
          <p>
            A goal you can see is a goal you can work toward. Draw the race you are dreaming of, the
            route you love, or the time on the clock. Save it and bring it to your first
            conversation with us.
          </p>
        </div>
        <InkCanvas />
      </section>

      <section className="quote-section section-pad">
        <ArchShape className="shape-accent quote-arch" />
        <WaveShape className="shape-accent quote-wave" />
        <p className="eyebrow">The long view</p>
        <blockquote>“The best plan is the one that makes you stronger—and keeps you wanting to come back.”</blockquote>
        <Link className="button button-dark" href="/coaches">
          Meet the team <span>→</span>
        </Link>
      </section>
    </main>
  )
}
