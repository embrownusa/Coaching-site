import { useState, type FormEvent } from 'react'
import { AUTH_DEMO, signIn, useUser } from '../auth'
import { Link } from '../components/Link'
import { navigate } from '../router'

export function Login() {
  const user = useUser()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    await signIn(email)
    navigate('/account')
  }

  return (
    <main className="inner-page">
      <section className="login-section section-pad">
        <div className="login-card">
          <p className="eyebrow light">Client area</p>
          <h1>Welcome <em>back.</em></h1>
          {user ? (
            <>
              <p className="login-copy">You’re signed in as {user.email}.</p>
              <Link className="button button-light" href="/account">Go to your training <span>→</span></Link>
            </>
          ) : (
            <form onSubmit={onSubmit}>
              <p className="login-copy">Enter your email and we’ll sign you in to your plan, calls and messages.</p>
              <label className="sr-only" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button className="button button-light" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'} <span>→</span>
              </button>
              {AUTH_DEMO && (
                <p className="demo-note">Preview mode: any email works and nothing is stored online yet.</p>
              )}
            </form>
          )}
          <p className="login-foot">
            New here? <Link href="/plans">See coaching plans</Link> or <Link href="/book">book a free call</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
