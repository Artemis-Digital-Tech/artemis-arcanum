import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import JourneyPath from './components/JourneyPath'
import Seo from './components/Seo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { CARD_GROUPS, SUIT_ELEMENTS, cardPath, type CardGroup } from './data/cardCatalog'
import { getCardDisplayName } from './data/cardNames'
import { SuitMark } from './data/suitGlyphs'
import { useLangPath } from './i18n/useLangPath'
import { cardsIndexJsonLd } from './seo/structuredData'

function GroupHead({ group }: { group: CardGroup }) {
  const { t } = useTranslation()
  const suit = group.id === 'majors' ? null : group.id

  return (
    <div className="journey-head">
      <div className="journey-head-title">
        {suit && <SuitMark suit={suit} className="journey-suit" />}
        <h2 id={`${group.anchor}-title`}>{suit ? t(`cards.suits.${suit}`) : t('cardsPage.majors.name')}</h2>
      </div>
      <div className="journey-head-meta">
        <p className="journey-head-path">
          {suit ? t(`cardsPage.suits.${suit}.path`) : t('cardsPage.majors.path')}
          {suit && ` · ${t(`cardsPage.elements.${SUIT_ELEMENTS[suit]}`)}`}
          {` · ${t('cardsPage.cardCount', { count: group.cards.length })}`}
        </p>
        <p className="journey-head-theme">{suit ? t(`cardsPage.suits.${suit}.theme`) : t('cardsPage.majors.theme')}</p>
      </div>
    </div>
  )
}

export default function Cards() {
  const { t, i18n } = useTranslation()
  const to = useLangPath()
  const title = t('seo.cards.title')
  const description = t('seo.cards.description')

  const jsonLd = useMemo(
    () =>
      cardsIndexJsonLd({
        url: `${window.location.origin}${to('cartas')}`,
        lang: i18n.language,
        name: title,
        description,
        items: CARD_GROUPS.flatMap((g) => g.cards).map((card) => ({
          name: getCardDisplayName(card, t),
          url: `${window.location.origin}${to(cardPath(card))}`,
        })),
      }),
    // `to` is rebuilt every render but only varies with the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, title, description],
  )

  return (
    <div className="content-page">
      <Seo title={title} description={description} path="cartas" jsonLd={jsonLd} />
      <SiteHeader />

      <main className="content-main">
        <div className="wrap">
          <div className="content-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('cardsPage.plateLabel')}
            </div>
            <h1>{t('cardsPage.title')}</h1>
            <p>{t('cardsPage.lede')}</p>
          </div>

          <nav className="journey-jump" aria-label={t('cardsPage.jumpLabel')}>
            {CARD_GROUPS.map((group) => (
              <a key={group.id} href={`#${group.anchor}`}>
                {group.id === 'majors' ? t('cardsPage.majors.name') : t(`cards.suits.${group.id}`)}
                <span>{group.cards.length}</span>
              </a>
            ))}
          </nav>

          {CARD_GROUPS.map((group) => (
            <section key={group.id} id={group.anchor} className="journey-section" aria-labelledby={`${group.anchor}-title`}>
              <GroupHead group={group} />
              <JourneyPath group={group} />
            </section>
          ))}
        </div>

        <section className="final content-final">
          <div className="wrap">
            <h2>{t('cardsPage.cta.title')}</h2>
            <p>{t('cardsPage.cta.body')}</p>
            <Link className="btn-primary" to={to('jogo')}>
              {t('cardsPage.cta.button')}
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
