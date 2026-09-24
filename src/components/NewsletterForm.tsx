import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLangPath } from '../i18n/useLangPath'
import { NewsletterAPI, NewsletterAPIError } from '../services/NewsletterAPI'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function NewsletterForm() {
  const { t, i18n } = useTranslation()
  const to = useLangPath()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorKey, setErrorKey] = useState('newsletter.errorGeneric')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'sending' || !consent) return

    setStatus('sending')
    try {
      await NewsletterAPI.subscribe({
        email,
        name: name.trim() || undefined,
        language: i18n.language,
        consent,
        company,
      })
      setStatus('done')
    } catch (error) {
      const reason = error instanceof NewsletterAPIError ? error.reason : 'server'
      setErrorKey(
        reason === 'invalid_email'
          ? 'newsletter.errorEmail'
          : reason === 'consent_required'
            ? 'newsletter.errorConsent'
            : 'newsletter.errorGeneric',
      )
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="newsletter-done">
        <p className="newsletter-done-title">{t('newsletter.doneTitle')}</p>
        <p className="newsletter-done-body mono">{t('newsletter.doneBody')}</p>
      </div>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-fields">
        <label className="newsletter-field">
          <span className="newsletter-label mono">{t('newsletter.nameLabel')}</span>
          <input
            type="text"
            name="name"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('newsletter.namePlaceholder')}
          />
        </label>
        <label className="newsletter-field">
          <span className="newsletter-label mono">{t('newsletter.emailLabel')}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder={t('newsletter.emailPlaceholder')}
          />
        </label>
      </div>

      {/* Honeypot: off-screen and skipped by tab order, so only bots fill it. */}
      <div className="newsletter-honeypot" aria-hidden="true">
        <label>
          {t('newsletter.honeypotLabel')}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      {/* LGPD Art. 8º: unchecked by default and separate from the submit
          action — consent has to be an affirmative, specific choice, not
          something bundled into "send". */}
      <label className="newsletter-consent">
        <input
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked)
            if (status === 'error') setStatus('idle')
          }}
        />
        <span className="mono">
          {t('newsletter.consentPre')}{' '}
          <Link to={to('privacidade')} target="_blank" rel="noreferrer">
            {t('newsletter.consentLink')}
          </Link>
          {t('newsletter.consentPost')}
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={status === 'sending' || !consent}>
        {status === 'sending' ? t('newsletter.sending') : t('newsletter.cta')}
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

      {status === 'error' && (
        <p className="newsletter-error mono" role="alert">
          {t(errorKey)}
        </p>
      )}
      <p className="newsletter-fineprint mono">{t('newsletter.fineprint')}</p>
    </form>
  )
}
