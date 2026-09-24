import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLangPath } from '../i18n/useLangPath'

export default function SiteFooter() {
  const { t } = useTranslation()
  const to = useLangPath()

  return (
    <footer>
      <div className="wrap foot-row">
        <span>{t('footer.copyright')}</span>
        <div className="foot-links">
          <Link to={to('cartas')}>{t('footer.links.cards')}</Link>
          <Link to={to('sobre')}>{t('footer.links.about')}</Link>
          <Link to={to('precos')}>{t('footer.links.pricing')}</Link>
        </div>
      </div>
    </footer>
  )
}
