import { site } from './config'

export type SubmitResult = 'sent' | 'mailto'

/**
 * Sends form data to the configured form service. When no service is set up
 * yet, opens the visitor's email app with the details filled in instead, so
 * the form still works before hosting is decided.
 */
export async function submitForm(subject: string, fields: Record<string, string>): Promise<SubmitResult> {
  if (site.formEndpoint) {
    const response = await fetch(site.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, ...fields }),
    })
    if (!response.ok) throw new Error(`Form service answered ${response.status}`)
    return 'sent'
  }
  const body = Object.entries(fields)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return 'mailto'
}
