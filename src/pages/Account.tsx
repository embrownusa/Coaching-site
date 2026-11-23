import { useEffect } from 'react'
import { AUTH_DEMO, signOut, useUser } from '../auth'
import { site } from '../config'
import { Link } from '../components/Link'
import { navigate } from '../router'

// Sample data for preview mode. Once a login service is connected, this comes
// from each client's own record.
const week = [
  ['Mon', 'Rest or easy mobility', ''],
  ['Tue', 'Intervals', '6 × 800m at 10K effort, 2 min jog'],
  ['Wed', 'Easy run', '45 min conversational'],
  ['Thu', 'Strength', '30 min, coach’s routine'],
  ['Fri', 'Easy run + strides', '35 min + 6 × 20s'],
  ['Sat', 'Long run', '90 min, last 20 at marathon effort'],
  ['Sun', 'Recovery', '30 min very easy or rest'],
]

export function Account() {
  const user = useUser()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  if (!user) return null

  return (
    <main className="inner-page account-page">
      <section className="page-hero account-hero">
        <p className="eyebrow">Client area</p>
        <h1>Hi, <em>{user.name.split(' ')[0]}.</em></h1>
        <p>Here’s your week. Log how each session felt so your coach can adjust the plan.</p>
        {AUTH_DEMO && <p className="demo-note">Preview mode: this is sample training data.</p>}
      </section>
      <section className="account-grid section-pad">
        <div className="account-panel week-panel">
          <p className="eyebrow light">This week</p>
          <ul className="week-list">
            {week.map(([day, title, detail]) => (
              <li key={day}>
                <span>{day}</span>
                <div>
                  <strong>{title}</strong>
                  {detail && <small>{detail}</small>}
                </div>
                <label className="done-box">
                  <input type="checkbox" aria-label={`Mark ${day} done`} />
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="account-side">
          <div className="account-panel">
            <p className="eyebrow light">Next check-in</p>
            <h2>Thursday, 6:30 pm</h2>
            <p>Video call with your coach · 30 min</p>
            <Link className="text-link" href="/book">Reschedule or book another <span>→</span></Link>
          </div>
          <div className="account-panel">
            <p className="eyebrow light">From your coach</p>
            <p className="coach-note">
              “Great consistency last week. Keep Wednesday truly easy so Saturday’s long run feels strong.”
            </p>
            <a className="text-link" href={`mailto:${site.email}?subject=Training question`}>Message your coach <span>→</span></a>
          </div>
          <div className="account-panel">
            <p className="eyebrow light">Plan & billing</p>
            <h2>Monthly Coaching</h2>
            {site.stripePortalUrl ? (
              <a className="text-link" href={site.stripePortalUrl}>Manage billing <span>→</span></a>
            ) : (
              <Link className="text-link" href="/plans">View plans <span>→</span></Link>
            )}
          </div>
          <button className="sign-out" onClick={() => signOut().then(() => navigate('/'))}>Sign out</button>
        </div>
      </section>
    </main>
  )
}
