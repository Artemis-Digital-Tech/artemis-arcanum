import type { PlanId } from '../data/plans'

const PLAN_FUNCTION_URL = 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/plan'
const CHECKOUT_FUNCTION_URL = 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/stripe-checkout'

export class StripeAPIError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'StripeAPIError'
    this.status = status
  }
}

export interface RemotePlan {
  planId: PlanId
  status: string
  currentPeriodEnd: string | null
}

function isPlanId(value: unknown): value is PlanId {
  return value === 'free' || value === 'plus' || value === 'ritual'
}

export const StripeAPI = {
  /** The signed-in visitor's real, backend-verified plan — see the "plan" edge function. */
  async getCurrentPlan(idToken: string): Promise<RemotePlan> {
    const res = await fetch(PLAN_FUNCTION_URL, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
    if (!res.ok) throw new StripeAPIError('http', res.status)
    const payload = (await res.json()) as Partial<RemotePlan>
    if (!isPlanId(payload.planId)) throw new StripeAPIError('shape')
    return {
      planId: payload.planId,
      status: typeof payload.status === 'string' ? payload.status : 'inactive',
      currentPeriodEnd: typeof payload.currentPeriodEnd === 'string' ? payload.currentPeriodEnd : null,
    }
  },

  /** Creates a Stripe Checkout session for a paid plan and returns the URL to redirect the visitor to. */
  async createCheckoutSession(
    planId: 'plus' | 'ritual',
    cycle: 'monthly' | 'annual',
    idToken: string,
  ): Promise<string> {
    const res = await fetch(CHECKOUT_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({
        planId,
        cycle,
        origin: window.location.origin,
        lang: document.documentElement.lang || 'pt',
      }),
    })
    if (!res.ok) throw new StripeAPIError('http', res.status)
    const payload = (await res.json()) as { url?: string }
    if (!payload.url) throw new StripeAPIError('shape')
    return payload.url
  },
}
