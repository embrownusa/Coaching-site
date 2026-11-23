import { site } from '../config'
import { Link } from '../components/Link'
import { BloomShape, ButtonShape, ShapeField } from '../components/Shapes'

export function Book() {
  return (
    <main className="inner-page">
      <section className="page-hero">
        <ShapeField variant="page" />
        <p className="eyebrow">Free 20-minute consultation</p>
        <h1>Pick a time. <em>Let’s talk.</em></h1>
        <p>A relaxed conversation about your goals, your training history and your week. No pressure, no sales pitch.</p>
      </section>
      <section className="book-layout section-pad">
        <aside className="contact-aside">
          <BloomShape className="shape-accent book-bloom" />
          <p className="eyebrow light">In your consultation</p>
          <ol>
            <li><span>01</span>Where you are now: recent training, races and any injuries.</li>
            <li><span>02</span>Where you want to go: goal events, times, or simply enjoying it more.</li>
            <li><span>03</span>Which coach fits, what working together looks like, and what it costs for you.</li>
          </ol>
          <p className="contact-email">
            Already a client? Your coach arranges check-ins with you directly. <Link href="/login">Sign in</Link> to see your next one.
          </p>
        </aside>
        {site.bookingUrl ? (
          <div className="booking-frame">
            <iframe src={site.bookingUrl} title="Book a free consultation" loading="lazy" />
          </div>
        ) : (
          <div className="booking-placeholder">
            <p className="eyebrow light">Online booking coming soon</p>
            <h2>Our calendar will appear here.</h2>
            <p>
              Until then, send us a quick note with a few times that suit you and we’ll confirm a slot
              within two working days.
            </p>
            <Link className="button button-light" href="/contact?type=consultation"><ButtonShape index={6} />
              Request a consultation <span>↗</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
