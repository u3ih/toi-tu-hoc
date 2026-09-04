// The content tree, for build scripts.
//
// lib/content.ts is the version the app uses; it cannot be imported here because
// these scripts run before the TypeScript build. Rather than let each script grow
// its own copy of the walk, they all share this one — keep the two in step when
// the frontmatter contract changes.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const root = process.cwd()
export const contentDir = path.join(root, 'content')

const config = JSON.parse(fs.readFileSync(path.join(root, 'i18n.config.json'), 'utf8'))

export const LOCALES = config.locales.map((l) => l.code)
export const DEFAULT_LOCALE = config.defaultLocale
export const LOCALE_META = Object.fromEntries(config.locales.map(({ code, ...meta }) => [code, meta]))

/** Top-level route names the site owns; mirrors RESERVED_COLLECTIONS in lib/content.ts. */
const RESERVED = new Set(['topics', 'tags', 'search', 'feed', 'api', 'sitemap'])

/** Mirrors `pick` in lib/i18n.ts: a plain string, or one string per locale. */
export function pick(value, locale) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object' || Array.isArray(value)) return value
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0]
}

/** Always `/<code>` — every locale is prefixed. Mirrors lib/i18n.ts. */
export function localePrefix(locale) {
  return `/${locale}`
}

export function docHref(locale, collection, slug) {
  return `${localePrefix(locale)}/${collection}/${slug}/`
}

/** Mirrors `plainText` in lib/content.ts. */
export function plainText(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** `intro.mdx` is the default locale, `intro.en.mdx` the English translation. */
function parseFilename(file) {
  if (!file.endsWith('.mdx')) return null
  const base = file.slice(0, -'.mdx'.length)

  const dot = base.lastIndexOf('.')
  if (dot > 0 && LOCALES.includes(base.slice(dot + 1))) {
    return { slug: base.slice(0, dot), locale: base.slice(dot + 1) }
  }
  return { slug: base, locale: DEFAULT_LOCALE }
}

/** Categories, in declared order. */
export function readCategories() {
  const file = path.join(contentDir, 'categories.json')
  if (!fs.existsSync(file)) return []
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  return (raw.categories ?? []).filter((c) => c.key)
}

/**
 * Every visible collection, with its files parsed once.
 *
 * Hidden collections are dropped here, so no script has to remember to check —
 * a page kept out of listings should be out of the search index, the feeds and
 * the plain-text mirrors too.
 */
export function readCollections({ includeHidden = false } = {}) {
  if (!fs.existsSync(contentDir)) return []

  return fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .filter((e) => !RESERVED.has(e.name))
    .map((e) => {
      const dir = path.join(contentDir, e.name)
      const manifestPath = path.join(dir, 'collection.json')
      const manifest = fs.existsSync(manifestPath)
        ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        : {}

      // slug -> locale -> { data, content }
      const docs = new Map()
      for (const file of fs.readdirSync(dir)) {
        const parsed = parseFilename(file)
        if (!parsed) continue
        const byLocale = docs.get(parsed.slug) ?? new Map()
        byLocale.set(parsed.locale, matter(fs.readFileSync(path.join(dir, file), 'utf8')))
        docs.set(parsed.slug, byLocale)
      }

      return { slug: e.name, manifest, docs }
    })
    .filter((entry) => (includeHidden || entry.manifest.status !== 'hidden') && entry.docs.size > 0)
    .sort((a, b) => (a.manifest.order ?? 999) - (b.manifest.order ?? 999))
}

/** The file a locale renders: its own translation, else the default-locale one. */
export function resolveDoc(byLocale, locale) {
  const base = byLocale.get(DEFAULT_LOCALE) ?? [...byLocale.values()][0]
  const translation = byLocale.get(locale)
  return { base, text: translation ?? base, translated: translation !== undefined }
}

export function sectionTitle(manifest, key, locale) {
  const section = (manifest.sections ?? []).find((s) => s.key === key)
  return section ? (pick(section.title, locale) ?? key) : key
}

/**
 * A collection's pages in the order the site shows them: manifest section order
 * first, then `order` within a section — so a plain-text mirror reads like the
 * sidebar rather than like a directory listing.
 */
export function sortedDocs(entry, locale) {
  const order = (manifest, key) => {
    const at = (manifest.sections ?? []).findIndex((s) => s.key === key)
    return at === -1 ? Number.MAX_SAFE_INTEGER : at
  }

  return [...entry.docs.entries()]
    .map(([slug, byLocale]) => {
      const { base, text, translated } = resolveDoc(byLocale, locale)
      return { slug, base, text, translated, section: base.data.section ?? 'other' }
    })
    .filter((doc) => doc.base)
    .sort(
      (a, b) =>
        order(entry.manifest, a.section) - order(entry.manifest, b.section) ||
        (a.base.data.order ?? 999) - (b.base.data.order ?? 999) ||
        a.slug.localeCompare(b.slug),
    )
}

/** Absolute site URL, matching `siteUrl` in lib/metadata.ts. */
export function siteUrl(p = '/') {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${origin}${basePath}${p}`
}
