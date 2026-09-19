if (import.meta.env.DEV) {
  import("react-grab");
}

import { StrictMode } from 'react'
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
          </Route>
          <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
        </Routes>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
