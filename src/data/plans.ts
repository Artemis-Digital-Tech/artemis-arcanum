import type { SpreadId } from './spreads'

export type PlanId = 'free' | 'plus' | 'ritual'
export type BillingCycle = 'monthly' | 'annual'

export interface PlanPrice {
  monthly: number
  annual: number
}

export interface Plan {
  id: PlanId
  /** Translation key prefix under pricing.plans.<id> */
  i18nKey: PlanId
  price: PlanPrice | null
  /** Number of AI readings per month; null means unlimited. */
  monthlyReadingLimit: number | null
  /** Spreads this plan can generate an AI reading for. */
  allowedSpreads: SpreadId[]
  /** Days of reading history kept; null means kept forever. */
  historyRetentionDays: number | null
  featureKeys: string[]
  highlighted?: boolean
}

/** Spread ids that require Plus or Ritual — Free is capped to the short spreads. */
export const FREE_SPREAD_IDS: SpreadId[] = ['single', 'three']

export const PLANS: Plan[] = [
  {
    id: 'free',
    i18nKey: 'free',
    price: null,
    monthlyReadingLimit: 3,
    allowedSpreads: FREE_SPREAD_IDS,
    historyRetentionDays: 7,
    featureKeys: ['readingsPerMonth', 'shortSpreadsOnly', 'historyDays'],
  },
  {
    id: 'plus',
    i18nKey: 'plus',
    price: { monthly: 19.9, annual: 159.9 },
    monthlyReadingLimit: null,
    allowedSpreads: ['single', 'three', 'horseshoe', 'celtic'],
    historyRetentionDays: null,
    featureKeys: ['unlimitedReadings', 'allSpreads', 'historyForever', 'advancedFramings'],
    highlighted: true,
  },
  {
    id: 'ritual',
    i18nKey: 'ritual',
    price: { monthly: 34.9, annual: 279.9 },
    monthlyReadingLimit: null,
    allowedSpreads: ['single', 'three', 'horseshoe', 'celtic'],
    historyRetentionDays: null,
    featureKeys: ['everythingInPlus', 'followUp', 'exportPdf', 'priorityQueue'],
  },
]

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

/** Annual price expressed as an equivalent monthly rate, for "R$X/mês" framing next to the annual total. */
export function annualAsMonthly(plan: Plan): number | null {
  if (!plan.price) return null
  return plan.price.annual / 12
}
