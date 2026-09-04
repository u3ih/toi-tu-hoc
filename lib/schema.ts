import { blocksOf, getCollections, linksIn, plainText } from './content'
import type { CategoryGroup, Collection, Doc, DocMeta, Tag } from './content'
import { LOCALE_META, localePrefix, path, t, type Locale } from './i18n'
import { siteUrl } from './metadata'
import { getSite, site } from './site'

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
  // What the site actually covers, straight from the content tree — so the claim
  // stays true as topics are added rather than rotting in a hand-kept list.
  const knowsAbout = getCollections(locale).map((c) => c.title)

  return [
    {
      '@type': 'Person',
      '@id': siteUrl('/') + AUTHOR_ID,
      name: s.author,
      url: siteUrl('/'),
      description: s.authorBio,
      jobTitle: s.authorRole,
      ...(site.authorProfiles.length ? { sameAs: site.authorProfiles } : {}),
      ...(knowsAbout.length ? { knowsAbout } : {}),
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
      '@id': `${siteUrl(`${localePrefix(locale)}/`)}#page`,
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
    breadcrumb([
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'topics.title'), href: path(locale, 'topics') },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl(path(locale, 'topics'))}#page`,
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
    breadcrumb([
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'tags.title'), href: path(locale, 'tags') },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl(path(locale, 'tags'))}#page`,
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
    breadcrumb([
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: t(locale, 'tags.title'), href: path(locale, 'tags') },
      { name: label, href },
    ]),
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl(href)}#page`,
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

function breadcrumb(trail: { name: string; href: string }[]): Node {
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
    breadcrumb([
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: collection.title, href: collection.href },
    ]),
    {
      '@type': 'Blog',
      '@id': `${siteUrl(collection.href)}#blog`,
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

/**
 * `## Question` + the prose under it, as an FAQPage.
 *
 * This is the one markup on the site that an answer engine can lift a complete
 * answer out of without guessing where the answer ends, so a page that really is
 * a list of questions should say so — `schema: faq` in its frontmatter.
 */
function faqNode(locale: Locale, doc: Doc): Node | null {
  const blocks = blocksOf(doc.body, 2).filter((block) => block.text.length > 40)
  if (blocks.length < 2) return null

  return {
    '@type': 'FAQPage',
    '@id': `${siteUrl(doc.href)}#faq`,
    url: siteUrl(doc.href),
    name: doc.title,
    inLanguage: LOCALE_META[locale].htmlLang,
    mainEntity: blocks.map((block) => ({
      '@type': 'Question',
      name: block.heading,
      url: `${siteUrl(doc.href)}#${block.id}`,
      acceptedAnswer: { '@type': 'Answer', text: block.text },
    })),
  }
}

/** `### Step` blocks as a HowTo, for pages that really are a sequence. */
function howToNode(locale: Locale, doc: Doc): Node | null {
  // Steps are the page's top-level structure, so h2 first — preferring h3 would
  // silently reduce a guide to whichever section happened to have sub-steps.
  const steps = [blocksOf(doc.body, 2), blocksOf(doc.body, 3)].find((set) => set.length >= 2)
  if (!steps) return null

  return {
    '@type': 'HowTo',
    '@id': `${siteUrl(doc.href)}#howto`,
    url: siteUrl(doc.href),
    name: doc.title,
    description: doc.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    totalTime: `PT${doc.readingTime}M`,
    step: steps.map((block, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: block.heading,
      url: `${siteUrl(doc.href)}#${block.id}`,
      text: block.text.slice(0, 1200),
    })),
  }
}

/**
 * The links under the page's own "sources" heading, as `citation`.
 *
 * Pulled out of the prose rather than asked for again in frontmatter: the style
 * guide already requires every borrowed number to be linked at the point it is
 * used and gathered under that heading, so the list exists. Duplicating it in
 * frontmatter would only create a second copy to forget to update.
 */
function citationsOf(locale: Locale, doc: Doc): Node[] {
  const wanted = fold(t(locale, 'doc.sourcesHeading'))
  const block = blocksOf(doc.body, 2).find((candidate) => fold(candidate.heading) === wanted)
  if (!block) return []

  return linksIn(block.raw).map((link) => ({
    '@type': 'CreativeWork',
    name: link.text,
    url: link.url,
  }))
}

/** Compare headings without tripping over case, diacritics or stray punctuation. */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function docSchema(
  locale: Locale,
  collection: Collection,
  doc: Doc,
  sectionTitle: string,
): Node {
  const s = getSite(locale)
  const extra =
    doc.schemaType === 'faq'
      ? faqNode(locale, doc)
      : doc.schemaType === 'howto'
        ? howToNode(locale, doc)
        : null
  const citations = citationsOf(locale, doc)

  return graph([
    ...baseNodes(locale),
    breadcrumb([
      { name: s.name, href: `${localePrefix(locale)}/` },
      { name: collection.title, href: collection.href },
      { name: doc.title, href: doc.href },
    ]),
    {
      '@type': 'BlogPosting',
      '@id': `${siteUrl(doc.href)}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': siteUrl(doc.href) },
      url: siteUrl(doc.href),
      headline: doc.title,
      description: doc.description,
      articleSection: sectionTitle,
      inLanguage: LOCALE_META[locale].htmlLang,
      wordCount: plainText(doc.body).split(/\s+/).filter(Boolean).length,
      timeRequired: `PT${doc.readingTime}M`,
      isPartOf: { '@id': `${siteUrl(collection.href)}#blog` },
      author: { '@id': siteUrl('/') + AUTHOR_ID },
      publisher: { '@id': siteUrl('/') + AUTHOR_ID },
      ...(doc.tags.length ? { keywords: doc.tags.join(', ') } : {}),
      ...(doc.takeaways.length
        ? {
            abstract: doc.takeaways.join(' '),
            // Points a voice or answer surface at the summary the author wrote,
            // rather than letting it pick the first paragraph it finds.
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['[data-takeaways]'],
            },
          }
        : {}),
      ...(doc.about.length
        ? {
            about: doc.about.map((entity) => ({
              '@type': 'Thing',
              name: entity.name,
              ...(entity.sameAs ? { sameAs: entity.sameAs } : {}),
            })),
          }
        : {}),
      ...(citations.length ? { citation: citations } : {}),
      ...(extra ? { mainEntity: { '@id': extra['@id'] } } : {}),
      ...(doc.date ? { datePublished: doc.date } : {}),
      ...(doc.updated ? { dateModified: doc.updated } : {}),
    },
    ...(extra ? [extra] : []),
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
