import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useReveal } from './useReveal'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import AccountMenu from './components/AccountMenu'
import NavMenu from './components/NavMenu'
import PricingNavLink from './components/PricingNavLink'
import Seo from './components/Seo'
import NewsletterForm from './components/NewsletterForm'
import { cardArtUrl } from './data/cardImages'
import { landingJsonLd, type FaqItem } from './seo/structuredData'

/** The majors shown in the deck catalogue: plate numeral, line glyph, and the card's own art. */
const CATALOG_CARDS = [
  {
    id: 'major-fool',
    numeral: '00',
    key: 'fool',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 4 L20 4" stroke="currentColor" /><path d="M8 30 L20 6 L20 34" stroke="currentColor" strokeWidth="1.1" fill="none" /><circle cx="20" cy="10" r="3" stroke="currentColor" strokeWidth="1.1" /><path d="M12 28h16" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-magician',
    numeral: 'I',
    key: 'magician',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.1" /><path d="M8 34c2-9 7-13 12-13s10 4 12 13" stroke="currentColor" strokeWidth="1.1" /><path d="M20 21v9" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-highPriestess',
    numeral: 'II',
    key: 'highPriestess',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 6v28M9 20h22" stroke="currentColor" strokeWidth="1.1" /><circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-empress',
    numeral: 'III',
    key: 'empress',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="20" rx="13" ry="9" stroke="currentColor" strokeWidth="1.1" /><path d="M20 11v18M12 20h16" stroke="currentColor" strokeWidth="1" /></svg>
    ),
  },
  {
    id: 'major-emperor',
    numeral: 'IV',
    key: 'emperor',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><rect x="10" y="10" width="20" height="20" stroke="currentColor" strokeWidth="1.1" /><path d="M10 20h20M20 10v20" stroke="currentColor" strokeWidth="1" /></svg>
    ),
  },
  {
    id: 'major-hierophant',
    numeral: 'V',
    key: 'hierophant',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 5 L33 32 L7 32 Z" stroke="currentColor" strokeWidth="1.1" /><path d="M20 15v10M15 27h10" stroke="currentColor" strokeWidth="1" /></svg>
    ),
  },
  {
    id: 'major-lovers',
    numeral: 'VI',
    key: 'lovers',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><circle cx="14" cy="18" r="7" stroke="currentColor" strokeWidth="1.1" /><circle cx="26" cy="18" r="7" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-chariot',
    numeral: 'VII',
    key: 'chariot',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><rect x="11" y="14" width="18" height="13" stroke="currentColor" strokeWidth="1.1" /><path d="M14 14l6-8 6 8" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-strength',
    numeral: 'VIII',
    key: 'strength',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 4a16 16 0 1 0 0.001 0" stroke="currentColor" strokeWidth="1.1" /><path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="currentColor" strokeWidth="1" /></svg>
    ),
  },
  {
    id: 'major-hermit',
    numeral: 'IX',
    key: 'hermit',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><path d="M14 8v22M26 8v22M14 30l12-2M14 10l12-2" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    id: 'major-wheelOfFortune',
    numeral: 'X',
    key: 'wheelOfFortune',
    glyph: (
      <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.1" /><circle cx="20" cy="20" r="2" fill="currentColor" /><path d="M20 7v3M20 30v3M7 20h3M30 20h3" stroke="currentColor" strokeWidth="1" /></svg>
    ),
  },
]

function App() {
  useReveal()
  const { t, i18n } = useTranslation()
  const [deckStyle, setDeckStyle] = useState<'glyph' | 'art'>('glyph')
  // returnObjects builds a fresh array per call; memoize so jsonLd stays stable.
  const faqItems = useMemo(() => t('faq.items', { returnObjects: true }) as FaqItem[], [t])
  const description = t('seo.landing.description')
  const jsonLd = useMemo(
    () => landingJsonLd(`${window.location.origin}/${i18n.language}`, i18n.language, description, faqItems),
    [i18n.language, description, faqItems],
  )

  return (
    <>
      <Seo title={t('seo.landing.title')} description={t('seo.landing.description')} path="" jsonLd={jsonLd} />
      <div className="frame">
        <span className="c2"></span>
        <span className="c3"></span>
      </div>

      <header>
        <div className="wrap nav">
          <a href="#top" className="wordmark" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1" />
              <path d="M12 3.6V6M12 18v2.4M3.6 12H6M18 12h2.4" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
            ARCANUM <span className="idx">No. I</span>
          </a>
          <NavMenu
            links={
              <>
                <a href="#mechanism">{t('nav.mechanism')}</a>
                <a href="#deck">{t('nav.deck')}</a>
                <a href="#reading">{t('nav.reading')}</a>
                <a href="#compare">{t('nav.compare')}</a>
                <PricingNavLink />
              </>
            }
          >
            <LanguageSwitcher />
            <AccountMenu />
            <Link className="nav-cta" to="jogo">{t('nav.cta')}</Link>
          </NavMenu>
        </div>
        <hr className="rule" />
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-grid" aria-hidden="true"></div>
          <div className="wrap hero-inner">
            <div>
              <div className="plate-label"><span className="dash"></span>{t('hero.plateLabel')}</div>
              <h1>{t('hero.titlePre')} <em>{t('hero.titleEm')}</em> {t('hero.titlePost')}</h1>
              <p className="lede">{t('hero.lede')}</p>
              <div className="hero-actions">
                <Link className="btn-primary" to="jogo">
                  {t('hero.ctaPrimary')}
                  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <a className="btn-ghost" href="#mechanism">{t('hero.ctaGhost')}</a>
              </div>
              <div className="readout">
                <div><b>{t('hero.readout.wait.value')}</b>{t('hero.readout.wait.label')}</div>
                <div><b>{t('hero.readout.cards.value')}</b>{t('hero.readout.cards.label')}</div>
                <div><b>{t('hero.readout.uptime.value')}</b>{t('hero.readout.uptime.label')}</div>
              </div>
            </div>

            <div className="dial-wrap" aria-hidden="true">
              <svg viewBox="0 0 400 400">
                <g className="dial-ring-outer">
                  <circle cx="200" cy="200" r="188" stroke="var(--line-bright)" strokeWidth="1" fill="none" />
                  <g fontFamily="Space Mono" fontSize="10" fill="var(--paper-dim)" letterSpacing="2">
                    <text x="200" y="20" textAnchor="middle">0</text>
                    <text x="380" y="204" textAnchor="middle">VI</text>
                    <text x="200" y="390" textAnchor="middle">XII</text>
                    <text x="20" y="204" textAnchor="middle">XVIII</text>
                  </g>
                  <g stroke="var(--paper-dim)" strokeWidth="1">
                    <line x1="200" y1="12" x2="200" y2="28" />
                    <line x1="200" y1="372" x2="200" y2="388" />
                    <line x1="12" y1="200" x2="28" y2="200" />
                    <line x1="372" y1="200" x2="388" y2="200" />
                  </g>
                </g>
                <circle cx="200" cy="200" r="150" stroke="var(--line)" strokeWidth="1" fill="none" strokeDasharray="1 7" />
                <g className="dial-ring-inner">
                  <circle cx="200" cy="200" r="112" stroke="var(--brass)" strokeWidth="1" fill="none" />
                  <path d="M200 88 L212 130 L200 172 L188 130 Z" fill="var(--brass-bright)" />
                </g>
                <circle cx="200" cy="200" r="70" fill="var(--ink-2)" stroke="var(--line-bright)" strokeWidth="1" />
                <g stroke="var(--paper)" strokeWidth="1.1" fill="none">
                  <path d="M200 154 V246 M154 200 H246" stroke="var(--line-bright)" />
                  <circle cx="200" cy="200" r="26" />
                  <path d="M200 174 v-14 M200 226 v14 M174 200 h-14 M226 200 h14" />
                </g>
              </svg>
              <div className="dial-caption">{t('hero.dialCaption')}</div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* ============ MECHANISM ============ */}
        <section className="section-pad" id="mechanism">
          <div className="wrap">
            <div className="section-head" data-reveal="true">
              <div className="tag">{t('mechanism.tag')}</div>
              <div>
                <h2>{t('mechanism.title')}</h2>
                <p>{t('mechanism.subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="mech">
              <div className="mech-cell" data-reveal="true">
                <span className="mech-idx">{t('mechanism.steps.ask.idx')}</span>
                <svg className="mech-glyph" viewBox="0 0 40 40" fill="none"><path d="M8 12h24v14H16l-6 6V26H8z" stroke="currentColor" strokeWidth="1.2" /><circle cx="16" cy="19" r="1.2" fill="currentColor" /><circle cx="20" cy="19" r="1.2" fill="currentColor" /><circle cx="24" cy="19" r="1.2" fill="currentColor" /></svg>
                <h3>{t('mechanism.steps.ask.title')}</h3>
                <p>{t('mechanism.steps.ask.body')}</p>
              </div>
              <div className="mech-cell" data-reveal="true">
                <span className="mech-idx">{t('mechanism.steps.draw.idx')}</span>
                <svg className="mech-glyph" viewBox="0 0 40 40" fill="none"><rect x="9" y="6" width="14" height="22" rx="1" stroke="currentColor" strokeWidth="1.2" transform="rotate(-8 16 17)" /><rect x="17" y="8" width="14" height="22" rx="1" stroke="currentColor" strokeWidth="1.2" transform="rotate(6 24 19)" /></svg>
                <h3>{t('mechanism.steps.draw.title')}</h3>
                <p>{t('mechanism.steps.draw.body')}</p>
              </div>
              <div className="mech-cell" data-reveal="true">
                <span className="mech-idx">{t('mechanism.steps.read.idx')}</span>
                <svg className="mech-glyph" viewBox="0 0 40 40" fill="none"><path d="M6 30c4-14 10-21 14-21s10 7 14 21" stroke="currentColor" strokeWidth="1.2" /><circle cx="20" cy="14" r="3.4" stroke="currentColor" strokeWidth="1.2" /></svg>
                <h3>{t('mechanism.steps.read.title')}</h3>
                <p>{t('mechanism.steps.read.body')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CARD CATALOG ============ */}
        <section className="catalog" id="deck">
          <div className="wrap" style={{ paddingTop: 64 }}>
            <div className="section-head" data-reveal="true" style={{ marginBottom: 0 }}>
              <div className="tag">{t('deck.tag')}</div>
              <div>
                <h2>{t('deck.title')}</h2>
                <p>{t('deck.subtitle')}</p>
                <div className="deck-toggle" role="radiogroup" aria-label={t('deck.styleToggle.label')}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={deckStyle === 'glyph'}
                    className={deckStyle === 'glyph' ? 'is-active' : ''}
                    onClick={() => setDeckStyle('glyph')}
                  >
                    {t('deck.styleToggle.glyph')}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={deckStyle === 'art'}
                    className={deckStyle === 'art' ? 'is-active' : ''}
                    onClick={() => setDeckStyle('art')}
                  >
                    {t('deck.styleToggle.art')}
                  </button>
                </div>
                <Link className="deck-all-link" to="cartas">
                  {t('deck.allCardsLink')} &rarr;
                </Link>
              </div>
            </div>
          </div>
          <div className="catalog-scroll" tabIndex={0} aria-label={t('deck.scrollLabel')}>
            {CATALOG_CARDS.map((card) => (
              <article className={`tarot-card${deckStyle === 'art' ? ' is-art' : ''}`} key={card.id}>
                {deckStyle === 'art' && (
                  <img className="tarot-card-art" src={cardArtUrl(card.id)} alt="" loading="lazy" decoding="async" />
                )}
                <span className="num">{card.numeral}</span>
                {deckStyle === 'glyph' && card.glyph}
                <span className="name">{t(`deck.cards.${card.key}`)}</span>
              </article>
            ))}
          </div>
        </section>

        <hr className="rule" />

        {/* ============ READING DEMO ============ */}
        <section className="section-pad" id="reading">
          <div className="wrap">
            <div className="section-head" data-reveal="true">
              <div className="tag">{t('reading.tag')}</div>
              <div>
                <h2>{t('reading.title')}</h2>
                <p>{t('reading.subtitle')}</p>
              </div>
            </div>

            <div className="demo" data-reveal="true">
              <div className="demo-left">
                <div className="demo-q">{t('reading.questionLabel')}</div>
                <h3>{t('reading.question')}</h3>
                <div className="demo-cards">
                  <div className="demo-card"><svg viewBox="0 0 40 40" fill="none"><rect x="11" y="14" width="18" height="13" stroke="currentColor" strokeWidth="1.3" /><path d="M14 14l6-8 6 8" stroke="currentColor" strokeWidth="1.3" /></svg></div>
                  <div className="demo-card"><svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.3" /><circle cx="20" cy="20" r="2" fill="currentColor" /></svg></div>
                  <div className="demo-card"><svg viewBox="0 0 40 40" fill="none"><path d="M20 4a16 16 0 1 0 0.001 0" stroke="currentColor" strokeWidth="1.3" /></svg></div>
                </div>
                <div className="demo-meta">
                  <span>{t('reading.spread')}</span>
                </div>
              </div>
              <div className="demo-right">
                <div className="label">{t('reading.resultLabel')}</div>
                <p><strong>{t('reading.results.chariot.title')}</strong> &mdash; {t('reading.results.chariot.body')}</p>
                <p><strong>{t('reading.results.wheel.title')}</strong> &mdash; {t('reading.results.wheel.body')}</p>
                <p><strong>{t('reading.results.strength.title')}</strong> &mdash; {t('reading.results.strength.body')}<span className="caret" aria-hidden="true"></span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMPARISON / POSITIONING ============ */}
        <section className="compare" id="compare">
          <div className="wrap" style={{ padding: '56px 0 0' }}>
            <div className="section-head" data-reveal="true" style={{ marginBottom: 48 }}>
              <div className="tag">{t('compare.tag')}</div>
              <div>
                <h2>{t('compare.title')}</h2>
                <p>{t('compare.subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="compare-row head">
              <div></div><div>{t('compare.columns.arcanum')}</div><div>{t('compare.columns.horoscope')}</div><div>{t('compare.columns.human')}</div>
            </div>
            <div className="compare-row">
              <div>{t('compare.rows.answers.label')}</div>
              <div className="yes">{t('compare.rows.answers.arcanum')}</div>
              <div className="no">{t('compare.rows.answers.horoscope')}</div>
              <div className="yes">{t('compare.rows.answers.human')}</div>
            </div>
            <div className="compare-row">
              <div>{t('compare.rows.available.label')}</div>
              <div className="yes">{t('compare.rows.available.arcanum')}</div>
              <div className="yes">{t('compare.rows.available.horoscope')}</div>
              <div className="no">{t('compare.rows.available.human')}</div>
            </div>
            <div className="compare-row">
              <div>{t('compare.rows.cost.label')}</div>
              <div className="yes">{t('compare.rows.cost.arcanum')}</div>
              <div className="yes">{t('compare.rows.cost.horoscope')}</div>
              <div className="no">{t('compare.rows.cost.human')}</div>
            </div>
            <div className="compare-row">
              <div>{t('compare.rows.deck.label')}</div>
              <div className="yes">{t('compare.rows.deck.arcanum')}</div>
              <div className="no">{t('compare.rows.deck.horoscope')}</div>
              <div className="yes">{t('compare.rows.deck.human')}</div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section-pad faq" id="faq">
          <div className="wrap">
            <div className="section-head" data-reveal="true">
              <div className="tag">{t('faq.tag')}</div>
              <div>
                <h2>{t('faq.title')}</h2>
                <p>{t('faq.subtitle')}</p>
              </div>
            </div>
            <div className="faq-list" data-reveal="true">
              {faqItems.map((item) => (
                <details className="faq-item" key={item.q}>
                  <summary>
                    <h3>{item.q}</h3>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ NEWSLETTER ============ */}
        <section className="section-pad newsletter" id="newsletter">
          <div className="wrap">
            <div className="newsletter-inner" data-reveal="true">
              <div className="newsletter-copy">
                <div className="plate-label"><span className="dash"></span>{t('newsletter.plateLabel')}</div>
                <h2>{t('newsletter.title')}</h2>
                <p>{t('newsletter.subtitle')}</p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* ============ FINAL CTA ============ */}
        <section className="final">
          <div className="wrap">
            <div data-reveal="true">
              <h2>{t('final.titlePre')} <em>{t('final.titleEm')}</em></h2>
              <p>{t('final.body')}</p>
              <Link className="btn-primary" to="jogo">
                {t('final.cta')}
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot-row">
          <span>{t('footer.copyright')}</span>
          <div className="foot-links">
            <a href="#mechanism">{t('nav.mechanism')}</a>
            <a href="#deck">{t('nav.deck')}</a>
            <a href="#compare">{t('nav.compare')}</a>
            <a href="#faq">{t('nav.faq')}</a>
            <Link to="cartas">{t('footer.links.cards')}</Link>
            <Link to="sobre">{t('footer.links.about')}</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
