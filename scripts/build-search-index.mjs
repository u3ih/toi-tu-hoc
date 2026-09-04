// Builds public/search-index.json from content/<collection>/*.mdx so the client
// search box has something to query in a fully static export.
//
// One file covers every locale: each entry carries a `locale` field and the
// client filters on it. A page with no translation is indexed once per locale
// with the default-locale text, matching what the page itself renders.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const outFile = path.join(root, 'public', 'search-index.json')

const config = JSON.parse(fs.readFileSync(path.join(root, 'i18n.config.json'), 'utf8'))
const LOCALES = config.locales.map((l) => l.code)
const DEFAULT_LOCALE = config.defaultLocale

/** Mirrors `pick` in lib/i18n.ts: a plain string, or one string per locale. */
function pick(value, locale) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object' || Array.isArray(value)) return value
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0]
}

function localePrefix(locale) {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
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

function stripMdx(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*|]+\s*/gm, ' ')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const collections = fs.existsSync(contentDir)
  ? fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map((e) => e.name)
  : []

const index = []

for (const collection of collections) {
  const dir = path.join(contentDir, collection)
  const manifestPath = path.join(dir, 'collection.json')
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {}

  if (manifest.status === 'hidden') continue

  // slug -> locale -> parsed file
  const docs = new Map()

  for (const file of fs.readdirSync(dir)) {
    const parsed = parseFilename(file)
    if (!parsed) continue

    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
    const byLocale = docs.get(parsed.slug) ?? new Map()
    byLocale.set(parsed.locale, { data, content })
    docs.set(parsed.slug, byLocale)
  }

  for (const locale of LOCALES) {
    const sectionTitle = (key) => {
      const section = (manifest.sections ?? []).find((s) => s.key === key)
      return section ? (pick(section.title, locale) ?? key) : key
    }

    for (const [slug, byLocale] of docs) {
      const base = byLocale.get(DEFAULT_LOCALE) ?? [...byLocale.values()][0]
      if (!base) continue

      const text = byLocale.get(locale) ?? base
      const headings = [...text.content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) =>
        m[1].replace(/[*_`]/g, ''),
      )

      index.push({
        locale,
        collection,
        collectionTitle: pick(manifest.title, locale) ?? collection,
        slug,
        href: `${localePrefix(locale)}/${collection}/${slug}/`,
        title: text.data.title ?? slug,
        description: text.data.description ?? '',
        section: sectionTitle(base.data.section ?? 'other'),
        headings,
        text: stripMdx(text.content).slice(0, 8000),
      })
    }
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(index))
console.log(
  `search index: ${index.length} entries (${collections.length} collections × ${LOCALES.length} locales) -> public/search-index.json`,
)
