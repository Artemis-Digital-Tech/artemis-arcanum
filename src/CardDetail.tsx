import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from './components/Seo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { CardPlateFace } from './components/TarotCard'
import { useCardContent, type CardContent } from './content/cards'
import { SUIT_ELEMENTS, cardMark, cardPath, journeyPosition, nameGender, toRoman } from './data/cardCatalog'
import { cardArtUrl } from './data/cardImages'
import { getCardDisplayName } from './data/cardNames'
import { cardIdFromSlug } from './data/cardSlugs'
import { COURT_RANKS, RANK_PIPS, TAROT_DECK, isMajor, type TarotCardData } from './data/tarotDeck'
import { DEFAULT_LANGUAGE } from './i18n/constants'
import { useLangPath } from './i18n/useLangPath'
import { cardJsonLd } from './seo/structuredData'

type Orientation = 'upright' | 'reversed'

export default function CardDetail() {
  const { slug } = useParams<{ slug: string }>()
  const to = useLangPath()
  const card = TAROT_DECK.find((c) => c.id === cardIdFromSlug(slug))

  if (!card) return <Navigate to={to('cartas')} replace />
  // Keyed by card so orientation and scroll-linked state start fresh on every card.
  return <CardFolio key={card.id} card={card} />
}

function CardFolio({ card }: { card: TarotCardData }) {
  const { t } = useTranslation()
  const { lang = DEFAULT_LANGUAGE } = useParams<{ lang: string }>()
  const to = useLangPath()
  const content = useCardContent(lang)
  const [orientation, setOrientation] = useState<Orientation>('upright')

  const name = getCardDisplayName(card, t)
  const gender = nameGender(name)
  const { group, index, prev, next } = journeyPosition(card)
  const groupName = isMajor(card) ? t('cardsPage.majors.name') : t(`cards.suits.${card.suit}`)
  const entry: CardContent | undefined = content.status === 'ready' ? content.data[card.id] : undefined

  const title = t('seo.card.title', { name })
  const description = entry
    ? t('seo.card.description', { name, meaning: entry.meaning.upright })
    : t('seo.card.description', { name, meaning: '' })

  const jsonLd = useMemo(() => {
    const origin = window.location.origin
    return cardJsonLd({
      url: `${origin}${to(cardPath(card))}`,
      lang,
      name: title,
      description,
      image: `${origin}${cardArtUrl(card.id)}`,
      cardName: name,
      cardsName: t('cardPage.breadcrumb'),
      cardsUrl: `${origin}${to('cartas')}`,
    })
    // `to` only varies with `lang`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, lang, title, description, name, t])

  const stripStart = Math.max(0, index - 2)
  const strip = group.cards.slice(stripStart, Math.min(group.cards.length, index + 3))

  return (
    <div className="content-page">
      <Seo title={title} description={description} path={cardPath(card)} jsonLd={jsonLd} image={cardArtUrl(card.id)} />
      <SiteHeader />

      <main className="content-main card-main">
        <div className="wrap">
          <nav className="card-breadcrumb" aria-label="Breadcrumb">
            <Link to={to('cartas')}>{t('cardPage.breadcrumb')}</Link>
            <span aria-hidden="true">/</span>
            <Link to={`${to('cartas')}#${group.anchor}`}>{groupName}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{name}</span>
          </nav>

          <nav className="journey-strip" aria-label={t('cardPage.journeyLabel')}>
            <ol>
              {strip.map((c, i) => {
                const isCurrent = c.id === card.id
                const distance = Math.abs(stripStart + i - index)
                const label = (
                  <>
                    <span className="journey-strip-mark">{cardMark(c, t)}</span>
                    <span className="journey-strip-dot" aria-hidden="true"></span>
                    <span className="journey-strip-name">{getCardDisplayName(c, t)}</span>
                  </>
                )
                return (
                  <li key={c.id} className={isCurrent ? 'is-current' : undefined} data-distance={distance}>
                    {isCurrent ? (
                      <span aria-current="page">{label}</span>
                    ) : (
                      <Link to={to(cardPath(c))}>{label}</Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <article className="card-folio" data-orientation={orientation}>
            <figure className="card-plate">
              <CardPlateFace card={card} name={name} alt={t('cardPage.artAlt', { name })} />
            </figure>

            <div className="card-copy">
              <div className="plate-label">
                <span className="dash"></span>
                {isMajor(card) ? `${cardMark(card, t)} · ${groupName}` : `${t('cardPage.minorArcana')} · ${groupName}`}
              </div>
              <h1>{name}</h1>
              <p className="card-position">
                {t('cardPage.position', { position: index + 1, total: group.cards.length })}
              </p>

              <CardFacts card={card} entry={entry} />

              <div className="orientation-toggle" role="radiogroup" aria-label={t('cardPage.orientationLabel')}>
                {(['upright', 'reversed'] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={orientation === o}
                    className={orientation === o ? 'is-active' : ''}
                    onClick={() => setOrientation(o)}
                  >
                    <svg viewBox="0 0 16 24" fill="none" aria-hidden="true" className={o === 'reversed' ? 'is-flipped' : undefined}>
                      <rect x="1.5" y="1.5" width="13" height="21" rx="1" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M8 6v8M5 11l3 3 3-3" stroke="currentColor" strokeWidth="1.1" transform="rotate(180 8 10)" />
                    </svg>
                    {t(`cardPage.${o}`)}
                  </button>
                ))}
              </div>

              {content.status === 'error' ? (
                <p className="card-load-error">{t('cardPage.loadError')}</p>
              ) : (
                <div className="card-meanings">
                  {(['upright', 'reversed'] as const).map((o) => (
                    <section key={o} className={`card-meaning${orientation === o ? ' is-active' : ''}`}>
                      <h2>
                        {o === 'upright'
                          ? t('cardPage.headings.uprightTitle', { name })
                          : t('cardPage.headings.reversedTitle', { name, context: gender })}
                      </h2>
                      <p className="card-meaning-text">{entry?.meaning[o]}</p>
                      {entry && (
                        <p className="card-keywords">
                          <span>{t('cardPage.keywords')}</span> {entry.keywords[o].join(' · ')}
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </article>

          {entry && (
            <section className="card-readings">
                {(['love', 'work', 'advice'] as const).map((k) => (
                  <div key={k} className="card-reading-row">
                    <h2>{t(`cardPage.headings.${k}Title`, { name })}</h2>
                    <p>{entry[k]}</p>
                  </div>
                ))}
                <div className="card-reading-row">
                  <h2>{t('cardPage.howToRead')}</h2>
                  <div>
                    <p>{readingNote(card, name, t)}</p>
                    <p className="card-reading-note">{t('cardPage.reversedNote')}</p>
                  </div>
                </div>
            </section>
          )}

          <nav className="card-pager" aria-label={`${t('cardPage.prev')} / ${t('cardPage.next')}`}>
            {prev ? (
              <Link to={to(cardPath(prev))} className="card-pager-link is-prev">
                <span className="card-pager-dir">&larr; {t('cardPage.prev')}</span>
                <span className="card-pager-name">
                  {cardMark(prev, t)} · {getCardDisplayName(prev, t)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={to(cardPath(next))} className="card-pager-link is-next">
                <span className="card-pager-dir">
                  {t('cardPage.next')} &rarr;
                </span>
                <span className="card-pager-name">
                  {cardMark(next, t)} · {getCardDisplayName(next, t)}
                </span>
              </Link>
            )}
          </nav>
        </div>

        <section className="final content-final">
          <div className="wrap">
            <h2>{t('cardPage.cta.title')}</h2>
            <p>{t('cardPage.cta.body', { name })}</p>
            <Link className="btn-primary" to={to('jogo')}>
              {t('cardPage.cta.button')}
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="content-disclaimer">{t('cardPage.disclaimer')}</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

/** Arcana, number, suit, element and correspondence, set as one measured data line. */
function CardFacts({ card, entry }: { card: TarotCardData; entry: CardContent | undefined }) {
  const { t } = useTranslation()
  const facts: [string, string][] = [[t('cardPage.data.arcana'), t(`cardPage.data.${card.arcana}`)]]

  if (isMajor(card)) {
    facts.push([t('cardPage.data.number'), toRoman(card.number)])
    if (entry?.correspondence) facts.push([t('cardPage.data.correspondence'), entry.correspondence])
  } else {
    facts.push([t('cardPage.data.suit'), t(`cards.suits.${card.suit}`)])
    facts.push([t('cardPage.data.element'), t(`cardsPage.elements.${SUIT_ELEMENTS[card.suit]}`)])
    if (!COURT_RANKS.includes(card.rank)) facts.push([t('cardPage.data.number'), String(RANK_PIPS[card.rank])])
  }

  return (
    <dl className="card-facts">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function readingNote(card: TarotCardData, name: string, t: ReturnType<typeof useTranslation>['t']): string {
  const { prev, next } = journeyPosition(card)
  if (isMajor(card)) {
    if (!prev) return t('cardPage.majorNoteFirst', { name, next: next && getCardDisplayName(next, t) })
    if (!next) return t('cardPage.majorNoteLast', { name, prev: getCardDisplayName(prev, t) })
    return t('cardPage.majorNote', { name, prev: getCardDisplayName(prev, t), next: getCardDisplayName(next, t) })
  }
  return t('cardPage.minorNote', {
    rankNote: t(`cardPage.rankNotes.${card.rank}`),
    suit: t(`cards.suits.${card.suit}`),
    element: t(`cardsPage.elements.${SUIT_ELEMENTS[card.suit]}`).toLowerCase(),
    theme: t(`cardsPage.suits.${card.suit}.theme`).toLowerCase(),
  })
}
