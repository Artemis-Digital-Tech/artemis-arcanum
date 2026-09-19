import type { ReactNode } from 'react'
import { Auth0Provider, type AppState } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, isAuth0Configured } from './auth0Config'

interface Auth0ProviderWithNavigateProps {
  children: ReactNode
}

/**
 * Wraps the app in Auth0Provider, routing the post-login redirect back to
 * wherever the visitor started (carried as `appState.returnTo`) via the
 * app's own router instead of a hard page reload.
 *
 * Renders children unwrapped when no credentials are configured yet, so the
 * rest of the app keeps working in a checkout before `.env.local` is filled in.
 */
export default function Auth0ProviderWithNavigate({ children }: Auth0ProviderWithNavigateProps) {
  const navigate = useNavigate()

  if (!isAuth0Configured) {
    return <>{children}</>
  }

  function onRedirectCallback(appState?: AppState) {
    navigate(appState?.returnTo ?? window.location.pathname, { replace: true })
  }

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN as string}
      clientId={AUTH0_CLIENT_ID as string}
      authorizationParams={{ redirect_uri: `${window.location.origin}/callback` }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  )
}
