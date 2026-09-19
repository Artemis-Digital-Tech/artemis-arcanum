import { useTranslation } from 'react-i18next'

/**
 * Dedicated Auth0 redirect target. It must not navigate away on its own —
 * Auth0Provider's onRedirectCallback (see Auth0ProviderWithNavigate) reads
 * `code`/`state` from this exact URL and then routes to `appState.returnTo`.
 * A route that redirects synchronously (like the app's `/` → `/pt` rule)
 * would strip those query params before the SDK can read them.
 */
export default function Callback() {
  const { t } = useTranslation()
  return (
    <div className="game-board is-complete">
      <main className="game-board-main">
        <div className="wrap">
          <p className="auth-notice mono">{t('auth.loading')}</p>
        </div>
      </main>
    </div>
  )
}
