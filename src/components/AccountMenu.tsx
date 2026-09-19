import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { isAuth0Configured } from '../auth/auth0Config'

/**
 * The header's account control. Renders nothing when Auth0 isn't configured
 * yet, rather than a permanently-loading widget — login is optional, not a
 * gate, so its absence should be silent.
 */
export default function AccountMenu() {
  if (!isAuth0Configured) return null
  return <AccountMenuInner />
}

function AccountMenuInner() {
  const { t } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, isLoading, user, logout } = useAuth0()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Any navigation away (including via the menu's own links) should close it.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <Link to="entrar" state={{ returnTo: location.pathname }} className="account-menu-link">
        {t('auth.signIn')}
      </Link>
    )
  }

  const label = user?.given_name || user?.name || user?.email || t('auth.account')

  return (
    <span className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {user?.picture && !avatarFailed ? (
          <img
            className="account-menu-avatar"
            src={user.picture}
            alt=""
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="account-menu-avatar account-menu-avatar-fallback" aria-hidden="true">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="account-menu-name mono">{label}</span>
        <svg className="account-menu-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="account-menu-dropdown" role="menu">
          <Link to="minhas-leituras" className="account-menu-dropdown-item" role="menuitem">
            {t('myReadings.navLink')}
          </Link>
          <Link to="precos" className="account-menu-dropdown-item" role="menuitem">
            {t('pricing.navLink')}
          </Link>
          <button
            type="button"
            className="account-menu-dropdown-item"
            role="menuitem"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </span>
  )
}
