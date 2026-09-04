import type { Collection, Doc, DocMeta } from './content'
import { LOCALE_META, localePrefix, type Locale } from './i18n'
import { siteUrl } from './metadata'
import { getSite } from './site'

/**
 * JSON-LD builders. Every page emits one graph so search engines see the site,
 * the author and the page as connected nodes instead of three loose objects.
 */

type Node = Record<string, unknown>

const SITE_ID = '#website'
const AUTHOR_ID = '#author'

function baseNodes(locale: Locale): Node[] {
  const s = getSite(locale)
  const home = siteUrl(`${localePrefix(locale)}/`)

  return [
    {
      '@type': 'Person',
      '@id': siteUrl('/') + AUTHOR_ID,
      name: s.author,
      url: siteUrl('/'),
    },
    {
      '@type': 'WebSite',
      '@id': siteUrl('/') + SITE_ID,
      url: home,
      name: s.name,
      description: s.description,
      inLanguage: LOCALE_META[locale].htmlLang,
      author: { '@id': siteUrl('/') + AUTHOR_ID },
      publisher: { '@id': siteUrl('/') + AUTHOR_ID },
    },
  ]
}

function graph(nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

export function homeSchema(locale: Locale, collections: Collection[]): Node {
  const s = getSite(locale)

  return graph([
    ...baseNodes(locale),
    {
      '@type': 'CollectionPage',
      '@id': siteUrl(`${localePrefix(locale)}/`) + '#page',
      url: siteUrl(`${localePrefix(locale)}/`),
      name: `${s.name} — ${s.tagline}`,
      description: s.description,
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
      hasPart: collections.map((c) => ({
        '@type': 'Blog',
        url: siteUrl(c.href),
        name: c.title,
        description: c.description,
      })),
    },
  ])
}

function breadcrumb(locale: Locale, trail: { name: string; href: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: siteUrl(step.href),
    })),
  }
}

export function collectionSchema(locale: Locale, collection: Collection, docs: DocMeta[]): Node {
  const s = getSite(locale)

  return graph([
    ...baseNodes(locale),
    breadcrumb(locale, [
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: collection.title, href: collection.href },
    ]),
    {
      '@type': 'Blog',
      '@id': siteUrl(collection.href) + '#blog',
      url: siteUrl(collection.href),
      name: collection.title,
      description: collection.description,
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
      author: { '@id': siteUrl('/') + AUTHOR_ID },
      blogPost: docs.map((doc) => ({
        '@type': 'BlogPosting',
        headline: doc.title,
        description: doc.description,
        url: siteUrl(doc.href),
        ...(doc.date ? { datePublished: doc.date } : {}),
        ...(doc.updated ? { dateModified: doc.updated } : {}),
      })),
    },
  ])
}

export function docSchema(locale: Locale, collection: Collection, doc: Doc, sectionTitle: string): Node {
  const s = getSite(locale)

  return graph([
    ...baseNodes(locale),
    breadcrumb(locale, [
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: collection.title, href: collection.href },
      { name: doc.title, href: doc.href },
    ]),
    {
      '@type': 'BlogPosting',
      '@id': siteUrl(doc.href) + '#article',
      mainEntityOfPage: { '@type': 'WebPage', '@id': siteUrl(doc.href) },
      url: siteUrl(doc.href),
      headline: doc.title,
      description: doc.description,
      articleSection: sectionTitle,
      inLanguage: LOCALE_META[locale].htmlLang,
      wordCount: doc.body.split(/\s+/).filter(Boolean).length,
      timeRequired: `PT${doc.readingTime}M`,
      isPartOf: { '@id': siteUrl(collection.href) + '#blog' },
      author: { '@id': siteUrl('/') + AUTHOR_ID },
      publisher: { '@id': siteUrl('/') + AUTHOR_ID },
      ...(doc.date ? { datePublished: doc.date } : {}),
      ...(doc.updated ? { dateModified: doc.updated } : {}),
    },
  ])
}

export function notFoundSchema(locale: Locale, title: string): Node {
  return graph([
    ...baseNodes(locale),
    {
      '@type': 'WebPage',
      name: title,
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
    },
  ])
}
