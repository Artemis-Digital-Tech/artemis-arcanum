import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import AccountMenu from './components/AccountMenu'
import Seo from './components/Seo'
import { PLANS, annualAsMonthly, type BillingCycle, type PlanId } from './data/plans'
import { usePlan } from './hooks/usePlan'
import { isAuth0Configured } from './auth/auth0Config'
import { StripeAPI, StripeAPIError } from './services/StripeAPI'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type CheckoutNotice = 'success' | 'cancelled' | 'error' | null

function Pricing() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, getIdTokenClaims } = useAuth0()
  const { plan: currentPlan, setPlan, refreshRemotePlan } = usePlan()
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [checkoutPlanId, setCheckoutPlanId] = useState<PlanId | null>(null)
  const [notice, setNotice] = useState<CheckoutNotice>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const checkout = params.get('checkout')
    if (checkout === 'success' || checkout === 'cancelled') {
      setNotice(checkout)
      if (checkout === 'success') void refreshRemotePlan()
      navigate(location.pathname, { replace: true })
    }
    // Only meant to run once, right after a Stripe redirect lands here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubscribe(planId: 'plus' | 'ritual') {
    if (!isAuth0Configured) {
      // No billing identity to attach a subscription to yet — fall back to the local demo toggle.
      setPlan(planId)
      return
    }
    if (!isAuthenticated) {
      navigate('../entrar', { state: { returnTo: location.pathname } })
      return
    }

    setNotice(null)
    setCheckoutPlanId(planId)
    try {
      const claims = await getIdTokenClaims()
      if (!claims?.__raw) throw new StripeAPIError('no_token')
      const url = await StripeAPI.createCheckoutSession(planId, cycle, claims.__raw)
      window.location.href = url
    } catch {
      setNotice('error')
      setCheckoutPlanId(null)
    }
  }

  return (
    <div className="game-select">
      <Seo title={t('seo.pricing.title')} description={t('seo.pricing.description')} path="precos" />
      <div className="frame">
        <span className="c2"></span>
        <span className="c3"></span>
      </div>

      <header>
        <div className="wrap nav">
          <Link to=".." className="wordmark" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1" />
              <path d="M12 3.6V6M12 18v2.4M3.6 12H6M18 12h2.4" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
            ARCANUM <span className="idx">No. I</span>
          </Link>
          <div className="nav-utility">
            <LanguageSwitcher />
            <AccountMenu />
            <Link to=".." className="btn-ghost">
              &larr; {t('pricing.back')}
            </Link>
          </div>
        </div>
        <hr className="rule" />
      </header>

      <main className="game-select-main">
        <div className="wrap">
          <div className="game-select-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('pricing.plateLabel')}
            </div>
            <h1>{t('pricing.title')}</h1>
            <p>{t('pricing.lede')}</p>
          </div>

          {notice && (
            <p className={`auth-notice mono${notice === 'error' ? ' is-error' : ''}`}>
              {t(`pricing.checkoutNotice.${notice}`)}
            </p>
          )}

          <div className="pricing-toggle" role="radiogroup" aria-label={t('pricing.toggleLabel')}>
            <button
              type="button"
              role="radio"
              aria-checked={cycle === 'monthly'}
              className={cycle === 'monthly' ? 'is-active' : ''}
              onClick={() => setCycle('monthly')}
            >
              {t('pricing.billing.monthly')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={cycle === 'annual'}
              className={cycle === 'annual' ? 'is-active' : ''}
              onClick={() => setCycle('annual')}
            >
              {t('pricing.billing.annual')}
              <span className="pricing-toggle-savings">{t('pricing.billing.savings')}</span>
            </button>
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan.id
              const priceValue = plan.price ? plan.price[cycle] : null
              const monthlyEquivalent = cycle === 'annual' ? annualAsMonthly(plan) : null
              const isCheckingOut = checkoutPlanId === plan.id

              return (
                <div key={plan.id} className={`pricing-card${plan.highlighted ? ' is-highlighted' : ''}`}>
                  {plan.highlighted && (
                    <span className="pricing-card-badge">{t('pricing.mostPopular')}</span>
                  )}
                  <span className="pricing-card-name">{t(`pricing.plans.${plan.i18nKey}.name`)}</span>
                  <div className="pricing-card-price">
                    {priceValue === null ? (
                      t('pricing.free')
                    ) : (
                      <>
                        {formatBRL(priceValue)}
                        <span>/{cycle === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear')}</span>
                      </>
                    )}
                  </div>
                  <div className="pricing-card-annual-note mono">
                    {monthlyEquivalent !== null &&
                      t('pricing.annualEquivalent', { value: formatBRL(monthlyEquivalent) })}
                  </div>
                  <ul className="pricing-card-features">
                    {plan.featureKeys.map((key) => (
                      <li key={key}>{t(`pricing.plans.${plan.i18nKey}.features.${key}`)}</li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <span className="btn-ghost">{t('pricing.currentPlan')}</span>
                  ) : plan.id === 'free' ? (
                    <Link to="../jogo" className="btn-ghost">
                      {t('pricing.plans.free.cta')}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      aria-disabled={isCheckingOut}
                      onClick={() => {
                        if (!isCheckingOut) void handleSubscribe(plan.id as 'plus' | 'ritual')
                      }}
                    >
                      {isCheckingOut ? t('pricing.redirecting') : t(`pricing.plans.${plan.i18nKey}.cta`)}
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <p className="pricing-note mono">{t('pricing.checkoutNote')}</p>
        </div>
      </main>
    </div>
  )
}

export default Pricing
