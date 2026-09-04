import { getCollections, getDocs, plainText, type Doc } from './content'
import { LOCALE_META, localePrefix, type Locale } from './i18n'
import { siteUrl } from './metadata'
import { getSite, site } from './site'

/** Newest items to carry. Long enough to be a real archive, short enough to cache. */
const LIMIT = 40

/** Characters that would otherwise close a tag or open an entity. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString()
}

/**
 * Newest first, by whichever date the author gave.
 *
 * Undated pages sort last rather than being dropped: a reader subscribing today
 * should still see the whole archive, and an undated item is only missing its
 * `pubDate`, not its content.
 */
function feedDocs(locale: Locale): Doc[] {
  return getCollections(locale)
    .flatMap((collection) => getDocs(locale, collection.slug))
    .sort((a, b) => {
      const left = a.updated ?? a.date ?? ''
      const right = b.updated ?? b.date ?? ''
      if (left !== right) return right.localeCompare(left)
      return a.collection.localeCompare(b.collection) || a.order - b.order
    })
    .slice(0, LIMIT)
}

/**
 * RSS 2.0 for one locale.
 *
 * One feed per language rather than one mixed feed, so a Vietnamese subscriber
 * is never handed English articles — the same reason each locale has its own
 * route tree.
 */
export function renderFeed(locale: Locale): string {
  const s = getSite(locale)
  const self = siteUrl(`${localePrefix(locale)}/feed.xml`)
  const home = siteUrl(`${localePrefix(locale)}/`)
  const docs = feedDocs(locale)
  const latest = docs.find((doc) => doc.updated ?? doc.date)

  const items = docs
    .map((doc) => {
      const url = siteUrl(doc.href)
      const published = doc.updated ?? doc.date

      return [
        '    <item>',
        `      <title>${escapeXml(doc.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        published ? `      <pubDate>${rfc822(published)}</pubDate>` : '',
        `      <description>${escapeXml(doc.description || plainText(doc.body).slice(0, 300))}</description>`,
        `      <category>${escapeXml(doc.collection)}</category>`,
        ...doc.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${s.name} — ${s.tagline}`)}</title>
    <link>${escapeXml(home)}</link>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(s.description)}</description>
    <language>${LOCALE_META[locale].htmlLang}</language>
    <managingEditor>${escapeXml(site.author)}</managingEditor>
    <webMaster>${escapeXml(site.author)}</webMaster>
${latest ? `    <lastBuildDate>${rfc822(latest.updated ?? latest.date!)}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`
}

export const FEED_CONTENT_TYPE = 'application/rss+xml; charset=utf-8'
