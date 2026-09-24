if (import.meta.env.DEV) {
  import("react-grab");
}

import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import './i18n/config'
import { DEFAULT_LANGUAGE } from './i18n/constants'
import LanguageLayout from './i18n/LanguageLayout'
import Auth0ProviderWithNavigate from './auth/Auth0ProviderWithNavigate'
import Callback from './auth/Callback'
import App from './App.tsx'
import GameSelect from './GameSelect.tsx'
import GameBoard from './GameBoard.tsx'
import Login from './Login.tsx'
import MyReadings from './MyReadings.tsx'
import Pricing from './Pricing.tsx'

// Content pages load on demand, so the landing page's bundle doesn't carry them.
const Cards = lazy(() => import('./Cards.tsx'))
const CardDetail = lazy(() => import('./CardDetail.tsx'))
const About = lazy(() => import('./About.tsx'))
const Legal = lazy(() => import('./Legal.tsx'))
const NewsletterUnsubscribe = lazy(() => import('./NewsletterUnsubscribe.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <Routes>
          <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<App />} />
            <Route path="jogo" element={<GameSelect />} />
            <Route path="leitura" element={<GameBoard />} />
            <Route path="entrar" element={<Login />} />
            <Route path="minhas-leituras" element={<MyReadings />} />
            <Route path="precos" element={<Pricing />} />
            <Route path="cartas" element={<Suspense fallback={null}><Cards /></Suspense>} />
            <Route path="cartas/:slug" element={<Suspense fallback={null}><CardDetail /></Suspense>} />
            <Route path="sobre" element={<Suspense fallback={null}><About /></Suspense>} />
            <Route path="privacidade" element={<Suspense fallback={null}><Legal /></Suspense>} />
            <Route
              path="newsletter/cancelar"
              element={<Suspense fallback={null}><NewsletterUnsubscribe /></Suspense>}
            />
          </Route>
          <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
        </Routes>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
