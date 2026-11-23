import { useState, type FormEvent } from 'react'
import { coaches } from '../content'
import { submitForm, type SubmitResult } from '../forms'
import { site } from '../config'
import { currentSearch } from '../router'
import { SparkShape, ButtonShape, ShapeField } from '../components/Shapes'

const disciplines = ['Track (800m–5K)', 'Road (10K–marathon)', 'Triathlon', 'Not sure yet']

export function Contact() {
  const params = new URLSearchParams(currentSearch())
  const initialCoach = coaches.some((c) => c.name === params.get('coach')) ? params.get('coach')! : 'No preference'
  const isConsultation = params.get('type') === 'consultation'

  const [form, setForm] = useState({
    name: '',
    email: '',
    discipline: disciplines[0],
    goal: '',
    coach: initialCoach,
    message: '',
    consultation: isConsultation ? 'Yes' : 'No',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | SubmitResult>('idle')

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm({ ...form, [key]: event.target.value })

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const result = await submitForm(
        'contact',
        form.consultation === 'Yes' ? `Consultation request from ${form.name}` : `Coaching inquiry from ${form.name}`,
        {
          name: form.name,
          email: form.email,
          discipline: form.discipline,
          goal: form.goal,
          coach: form.coach,
          consultation: form.consultation,
          message: form.message,
        },
      )
      setStatus(result)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <main className="inner-page">
        <section className="page-hero">
        <ShapeField variant="page" />
          <p className="eyebrow">Message received</p>
          <h1>Thank you, <em>{form.name.split(' ')[0] || 'friend'}.</em></h1>
          <p>We read every note personally and will reply within two working days.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="inner-page contact-page">
      <section className="page-hero">
        <ShapeField variant="page" />
        <p className="eyebrow">Work with us</p>
        <h1>Let’s start <em>the conversation.</em></h1>
        <p>
          Tell us a little about you and what you’re training for.
          We’ll be in touch within two working days.
        </p>
      </section>
      <section className="contact-layout section-pad">
        <aside className="contact-aside">
          <SparkShape className="shape-accent contact-spark" />
          <p className="eyebrow light">What happens next</p>
          <ol>
            <li><span>01</span>We read your note and match you with the right coach.</li>
            <li><span>02</span>A free 20-minute call about your goals, history, and schedule.</li>
            <li><span>03</span>If it feels right, we build your first training block together.</li>
          </ol>
          <p className="contact-email">
            Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </aside>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="field-row">
            <label>
              <span>Your name</span>
              <input required value={form.name} onChange={update('name')} autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input required type="email" value={form.email} onChange={update('email')} autoComplete="email" />
            </label>
          </div>
          <div className="field-row">
            <label>
              <span>What do you train for?</span>
              <select value={form.discipline} onChange={update('discipline')}>
                {disciplines.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>
              <span>Preferred coach</span>
              <select value={form.coach} onChange={update('coach')}>
                <option>No preference</option>
                {coaches.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <label>
            <span>Goal race or event (optional)</span>
            <input value={form.goal} onChange={update('goal')} placeholder="e.g. Chicago Marathon, October" />
          </label>
          <label>
            <span>Tell us about your running or training</span>
            <textarea required rows={6} value={form.message} onChange={update('message')} />
          </label>
          <fieldset className="radio-row">
            <legend>Would you like a free consultation call?</legend>
            {['Yes', 'No'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="consultation"
                  value={option}
                  checked={form.consultation === option}
                  onChange={update('consultation')}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <button className="button button-light" type="submit" disabled={status === 'sending'}><ButtonShape index={7} />
            {status === 'sending' ? 'Sending…' : 'Send message'} <span>↗</span>
          </button>
          {status === 'mailto' && (
            <p className="form-note" role="status">Your email app should open with your message ready to send.</p>
          )}
          {status === 'error' && (
            <p className="form-note" role="alert">
              Something went wrong. Please try again, or email us at {site.email}.
            </p>
          )}
        </form>
      </section>
    </main>
  )
}
