import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import './i18n/config'
import { DEFAULT_LANGUAGE } from './i18n/constants'
import LanguageLayout from './i18n/LanguageLayout'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
        <Route path="/:lang" element={<LanguageLayout />}>
          <Route index element={<App />} />
        </Route>
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
