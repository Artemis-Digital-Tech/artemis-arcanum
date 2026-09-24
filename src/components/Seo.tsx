import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n/constants'

interface SeoProps {
  title: string
  description: string
  /**
   * Path after the language segment ("" for home, "jogo" for the spread
   * picker). Omit entirely on pages with no meaningful cross-language or
   * indexable equivalent (e.g. a specific in-progress reading) — canonical
   * and hreflang tags are then left untouched.
   */
  path?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown>
  /** Path of the page's own image (a card's art); only pages with a real one pass it. */
  image?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Per-page document metadata: title, description, robots, canonical,
 * hreflang alternates, Open Graph/Twitter tags, and optional JSON-LD — all
 * upserted by attribute so client-side navigation never piles up duplicate
 * tags. `og:image` is set only for pages with a real image of their own (a
 * card's art): the project has no generic social-preview asset yet, and
 * inventing one would misrepresent the product.
 */
export default function Seo({ title, description, path, noindex, jsonLd, image }: SeoProps) {
  const { lang } = useParams<{ lang: string }>()

  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    const origin = window.location.origin
    const currentLang = lang ?? DEFAULT_LANGUAGE
    const canonicalUrl = `${origin}/${currentLang}${path ? `/${path}` : ''}`
    upsertLink('canonical', canonicalUrl)

    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', image ? 'article' : 'website')
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:locale', currentLang === 'pt' ? 'pt_BR' : 'en_US')
    if (image) upsertMeta('property', 'og:image', `${origin}${image}`)
    else document.head.querySelector('meta[property="og:image"]')?.remove()
    upsertMeta('name', 'twitter:card', 'summary')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)

    document.head.querySelectorAll('link[rel="alternate"][data-seo="true"]').forEach((el) => el.remove())
    if (path !== undefined) {
      SUPPORTED_LANGUAGES.forEach((l) => {
        upsertLink('alternate', `${origin}/${l}${path ? `/${path}` : ''}`, l)
      })
      upsertLink('alternate', `${origin}/${DEFAULT_LANGUAGE}${path ? `/${path}` : ''}`, 'x-default')
    }

    document.head.querySelector('script[data-seo="jsonld"]')?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-seo', 'jsonld')
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, path, noindex, jsonLd, image, lang])

  return null
}
