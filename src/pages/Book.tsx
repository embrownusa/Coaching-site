import { site } from '../config'
import { Link } from '../components/Link'
import { BloomShape } from '../components/Shapes'

export function Book() {
  return (
    <main className="inner-page">
      <section className="page-hero">
        <p className="eyebrow">Free 20-minute call</p>
        <h1>Pick a time. <em>Let’s talk.</em></h1>
        <p>A relaxed conversation about your goals, your training history and your week. No pressure, no sales pitch.</p>
      </section>
      <section className="book-layout section-pad">
        <aside className="contact-aside">
          <BloomShape className="shape-accent book-bloom" />
          <p className="eyebrow light">On the call</p>
          <ol>
            <li><span>01</span>Where you are now: recent training, races and any injuries.</li>
            <li><span>02</span>Where you want to go: goal events, times, or simply enjoying it more.</li>
            <li><span>03</span>Which coach and plan fits, and what working together looks like.</li>
          </ol>
          <p className="contact-email">
            Already a client? <Link href="/login">Sign in</Link> to book your check-ins.
          </p>
        </aside>
        {site.bookingUrl ? (
          <div className="booking-frame">
            <iframe src={site.bookingUrl} title="Book a call" loading="lazy" />
          </div>
        ) : (
          <div className="booking-placeholder">
            <p className="eyebrow light">Online booking coming soon</p>
            <h2>Our calendar will appear here.</h2>
            <p>
              Until then, send us a quick note with a few times that suit you and we’ll confirm a slot
              within two working days.
            </p>
            <Link className="button button-light" href="/contact?type=consultation">
              Request a call <span>↗</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
