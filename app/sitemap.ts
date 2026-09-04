import type { MetadataRoute } from 'next'
import { getCollections, getDocs, getTags, type Doc } from '@/lib/content'
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePrefix } from '@/lib/i18n'
import { siteUrl } from '@/lib/metadata'

export const dynamic = 'force-static'

/** hreflang alternates for one locale-independent path. */
function languages(bare: string) {
  return Object.fromEntries(
    LOCALES.map((locale) => [LOCALE_META[locale].htmlLang, siteUrl(`${localePrefix(locale)}${bare}`)]),
  )
}

/** The most recent date any of these pages carries, for a hub's <lastmod>. */
function newest(docs: Doc[]): string | undefined {
  return docs
    .map((doc) => doc.updated ?? doc.date)
    .filter((date): date is string => !!date)
    .sort()
    .at(-1)
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  const add = (bare: string, priority: number, lastModified?: string) => {
    for (const locale of LOCALES) {
      entries.push({
        url: siteUrl(`${localePrefix(locale)}${bare}`),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'weekly',
        priority,
        alternates: { languages: languages(bare) },
      })
    }
  }

  // Hidden collections are excluded from getCollections, so they never surface here.
  const collections = getCollections(DEFAULT_LOCALE)
  const byCollection = collections.map((collection) => ({
    collection,
    docs: getDocs(DEFAULT_LOCALE, collection.slug),
  }))
  const everything = byCollection.flatMap((entry) => entry.docs)

  // A hub with no <lastmod> gives a crawler no reason to come back; inherit the
  // freshest date from whatever the hub links to.
  add('/', 1, newest(everything))
  add('/topics/', 0.9, newest(everything))

  for (const { collection, docs } of byCollection) {
    add(`/${collection.slug}/`, 0.8, newest(docs))

    for (const doc of docs) {
      add(`/${collection.slug}/${doc.slug}/`, 0.7, doc.updated)
    }
  }

  const tags = getTags(DEFAULT_LOCALE)
  if (tags.length > 0) {
    add('/tags/', 0.5, newest(everything))
    for (const tag of tags) {
      const tagged = everything.filter((doc) => doc.tags.includes(tag.key))
      add(`/tags/${tag.key}/`, 0.4, newest(tagged))
    }
  }

  return entries
}
