import { useState, type FormEvent } from 'react'
import { articles } from '../content'
import { Link } from '../components/Link'
import { resourceShapes } from '../components/Shapes'
import { submitForm } from '../forms'
import { NotFound } from './NotFound'

function ResourceArt({ index }: { index: number }) {
  const Shape = resourceShapes[index % resourceShapes.length]
  return (
    <div className={`resource-art art-${index + 1}`}>
      <span>0{index + 1}</span>
      <Shape className="resource-shape" />
    </div>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'mailto' | 'error'>('idle')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const result = await submitForm('newsletter', 'Newsletter sign-up', { email })
      setStatus(result === 'sent' ? 'done' : 'mailto')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">Occasional notes, thoughtfully sent</p>
        <h2>Keep the conversation going.</h2>
        {status === 'done' && <p className="form-note" role="status">Thanks. You’re on the list.</p>}
        {status === 'mailto' && <p className="form-note" role="status">Your email app should open to finish signing up.</p>}
        {status === 'error' && <p className="form-note" role="alert">Something went wrong. Please try again.</p>}
      </div>
      <form onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Joining…' : 'Join the list →'}
        </button>
      </form>
    </section>
  )
}

export function Resources() {
  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))]
  const [filter, setFilter] = useState('All')
  const shown = articles.map((a, index) => ({ ...a, index })).filter((a) => filter === 'All' || a.category === filter)

  return (
    <main className="inner-page resources-page">
      <section className="page-hero">
        <p className="eyebrow">Field notes</p>
        <h1>Ideas for the <em>long run.</em></h1>
        <p>Practical thinking on training, racing, recovery, and the athlete’s life.</p>
      </section>
      <div className="resource-filters section-pad" role="group" aria-label="Filter by topic">
        {categories.map((category) => (
          <button
            key={category}
            className={filter === category ? 'active' : ''}
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <section className="resource-grid section-pad">
        {shown.map((article) => (
          <article key={article.slug}>
            <Link href={`/resources/${article.slug}`} className="resource-card-link" aria-label={article.title}>
              <ResourceArt index={article.index} />
            </Link>
            <p className="eyebrow">{article.category} · {article.time}</p>
            <h2>{article.title}</h2>
            <Link className="read-link" href={`/resources/${article.slug}`}>
              Read note <span>→</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="consultation">
        <div className="consultation-orbit" aria-hidden="true">
          <span>01</span>
        </div>
        <div className="consultation-copy">
          <p className="eyebrow">Start with a conversation</p>
          <h2>Not sure what kind of coaching fits?</h2>
          <p>
            Request a complimentary consultation. We’ll talk through your goals, training history,
            and current schedule—then help you decide on the right next step.
          </p>
        </div>
        <Link className="button button-light" href="/book">
          Book a free consultation <span>↗</span>
        </Link>
      </section>
      <Newsletter />
    </main>
  )
}

export function ArticlePage({ slug }: { slug: string }) {
  const index = articles.findIndex((a) => a.slug === slug)
  if (index === -1) return <NotFound />
  const article = articles[index]
  const next = articles[(index + 1) % articles.length]

  return (
    <main className="inner-page article-page">
      <section className="page-hero">
        <p className="eyebrow">{article.category} · {article.time}</p>
        <h1>{article.title}</h1>
      </section>
      <article className="article-body section-pad">
        <ResourceArt index={index} />
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="article-nav">
          <Link className="text-link" href="/resources">← All field notes</Link>
          <Link className="text-link" href={`/resources/${next.slug}`}>
            Next: {next.title} <span>→</span>
          </Link>
        </div>
      </article>
    </main>
  )
}
