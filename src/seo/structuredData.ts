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
