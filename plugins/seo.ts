import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import type { CardContentMap } from '../src/content/cards/types.ts'
import { cardPath } from '../src/data/cardCatalog.ts'
import { cardArtUrl } from '../src/data/cardImages.ts'
import { TAROT_DECK, isMajor, type TarotCardData } from '../src/data/tarotDeck.ts'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/i18n/constants.ts'
import {
  aboutJsonLd,
  cardJsonLd,
  cardsIndexJsonLd,
  landingJsonLd,
  type FaqItem,
} from '../src/seo/structuredData.ts'

/**
 * Fixed indexable paths after the language segment, mapped to their `seo.*`
 * key in the locale files — must match the `path` prop each page passes to
 * <Seo>. The 78 card pages are added from the deck below. Pages rendered with
 * `noindex` (leitura, entrar, minhas-leituras) stay out of the sitemap and
 * are disallowed in robots.txt.
 */
const STATIC_PAGES: Record<string, string> = {
  '': 'landing',
  jogo: 'gameSelect',
  precos: 'pricing',
  cartas: 'cards',
  sobre: 'about',
}

const CARD_PAGES = new Map<string, TarotCardData>(TAROT_DECK.map((card) => [cardPath(card), card]))

const INDEXABLE_PATHS = [...Object.keys(STATIC_PAGES), ...CARD_PAGES.keys()]

const DISALLOWED_PATHS = ['leitura', 'entrar', 'minhas-leituras']

const OG_LOCALES: Record<string, string> = { pt: 'pt_BR', en: 'en_US' }

interface Locale {
  seo: Record<string, { title: string; description?: string }>
  faq: { items: FaqItem[] }
  deck: { cards: Record<string, string> }
  cards: {
    minorName: string
    suits: Record<string, string>
    ranks: Record<string, string>
    courts: Record<string, string>
  }
  cardPage: { breadcrumb: string }
}

interface PageMeta {
  title: string
  description: string
  jsonLd?: Record<string, unknown>
  /** Absolute URL of the page's own image, when it has a real one (card art). */
  image?: string
}

function pageUrl(siteUrl: string, lang: string, pagePath: string) {
  return `${siteUrl}/${lang}${pagePath ? `/${pagePath}` : ''}`
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}

/** Same result as getCardDisplayName, read straight from the locale file. */
function cardName(card: TarotCardData, locale: Locale) {
  if (isMajor(card)) return locale.deck.cards[card.id.replace('major-', '')]
  const rank = locale.cards.courts[card.rank] ?? locale.cards.ranks[card.rank]
  return interpolate(locale.cards.minorName, { rank, suit: locale.cards.suits[card.suit] })
}

function pageMeta(siteUrl: string, lang: string, pagePath: string, locale: Locale, content: CardContentMap): PageMeta {
  const url = pageUrl(siteUrl, lang, pagePath)
  const card = CARD_PAGES.get(pagePath)

  if (card) {
    const name = cardName(card, locale)
    const title = interpolate(locale.seo.card.title, { name })
    const description = interpolate(locale.seo.card.description ?? '', { name, meaning: content[card.id].meaning.upright })
    const image = `${siteUrl}${cardArtUrl(card.id)}`
    return {
      title,
      description,
      image,
      jsonLd: cardJsonLd({
        url,
        lang,
        name: title,
        description,
        image,
        cardName: name,
        cardsName: locale.cardPage.breadcrumb,
        cardsUrl: pageUrl(siteUrl, lang, 'cartas'),
      }),
    }
  }

  const seo = locale.seo[STATIC_PAGES[pagePath]]
  const meta: PageMeta = { title: seo.title, description: seo.description ?? '' }
  const page = { url, lang, name: meta.title, description: meta.description }
  if (pagePath === '') meta.jsonLd = landingJsonLd(url, lang, meta.description, locale.faq.items)
  if (pagePath === 'sobre') meta.jsonLd = aboutJsonLd(page)
  if (pagePath === 'cartas') {
    meta.jsonLd = cardsIndexJsonLd({
      ...page,
      items: TAROT_DECK.map((c) => ({ name: cardName(c, locale), url: pageUrl(siteUrl, lang, cardPath(c)) })),
    })
  }
  return meta
}

function buildSitemap(siteUrl: string) {
  const urls = INDEXABLE_PATHS.flatMap((pagePath) => {
    const alternates = [
      ...SUPPORTED_LANGUAGES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(siteUrl, l, pagePath)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(siteUrl, DEFAULT_LANGUAGE, pagePath)}"/>`,
    ].join('\n')
    const card = CARD_PAGES.get(pagePath)
    const image = card ? `\n    <image:image><image:loc>${siteUrl}${cardArtUrl(card.id)}</image:loc></image:image>` : ''
    return SUPPORTED_LANGUAGES.map(
      (lang) => `  <url>\n    <loc>${pageUrl(siteUrl, lang, pagePath)}</loc>\n${alternates}${image}\n  </url>`,
    )
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`
}

function buildRobots(siteUrl: string | undefined) {
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED_PATHS.map((p) => `Disallow: /*/${p}`),
  ]
  if (siteUrl) lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
  return `${lines.join('\n')}\n`
}

/**
 * The same head tags <Seo> sets at runtime, baked into the static HTML so
 * crawlers and link previews that don't run JavaScript still get the right
 * title, description, canonical and hreflang per page and language. Tags
 * carry the same `data-seo` markers <Seo> uses, so it updates them in place
 * instead of duplicating them once the app boots.
 */
function prerenderHead(template: string, siteUrl: string, lang: string, pagePath: string, meta: PageMeta) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const url = pageUrl(siteUrl, lang, pagePath)

  const tags = [
    `<meta name="robots" content="index, follow" data-seo="true">`,
    `<link rel="canonical" href="${url}" data-seo="true">`,
    ...SUPPORTED_LANGUAGES.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${pageUrl(siteUrl, l, pagePath)}" data-seo="true">`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl(siteUrl, DEFAULT_LANGUAGE, pagePath)}" data-seo="true">`,
    `<meta property="og:title" content="${title}" data-seo="true">`,
    `<meta property="og:description" content="${description}" data-seo="true">`,
    `<meta property="og:type" content="${meta.image ? 'article' : 'website'}" data-seo="true">`,
    `<meta property="og:url" content="${url}" data-seo="true">`,
    `<meta property="og:locale" content="${OG_LOCALES[lang] ?? 'en_US'}" data-seo="true">`,
    ...(meta.image ? [`<meta property="og:image" content="${meta.image}" data-seo="true">`] : []),
    `<meta name="twitter:card" content="summary" data-seo="true">`,
    `<meta name="twitter:title" content="${title}" data-seo="true">`,
    `<meta name="twitter:description" content="${description}" data-seo="true">`,
  ]
  if (meta.jsonLd) {
    tags.push(
      `<script type="application/ld+json" data-seo="jsonld">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`,
    )
  }

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace('</head>', `${tags.join('\n')}\n</head>`)
}

/**
 * Build-time SEO output: sitemap.xml and robots.txt generated from the page
 * list above, plus one prerendered-head HTML file per indexable page and
 * language (dist/<lang>/<path>/index.html). `siteUrl` is the production
 * origin; without it the sitemap and prerendered heads are skipped, since
 * both need absolute URLs.
 */
export default function seo(siteUrl: string | undefined): Plugin {
  const origin = siteUrl?.replace(/\/+$/, '')
  let root = process.cwd()
  let outDir = 'dist'
  let isBuild = false

  return {
    name: 'arcanum-seo',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
      isBuild = config.command === 'build'
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const devOrigin = origin ?? `http://${req.headers.host}`
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml')
          res.end(buildSitemap(devOrigin))
        } else if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain')
          res.end(buildRobots(devOrigin))
        } else {
          next()
        }
      })
    },
    generateBundle() {
      if (origin) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(origin) })
      } else {
        this.warn('SITE_URL not set — skipping sitemap.xml and prerendered heads (see docs/seo.md).')
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots(origin) })
    },
    closeBundle() {
      if (!isBuild || !origin) return
      const template = readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const readJson = <T,>(file: string) => JSON.parse(readFileSync(path.join(root, file), 'utf8')) as T
      for (const lang of SUPPORTED_LANGUAGES) {
        const locale = readJson<Locale>(`src/i18n/locales/${lang}.json`)
        const content = readJson<CardContentMap>(`src/content/cards/${lang}.json`)
        for (const pagePath of INDEXABLE_PATHS) {
          const dir = path.join(outDir, lang, pagePath)
          mkdirSync(dir, { recursive: true })
          const meta = pageMeta(origin, lang, pagePath, locale, content)
          writeFileSync(path.join(dir, 'index.html'), prerenderHead(template, origin, lang, pagePath, meta))
        }
      }
    },
  }
}
