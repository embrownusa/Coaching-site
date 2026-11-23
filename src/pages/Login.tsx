import { useState, type FormEvent } from 'react'
import { AUTH_DEMO, signIn, useUser } from '../auth'
import { Link } from '../components/Link'
import { navigate } from '../router'

export function Login() {
  const user = useUser()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'link-sent' | 'error'>('idle')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const result = await signIn(email)
      if (result === 'signed-in') navigate('/account')
      else setStatus('link-sent')
    } catch {
      setStatus('error')
    }
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
          ) : status === 'link-sent' ? (
            <p className="login-copy" role="status">
              Check your inbox. We’ve sent a sign-in link to <strong>{email}</strong>. Open it on this device to
              go straight to your training.
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <p className="login-copy">Enter your email and we’ll send you a link to sign in. No password needed.</p>
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
              <button className="button button-light" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : AUTH_DEMO ? 'Sign in' : 'Email me a link'} <span>→</span>
              </button>
              {status === 'error' && <p className="form-note" role="alert">We couldn’t send that link. Please try again.</p>}
              {AUTH_DEMO && (
                <p className="demo-note">Preview mode: any email works and nothing is stored online yet.</p>
              )}
            </form>
          )}
          <p className="login-foot">
            New here? <Link href="/book">Book a free consultation</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
