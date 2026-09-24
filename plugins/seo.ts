import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/i18n/constants.ts'
import { landingJsonLd, type FaqItem } from '../src/seo/structuredData.ts'

/**
 * Indexable paths after the language segment, mapped to their `seo.*` key in
 * the locale files — must match the `path` prop each page passes to <Seo>.
 * Pages rendered with `noindex` (leitura, entrar, minhas-leituras) stay out
 * of the sitemap and are disallowed in robots.txt.
 */
const INDEXABLE_PAGES: Record<string, string> = {
  '': 'landing',
  jogo: 'gameSelect',
  precos: 'pricing',
}

const DISALLOWED_PATHS = ['leitura', 'entrar', 'minhas-leituras']

const OG_LOCALES: Record<string, string> = { pt: 'pt_BR', en: 'en_US' }

interface Locale {
  seo: Record<string, { title: string; description?: string }>
  faq: { items: FaqItem[] }
}

function pageUrl(siteUrl: string, lang: string, pagePath: string) {
  return `${siteUrl}/${lang}${pagePath ? `/${pagePath}` : ''}`
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildSitemap(siteUrl: string) {
  const urls = Object.keys(INDEXABLE_PAGES).flatMap((pagePath) => {
    const alternates = [
      ...SUPPORTED_LANGUAGES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(siteUrl, l, pagePath)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(siteUrl, DEFAULT_LANGUAGE, pagePath)}"/>`,
    ].join('\n')
    return SUPPORTED_LANGUAGES.map(
      (lang) => `  <url>\n    <loc>${pageUrl(siteUrl, lang, pagePath)}</loc>\n${alternates}\n  </url>`,
    )
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
function prerenderHead(template: string, siteUrl: string, lang: string, pagePath: string, locale: Locale) {
  const seo = locale.seo[INDEXABLE_PAGES[pagePath]]
  const title = escapeHtml(seo.title)
  const description = escapeHtml(seo.description ?? '')
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
    `<meta property="og:type" content="website" data-seo="true">`,
    `<meta property="og:url" content="${url}" data-seo="true">`,
    `<meta property="og:locale" content="${OG_LOCALES[lang] ?? 'en_US'}" data-seo="true">`,
    `<meta name="twitter:card" content="summary" data-seo="true">`,
    `<meta name="twitter:title" content="${title}" data-seo="true">`,
    `<meta name="twitter:description" content="${description}" data-seo="true">`,
  ]
  if (pagePath === '') {
    const jsonLd = landingJsonLd(url, lang, seo.description ?? '', locale.faq.items)
    tags.push(
      `<script type="application/ld+json" data-seo="jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
    )
  }

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace('</head>', `${tags.join('\n')}\n</head>`)
}

/**
 * Build-time SEO output: sitemap.xml and robots.txt generated from the route
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
      for (const lang of SUPPORTED_LANGUAGES) {
        const locale = JSON.parse(
          readFileSync(path.join(root, 'src/i18n/locales', `${lang}.json`), 'utf8'),
        ) as Locale
        for (const pagePath of Object.keys(INDEXABLE_PAGES)) {
          const dir = path.join(outDir, lang, pagePath)
          mkdirSync(dir, { recursive: true })
          writeFileSync(path.join(dir, 'index.html'), prerenderHead(template, origin, lang, pagePath, locale))
        }
      }
    },
  }
}
