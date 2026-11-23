import { plans } from '../content'
import { stripeLinks } from '../config'
import { Link } from '../components/Link'

export function Plans() {
  return (
    <main className="inner-page plans-page">
      <section className="page-hero">
        <p className="eyebrow">Coaching plans</p>
        <h1>Find your <em>fit.</em></h1>
        <p>Every plan is one-to-one and built around you. Not sure which is right? Start with a free call.</p>
      </section>
      <section className="plan-grid section-pad">
        {plans.map((plan) => {
          const checkout = stripeLinks[plan.id]
          return (
            <article key={plan.id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <p className="plan-badge">Most chosen</p>}
              <p className="eyebrow">{plan.name}</p>
              <p className="plan-price">
                {plan.price} <span>{plan.cadence}</span>
              </p>
              <p className="plan-summary">{plan.summary}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              {checkout ? (
                <a className="button button-light" href={checkout}>
                  Get started <span>↗</span>
                </a>
              ) : (
                <Link className="button button-light" href={`/contact?plan=${plan.id}`}>
                  Get started <span>↗</span>
                </Link>
              )}
            </article>
          )
        })}
      </section>
      <section className="plans-note section-pad">
        <p>
          Payments are handled securely by Stripe. Monthly coaching can be paused or cancelled any time
          from your client area.
        </p>
        <Link className="text-link" href="/book">Book a free call first <span>→</span></Link>
      </section>
    </main>
  )
}
