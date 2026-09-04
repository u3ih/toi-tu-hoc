import type { MetadataRoute } from 'next'
import { getCollections, getDocs, getTags } from '@/lib/content'
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePrefix } from '@/lib/i18n'
import { siteUrl } from '@/lib/metadata'

export const dynamic = 'force-static'

/** hreflang alternates for one locale-independent path. */
function languages(bare: string) {
  return Object.fromEntries(
    LOCALES.map((locale) => [LOCALE_META[locale].htmlLang, siteUrl(`${localePrefix(locale)}${bare}`)]),
  )
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

  add('/', 1)
  add('/topics/', 0.9)

  // Hidden collections are excluded from getCollections, so they never surface here.
  for (const collection of getCollections(DEFAULT_LOCALE)) {
    add(`/${collection.slug}/`, 0.8)

    for (const doc of getDocs(DEFAULT_LOCALE, collection.slug)) {
      add(`/${collection.slug}/${doc.slug}/`, 0.7, doc.updated)
    }
  }

  const tags = getTags(DEFAULT_LOCALE)
  if (tags.length > 0) {
    add('/tags/', 0.5)
    for (const tag of tags) add(`/tags/${tag.key}/`, 0.4)
  }

  return entries
}
