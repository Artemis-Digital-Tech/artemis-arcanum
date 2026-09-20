import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import Seo from './components/Seo'
import NavMenu from './components/NavMenu'
import { isAuth0Configured } from './auth/auth0Config'

interface LoginLocationState {
  returnTo?: string
}

function Login() {
  const { t } = useTranslation()
  const location = useLocation()
  const returnTo = (location.state as LoginLocationState | null)?.returnTo ?? '..'

  return (
    <div className="game-board is-complete">
      <Seo title={t('seo.login.title')} description={t('auth.lede')} noindex />
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
          <NavMenu>
            <LanguageSwitcher />
            <Link to={returnTo} className="btn-ghost">
              &larr; {t('auth.backCta')}
            </Link>
          </NavMenu>
        </div>
        <hr className="rule" />
      </header>

      <main className="game-board-main">
        <div className="wrap">
          <div className="game-select-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('auth.plateLabel')}
            </div>
            <h1>{t('auth.title')}</h1>
            <p>{t('auth.lede')}</p>
          </div>

          {isAuth0Configured ? (
            <LoginGate returnTo={returnTo} />
          ) : (
            <p className="auth-notice mono">{t('auth.notConfigured')}</p>
          )}
        </div>
      </main>
    </div>
  )
}

function LoginGate({ returnTo }: { returnTo: string }) {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading, error, user, loginWithRedirect, logout } = useAuth0()

  function signInWith(connection?: string) {
    void loginWithRedirect({
      appState: { returnTo },
      authorizationParams: connection ? { connection } : undefined,
    })
  }

  if (isLoading) {
    return <p className="auth-notice mono">{t('auth.loading')}</p>
  }

  if (error) {
    return (
      <>
        <p className="auth-notice mono is-error">{t('auth.error')}</p>
        <button type="button" className="btn-primary" onClick={() => signInWith()}>
          {t('auth.retryCta')}
        </button>
      </>
    )
  }

  if (isAuthenticated) {
    const label = user?.given_name || user?.name || user?.email || t('auth.account')
    return (
      <>
        <p className="auth-notice mono">{t('auth.signedInAs', { name: label })}</p>
        <div className="question-gate-actions">
          <Link to={returnTo} className="btn-primary">
            {t('auth.continueCta')}
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            {t('auth.signOut')}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="auth-social">
      <button type="button" className="btn-social" onClick={() => signInWith('google-oauth2')}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20.6 12.23c0-.66-.06-1.29-.17-1.9H12v3.6h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.68Z"
            fill="currentColor"
          />
          <path
            d="M12 21c2.43 0 4.47-.8 5.96-2.17l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H3.96v2.33A9 9 0 0 0 12 21Z"
            fill="currentColor"
          />
          <path
            d="M6.96 12.73a5.4 5.4 0 0 1 0-3.46V6.94H3.96a9 9 0 0 0 0 8.12l3-2.33Z"
            fill="currentColor"
          />
          <path
            d="M12 5.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 2.79 14.42 2 12 2A9 9 0 0 0 3.96 6.94l3 2.33c.71-2.12 2.7-3.7 5.04-3.7Z"
            fill="currentColor"
          />
        </svg>
        {t('auth.continueWithGoogle')}
      </button>
      <button type="button" className="btn-social" onClick={() => signInWith('github')}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"
            fill="currentColor"
          />
        </svg>
        {t('auth.continueWithGithub')}
      </button>
      <div className="auth-social-divider mono">{t('auth.orDivider')}</div>
      <button type="button" className="btn-primary" onClick={() => signInWith()}>
        {t('auth.continueWithEmail')}
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
    </div>
  )
}

export default Login
