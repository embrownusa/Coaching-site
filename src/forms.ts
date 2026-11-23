import { site } from './config'

export type SubmitResult = 'sent' | 'mailto'

/**
 * Sends a form.
 *
 * 1. If VITE_FORM_ENDPOINT is set, posts JSON there (e.g. Formspree).
 * 2. Otherwise posts to Netlify Forms. The matching hidden form definitions
 *    live in index.html so Netlify can detect them at deploy time.
 * 3. If that fails (for example when running locally), opens the visitor's
 *    email app with the details filled in.
 */
export async function submitForm(
  formName: 'contact' | 'newsletter',
  subject: string,
  fields: Record<string, string>,
): Promise<SubmitResult> {
  if (site.formEndpoint) {
    const response = await fetch(site.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, ...fields }),
    })
    if (!response.ok) throw new Error(`Form service answered ${response.status}`)
    return 'sent'
  }

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': formName, subject, ...fields }).toString(),
    })
    if (response.ok) return 'sent'
  } catch {
    /* fall through to email */
  }

  const body = Object.entries(fields)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return 'mailto'
}
