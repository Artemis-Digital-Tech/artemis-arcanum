import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { isAuth0Configured } from '../auth/auth0Config'

/**
 * The header's "Planos" link. Signed-in visitors already have it in the
 * avatar menu, so showing it here too would just duplicate it — hidden
 * once authenticated, same as AccountMenu's own conditional rendering.
 */
export default function PricingNavLink() {
  if (!isAuth0Configured) return <PricingNavLinkAnchor />
  return <PricingNavLinkInner />
}

function PricingNavLinkInner() {
  const { isAuthenticated } = useAuth0()
  if (isAuthenticated) return null
  return <PricingNavLinkAnchor />
}

function PricingNavLinkAnchor() {
  const { t } = useTranslation()
  return <Link to="precos">{t('nav.pricing')}</Link>
}
