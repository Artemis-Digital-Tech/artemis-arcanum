import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { useScrollOnNavigate } from '../hooks/useScrollOnNavigate'
import LanguageSwitcher from '../i18n/LanguageSwitcher'
import { useLangPath } from '../i18n/useLangPath'
import AccountMenu from './AccountMenu'
import NavMenu from './NavMenu'
import PricingNavLink from './PricingNavLink'

/**
 * The header for the content pages (cards, about): the same wordmark, nav
 * menu, language switcher, account menu and CTA as the rest of the site,
 * with every link absolute so it holds at any route depth. Also owns the
 * scroll reset those pages need on client-side navigation.
 */
export default function SiteHeader() {
  const { t } = useTranslation()
  const to = useLangPath()
  useScrollOnNavigate()

  return (
    <>
      <div className="frame">
        <span className="c2"></span>
        <span className="c3"></span>
      </div>
      <header>
        <div className="wrap nav">
          <Link to={to()} className="wordmark" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1" />
              <path d="M12 3.6V6M12 18v2.4M3.6 12H6M18 12h2.4" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
            ARCANUM <span className="idx">No. I</span>
          </Link>
          <NavMenu
            links={
              <>
                <NavLink to={to('cartas')}>{t('nav.cards')}</NavLink>
                <NavLink to={to('sobre')}>{t('nav.about')}</NavLink>
                <PricingNavLink />
              </>
            }
          >
            <LanguageSwitcher />
            <AccountMenu />
            <Link className="nav-cta" to={to('jogo')}>
              {t('nav.cta')}
            </Link>
          </NavMenu>
        </div>
        <hr className="rule" />
      </header>
    </>
  )
}
