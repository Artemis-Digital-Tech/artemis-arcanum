import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Seo from './components/Seo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { toRoman } from './data/cardCatalog'
import { useLangPath } from './i18n/useLangPath'
import { aboutJsonLd } from './seo/structuredData'

interface Step {
  name: string
  body: string
}

export default function About() {
  const { t, i18n } = useTranslation()
  const to = useLangPath()
  const title = t('seo.about.title')
  const description = t('seo.about.description')

  const jsonLd = useMemo(
    () => aboutJsonLd({ url: `${window.location.origin}${to('sobre')}`, lang: i18n.language, name: title, description }),
    // `to` only varies with the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, title, description],
  )

  const paragraphs = (key: string) => t(key, { returnObjects: true }) as string[]
  const steps = t('aboutPage.sections.how.steps', { returnObjects: true }) as Step[]

  return (
    <div className="content-page">
      <Seo title={title} description={description} path="sobre" jsonLd={jsonLd} />
      <SiteHeader />

      <main className="content-main">
        <div className="wrap">
          <div className="content-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('aboutPage.plateLabel')}
            </div>
            <h1>{t('aboutPage.title')}</h1>
            <p>{t('aboutPage.lede')}</p>
          </div>

          <div className="about">
            <section className="about-row">
              <h2>{t('aboutPage.sections.what.title')}</h2>
              <div className="about-body">
                {paragraphs('aboutPage.sections.what.body').map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            <section className="about-row">
              <h2>{t('aboutPage.sections.how.title')}</h2>
              <ol className="about-steps">
                {steps.map((step, i) => (
                  <li key={step.name}>
                    <span className="about-step-mark" aria-hidden="true">
                      {toRoman(i + 1)}
                    </span>
                    <div>
                      <h3>{step.name}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="about-row">
              <h2>{t('aboutPage.sections.deck.title')}</h2>
              <div className="about-body">
                {paragraphs('aboutPage.sections.deck.body').map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <Link to={to('cartas')} className="about-link">
                  {t('aboutPage.sections.deck.link')} &rarr;
                </Link>
              </div>
            </section>

            <section className="about-row">
              <h2>{t('aboutPage.sections.not.title')}</h2>
              <ul className="about-list">
                {paragraphs('aboutPage.sections.not.items').map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="about-row">
              <h2>{t('aboutPage.sections.data.title')}</h2>
              <div className="about-body">
                {paragraphs('aboutPage.sections.data.body').map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            <section className="about-row">
              <h2>{t('aboutPage.sections.who.title')}</h2>
              <div className="about-body">
                {paragraphs('aboutPage.sections.who.body').map((p) => (
                  <p key={p} className="about-signature">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="final content-final">
          <div className="wrap">
            <h2>{t('aboutPage.cta.title')}</h2>
            <Link className="btn-primary" to={to('jogo')}>
              {t('aboutPage.cta.button')}
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
