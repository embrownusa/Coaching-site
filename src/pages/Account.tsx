import { useEffect, useState } from 'react'
import { AUTH_DEMO, signOut, useUser } from '../auth'
import { loadClientArea, setSessionDone, type ClientArea } from '../clientData'
import { site } from '../config'
import { Link } from '../components/Link'
import { navigate } from '../router'

const dayLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })
const whenLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })

export function Account() {
  const user = useUser()
  const [area, setArea] = useState<ClientArea | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (user === null) navigate('/login')
    if (!user) return
    loadClientArea(user).then(setArea).catch(() => setError(true))
  }, [user])

  if (!user) return null

  const toggle = async (id: number, completed: boolean) => {
    if (!area) return
    setArea({ ...area, week: area.week.map((s) => (s.id === id ? { ...s, completed } : s)) })
    try {
      await setSessionDone(id, completed)
    } catch {
      setArea({ ...area })
    }
  }

  return (
    <main className="inner-page account-page">
      <section className="page-hero account-hero">
        <p className="eyebrow">Client area</p>
        <h1>Hi, <em>{(area?.name ?? user.name).split(' ')[0]}.</em></h1>
        <p>Here’s your week. Tick off each session so your coach can see how it’s going.</p>
        {AUTH_DEMO && <p className="demo-note">Preview mode: this is sample training data.</p>}
      </section>
      {error ? (
        <section className="section-pad">
          <p className="form-note" role="alert">We couldn’t load your training just now. Please refresh to try again.</p>
        </section>
      ) : !area ? (
        <section className="section-pad"><p className="login-copy">Loading your training…</p></section>
      ) : (
        <section className="account-grid section-pad">
          <div className="account-panel week-panel">
            <p className="eyebrow light">This week</p>
            {area.week.length === 0 ? (
              <p className="login-copy">Your coach hasn’t posted this week’s sessions yet. Check back soon.</p>
            ) : (
              <ul className="week-list">
                {area.week.map((s) => (
                  <li key={s.id} className={s.completed ? 'done' : ''}>
                    <span>{dayLabel(s.day)}</span>
                    <div>
                      <strong>{s.title}</strong>
                      {s.detail && <small>{s.detail}</small>}
                    </div>
                    <label className="done-box">
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={(e) => toggle(s.id, e.target.checked)}
                        aria-label={`Mark ${dayLabel(s.day)} ${s.title} done`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="account-side">
            <div className="account-panel">
              <p className="eyebrow light">Next check-in</p>
              {area.nextCheckin ? (
                <>
                  <h2>{whenLabel(area.nextCheckin.starts_at)}</h2>
                  <p>{area.nextCheckin.kind} · {area.nextCheckin.duration_min} min</p>
                  {area.nextCheckin.link && (
                    <a className="text-link" href={area.nextCheckin.link}>Join the call <span>→</span></a>
                  )}
                </>
              ) : (
                <p>Your coach will set up your next check-in with you.</p>
              )}
            </div>
            {area.note && (
              <div className="account-panel">
                <p className="eyebrow light">From your coach</p>
                <p className="coach-note">“{area.note}”</p>
                <a className="text-link" href={`mailto:${site.email}?subject=Training question`}>Message your coach <span>→</span></a>
              </div>
            )}
            <div className="account-panel">
              <p className="eyebrow light">Plan & billing</p>
              <h2>{area.planName ?? 'Coaching'}</h2>
              {area.coachName && <p>Coach: {area.coachName}</p>}
              {site.stripePortalUrl ? (
                <a className="text-link" href={site.stripePortalUrl}>Invoices & payment details <span>→</span></a>
              ) : (
                <a className="text-link" href={`mailto:${site.email}?subject=Billing question`}>Billing question? <span>→</span></a>
              )}
            </div>
            <button className="sign-out" onClick={() => signOut().then(() => navigate('/'))}>Sign out</button>
          </div>
        </section>
      )}
    </main>
  )
}
