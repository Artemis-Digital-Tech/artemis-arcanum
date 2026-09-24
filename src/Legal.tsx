import { useTranslation } from 'react-i18next'
import Seo from './components/Seo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'

interface LegalSection {
  id: string
  title: string
  body: string[]
}

function Sections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section className="about-row" id={section.id} key={section.id}>
          <h2>{section.title}</h2>
          <div className="about-body">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

export default function Legal() {
  const { t } = useTranslation()
  const privacySections = t('legalPage.privacy.sections', { returnObjects: true }) as LegalSection[]
  const termsSections = t('legalPage.terms.sections', { returnObjects: true }) as LegalSection[]

  return (
    <div className="content-page">
      <Seo title={t('legalPage.seoTitle')} description={t('legalPage.seoDescription')} path="privacidade" />
      <SiteHeader />

      <main className="content-main">
        <div className="wrap">
          <div className="content-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('legalPage.plateLabel')}
            </div>
            <h1>{t('legalPage.title')}</h1>
            <p>{t('legalPage.lede')}</p>
            <p className="legal-updated mono">{t('legalPage.updated')}</p>
          </div>

          <nav className="legal-jump mono" aria-label={t('legalPage.title')}>
            <a href="#privacidade">{t('legalPage.nav.privacy')}</a>
            <a href="#termos">{t('legalPage.nav.terms')}</a>
          </nav>

          <div className="about legal">
            <section className="about-row" id="privacidade">
              <h2>{t('legalPage.privacy.heading')}</h2>
            </section>
            <Sections sections={privacySections} />

            <section className="about-row" id="termos">
              <h2>{t('legalPage.terms.heading')}</h2>
            </section>
            <Sections sections={termsSections} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
