import { useCallback, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getPlan, PLANS, type PlanId } from '../data/plans'
import { StripeAPI } from '../services/StripeAPI'
import { ReadingsAPI } from '../services/ReadingsAPI'

const PLAN_STORAGE_KEY = 'arcanum.plan'
const READING_COUNT_STORAGE_KEY = 'arcanum.freeReadingsThisMonth.anon'
const PLAN_CHANGED_EVENT = 'arcanum.plan.changed'

interface ReadingCountRecord {
  /** "2026-09" — the calendar month the count belongs to, so it resets automatically. */
  month: string
  count: number
}

function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function readPlanId(): PlanId {
  const stored = localStorage.getItem(PLAN_STORAGE_KEY)
  return PLANS.some((p) => p.id === stored) ? (stored as PlanId) : 'free'
}

/**
 * Local, per-browser counter — the only option for a signed-out visitor,
 * since there's no account to count against server-side. Deliberately
 * *not* used once signed in; see `usePlan`'s docstring.
 */
function readAnonReadingCount(): number {
  try {
    const raw = localStorage.getItem(READING_COUNT_STORAGE_KEY)
    if (!raw) return 0
    const record = JSON.parse(raw) as ReadingCountRecord
    return record.month === currentMonthKey() ? record.count : 0
  } catch {
    return 0
  }
}

function countReadingsThisMonth(createdAtValues: string[]): number {
  const month = currentMonthKey()
  return createdAtValues.filter((iso) => iso.slice(0, 7) === month).length
}

/**
 * Plan state. Signed-in visitors get their real, Stripe-backed plan from the
 * "plan" edge function (billing is enforced server-side via the webhook —
 * see docs/stripe-setup.md). Signed-out visitors, or when Auth0 isn't
 * configured, fall back to a localStorage-only plan: there is no billing
 * identity to attach a subscription to, so it stays UI-only in that case.
 *
 * The free-tier reading count follows the same split, and for a real reason:
 * a `localStorage` counter is per-*browser*, not per-*account*. Counting
 * against it for signed-in visitors let anyone reset their quota by signing
 * out/in as a different account on the same device, switching browsers, or
 * just clearing site data — the count never actually checked which account
 * was using it. Signed-in visitors are now counted from their own saved
 * readings in Supabase (keyed by their Auth0 token), which is the same
 * account no matter which device or browser they're on. The local counter
 * remains only for signed-out visitors, who have no account to count against.
 */
export function usePlan() {
  // Safe to call unconditionally: auth0-react's context has a no-op stub
  // default (isAuthenticated: false) even when no Auth0Provider is mounted.
  const { isAuthenticated, getIdTokenClaims } = useAuth0()

  const [planId, setPlanId] = useState<PlanId>(readPlanId)
  const [anonReadingsUsed, setAnonReadingsUsed] = useState<number>(readAnonReadingCount)
  const [remotePlanId, setRemotePlanId] = useState<PlanId | null>(null)
  const [serverReadingsUsed, setServerReadingsUsed] = useState<number | null>(null)

  const refreshRemotePlan = useCallback(async () => {
    if (!isAuthenticated) {
      setRemotePlanId(null)
      return
    }
    try {
      const claims = await getIdTokenClaims()
      if (!claims?.__raw) return
      const remote = await StripeAPI.getCurrentPlan(claims.__raw)
      setRemotePlanId(remote.planId)
    } catch {
      // Leave whatever plan we already have — a fetch hiccup shouldn't yank a paid plan away mid-session.
    }
  }, [isAuthenticated, getIdTokenClaims])

  const refreshServerReadingsUsed = useCallback(async () => {
    if (!isAuthenticated) {
      setServerReadingsUsed(null)
      return
    }
    try {
      const claims = await getIdTokenClaims()
      if (!claims?.__raw) return
      const readings = await ReadingsAPI.list(claims.__raw)
      setServerReadingsUsed(countReadingsThisMonth(readings.map((r) => r.createdAt)))
    } catch {
      // Leave whatever count we already have — a fetch hiccup shouldn't loosen or tighten the quota.
    }
  }, [isAuthenticated, getIdTokenClaims])

  useEffect(() => {
    void refreshRemotePlan()
    void refreshServerReadingsUsed()
  }, [refreshRemotePlan, refreshServerReadingsUsed])

  // A Stripe Checkout redirect brings the visitor back on this same tab; catch it on refocus too.
  useEffect(() => {
    function onFocus() {
      void refreshRemotePlan()
      void refreshServerReadingsUsed()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshRemotePlan, refreshServerReadingsUsed])

  useEffect(() => {
    function sync() {
      setPlanId(readPlanId())
      setAnonReadingsUsed(readAnonReadingCount())
    }
    window.addEventListener('storage', sync)
    window.addEventListener(PLAN_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(PLAN_CHANGED_EVENT, sync)
    }
  }, [])

  const setPlan = useCallback((id: PlanId) => {
    localStorage.setItem(PLAN_STORAGE_KEY, id)
    window.dispatchEvent(new Event(PLAN_CHANGED_EVENT))
  }, [])

  const recordFreeReadingUsed = useCallback(() => {
    if (isAuthenticated) {
      // The save to Supabase (see GameBoard) is fire-and-forget and may still
      // be in flight, so bump optimistically; refreshServerReadingsUsed will
      // reconcile with the real count on the next focus/mount.
      setServerReadingsUsed((prev) => (prev ?? 0) + 1)
      return
    }
    const record: ReadingCountRecord = { month: currentMonthKey(), count: readAnonReadingCount() + 1 }
    localStorage.setItem(READING_COUNT_STORAGE_KEY, JSON.stringify(record))
    window.dispatchEvent(new Event(PLAN_CHANGED_EVENT))
  }, [isAuthenticated])

  const effectivePlanId = isAuthenticated && remotePlanId ? remotePlanId : planId
  const plan = getPlan(effectivePlanId)
  const readingsUsed = isAuthenticated ? (serverReadingsUsed ?? 0) : anonReadingsUsed
  const readingsRemaining = plan.monthlyReadingLimit === null ? null : Math.max(0, plan.monthlyReadingLimit - readingsUsed)

  return {
    plan,
    /** Only meaningful for the signed-out/local demo path — a signed-in visitor's plan comes from Stripe. */
    setPlan,
    readingsUsed,
    readingsRemaining,
    hasReadingsLeft: readingsRemaining === null || readingsRemaining > 0,
    recordFreeReadingUsed,
    refreshRemotePlan,
  }
}
