export interface FaqItem {
  q: string
  a: string
}

/**
 * JSON-LD for the landing page: the WebSite itself plus a FAQPage built from
 * the same FAQ copy rendered on the page (Google only honours FAQ markup that
 * matches visible content). Shared by the landing page and the build-time
 * prerender in plugins/sitemap.ts so both always emit the same data.
 */
const PUBLISHER = { '@type': 'Organization', name: 'Artemis Digital Tech' }

interface PageInfo {
  url: string
  lang: string
  name: string
  description: string
}

/** The cards index: a collection page listing every card page in journey order. */
export function cardsIndexJsonLd(page: PageInfo & { items: { name: string; url: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.name,
    description: page.description,
    url: page.url,
    inLanguage: page.lang,
    publisher: PUBLISHER,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: page.items.length,
      itemListElement: page.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  }
}

/** One card page: an article about the card, plus its breadcrumb back to the index. */
export function cardJsonLd(
  page: PageInfo & { image: string; cardName: string; cardsName: string; cardsUrl: string },
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: page.name,
        description: page.description,
        image: page.image,
        url: page.url,
        inLanguage: page.lang,
        about: page.cardName,
        author: PUBLISHER,
        publisher: PUBLISHER,
        mainEntityOfPage: page.url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: page.cardsName, item: page.cardsUrl },
          { '@type': 'ListItem', position: 2, name: page.cardName, item: page.url },
        ],
      },
    ],
  }
}

export function aboutJsonLd(page: PageInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: page.name,
    description: page.description,
    url: page.url,
    inLanguage: page.lang,
    publisher: PUBLISHER,
  }
}

export function landingJsonLd(url: string, lang: string, description: string, faq: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Arcanum',
        url,
        description,
        inLanguage: lang,
      },
      {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}
