import type { CategoryGroup, Collection, Doc, DocMeta, Tag } from './content'
import { LOCALE_META, localePrefix, path, t, type Locale } from './i18n'
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

export function homeSchema(
  locale: Locale,
  collections: Collection[],
  groups: CategoryGroup[] = [],
): Node {
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
      // Naming the areas the site covers, not just the collections inside them,
      // gives an engine the broad subject as well as the specific ones.
      ...(groups.length
        ? {
            about: groups.map((group) => ({
              '@type': 'Thing',
              name: group.category.title,
              ...(group.category.description ? { description: group.category.description } : {}),
            })),
          }
        : {}),
      hasPart: collections.map((c) => ({
        '@type': 'Blog',
        url: siteUrl(c.href),
        name: c.title,
        description: c.description,
      })),
    },
  ])
}

/** An ordered list of links, the shape engines read hub pages with. */
function itemList(items: { name: string; href: string; description?: string }[]): Node {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: siteUrl(item.href),
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}

export function topicsSchema(locale: Locale, groups: CategoryGroup[]): Node {
  const s = getSite(locale)
  const collections = groups.flatMap((group) => group.collections)

  return graph([
    ...baseNodes(locale),
    breadcrumb(locale, [
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'topics.title'), href: path(locale, 'topics') },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': siteUrl(path(locale, 'topics')) + '#page',
      url: siteUrl(path(locale, 'topics')),
      name: t(locale, 'topics.title'),
      description: t(locale, 'topics.description'),
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
      mainEntity: itemList(
        collections.map((c) => ({ name: c.title, href: c.href, description: c.description })),
      ),
    },
  ])
}

export function tagsSchema(locale: Locale, tags: Tag[]): Node {
  const s = getSite(locale)

  return graph([
    ...baseNodes(locale),
    breadcrumb(locale, [
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'tags.title'), href: path(locale, 'tags') },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': siteUrl(path(locale, 'tags')) + '#page',
      url: siteUrl(path(locale, 'tags')),
      name: t(locale, 'tags.title'),
      description: t(locale, 'tags.description'),
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
      mainEntity: itemList(
        tags.map((tag) => ({ name: tag.label, href: path(locale, 'tags', tag.key) })),
      ),
    },
  ])
}

export function tagSchema(locale: Locale, key: string, label: string, docs: DocMeta[]): Node {
  const s = getSite(locale)
  const href = path(locale, 'tags', key)

  return graph([
    ...baseNodes(locale),
    breadcrumb(locale, [
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'tags.title'), href: path(locale, 'tags') },
      { name: label, href },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': siteUrl(href) + '#page',
      url: siteUrl(href),
      name: t(locale, 'tag.title', { tag: label }),
      description: t(locale, 'tag.description', { tag: label }),
      inLanguage: LOCALE_META[locale].htmlLang,
      isPartOf: { '@id': siteUrl('/') + SITE_ID },
      about: { '@type': 'Thing', name: label },
      mainEntity: itemList(
        docs.map((doc) => ({ name: doc.title, href: doc.href, description: doc.description })),
      ),
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
