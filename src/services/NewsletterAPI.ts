/**
 * Supabase edge functions that own the `leads` table. Public on purpose: a
 * visitor subscribes to the daily card before they have any account, so
 * unlike the other services these carry no token.
 */
const NEWSLETTER_FUNCTION_URL = 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/newsletter'
const UNSUBSCRIBE_FUNCTION_URL = 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/newsletter-unsubscribe'

/** The reasons a caller can act on distinctly; anything else collapses to "try again". */
export type NewsletterError = 'invalid_email' | 'consent_required' | 'not_found' | 'network' | 'server'

export class NewsletterAPIError extends Error {
  reason: NewsletterError

  constructor(reason: NewsletterError) {
    super(reason)
    this.name = 'NewsletterAPIError'
    this.reason = reason
  }
}

export interface SubscribeInput {
  email: string
  name?: string
  language: string
  /** LGPD Art. 8º — explicit, evidenced consent; the function rejects a request without it. */
  consent: boolean
  /** The honeypot field: real people never see it, so anything here is a bot. */
  company?: string
}

async function readErrorReason(response: Response): Promise<string | undefined> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  return payload?.error
}

export const NewsletterAPI = {
  async subscribe(input: SubscribeInput): Promise<void> {
    let response: Response
    try {
      response = await fetch(NEWSLETTER_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, source: 'landing-newsletter' }),
      })
    } catch {
      throw new NewsletterAPIError('network')
    }

    if (response.ok) return

    const reason = await readErrorReason(response)
    if (reason === 'invalid_email') throw new NewsletterAPIError('invalid_email')
    if (reason === 'consent_required') throw new NewsletterAPIError('consent_required')
    throw new NewsletterAPIError('server')
  },

  /** `token` is the lead's own `unsubscribe_token`, from the link in the daily email. */
  async unsubscribe(token: string): Promise<void> {
    let response: Response
    try {
      response = await fetch(UNSUBSCRIBE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch {
      throw new NewsletterAPIError('network')
    }

    if (response.ok) return

    const reason = await readErrorReason(response)
    throw new NewsletterAPIError(reason === 'not_found' ? 'not_found' : 'server')
  },
}
