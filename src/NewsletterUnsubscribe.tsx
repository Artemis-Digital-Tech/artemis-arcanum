import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import Seo from './components/Seo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { useLangPath } from './i18n/useLangPath'
import { NewsletterAPI, NewsletterAPIError } from './services/NewsletterAPI'

type Status = 'checking' | 'done' | 'missing' | 'not_found' | 'error'

/**
 * Reached from the unsubscribe link in every daily-card email
 * (`?token=<unsubscribe_token>`). No login, no confirmation click beyond the
 * one already implied by opening the link — LGPD Art. 18, IX asks that
 * revoking consent be at least as easy as giving it was.
 */
export default function NewsletterUnsubscribe() {
  const { t } = useTranslation()
  const to = useLangPath()
  const [params] = useSearchParams()
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('missing')
      return
    }
    let cancelled = false
    NewsletterAPI.unsubscribe(token)
      .then(() => {
        if (!cancelled) setStatus('done')
      })
      .catch((error) => {
        if (cancelled) return
        const reason = error instanceof NewsletterAPIError ? error.reason : 'server'
        setStatus(reason === 'not_found' ? 'not_found' : 'error')
      })
    return () => {
      cancelled = true
    }
  }, [params])

  return (
    <div className="content-page">
      <Seo title={t('unsubscribePage.seoTitle')} description={t('unsubscribePage.seoDescription')} noindex />
      <SiteHeader />

      <main className="content-main">
        <div className="wrap">
          <div className="content-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('unsubscribePage.plateLabel')}
            </div>
            <h1>{t(`unsubscribePage.status.${status}.title`)}</h1>
            <p>{t(`unsubscribePage.status.${status}.body`)}</p>
            <Link to={to('')} className="btn-ghost">
              {t('unsubscribePage.backCta')}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
