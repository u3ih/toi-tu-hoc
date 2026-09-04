import fs from 'node:fs'
import nodePath from 'node:path'
import matter from 'gray-matter'
import {
  DEFAULT_LOCALE,
  isLocale,
  path as localePath,
  pick,
  t,
  type Locale,
  type Localized,
} from './i18n'
import { DEFAULT_ACCENT, isAccent, resolvePalette, type Accent, type Palette } from './accent'

const CONTENT_DIR = nodePath.join(process.cwd(), 'content')

export { ACCENTS, type Accent } from './accent'

/**
 * Top-level route segments the site owns. A content folder with one of these
 * names would be shadowed by the static route of the same name, so it is skipped
 * loudly at build time rather than silently 404ing in production.
 */
const RESERVED_COLLECTIONS = new Set(['topics', 'tags', 'search', 'feed', 'api', 'sitemap'])

/** A resolved section: `key` is the stable id used in frontmatter, `title` is display text. */
export type Section = { key: string; title: string; emoji?: string }

/**
 * A group of collections, one level above them.
 *
 * Collections alone stop scaling past about eight — the home grid becomes a wall
 * and the switcher becomes a scroll. Categories give the site somewhere to put
 * the tenth and twentieth topic without redesigning anything.
 */
export type Category = {
  key: string
  title: string
  description: string
  emoji: string
  order: number
}

export type Collection = {
  slug: string
  locale: Locale
  href: string
  title: string
  shortTitle: string
  description: string
  emoji: string
  /** Named palette, kept for the search index and as a debugging attribute. */
  accent: Accent
  /** The resolved colour ramp; `paletteVars` turns this into inline CSS variables. */
  palette: Palette
  /** Category key, matched against `content/categories.json`. */
  category?: string
  order: number
  /** 'wip' renders a "đang viết" badge; 'hidden' keeps it out of listings. */
  status: 'active' | 'wip' | 'hidden'
  sections: Section[]
  docCount: number
}

/** A category with the collections that belong to it, for the home and /topics/ pages. */
export type CategoryGroup = { category: Category; collections: Collection[] }

/** A tag, resolved for one locale. `key` is the routing key, `label` is display text. */
export type Tag = { key: string; label: string; count: number }

export type Heading = { id: string; text: string; level: 2 | 3 }

export type DocMeta = {
  collection: string
  slug: string
  locale: Locale
  href: string
  title: string
  description: string
  /** Section key, matched against `Collection.sections[].key`. */
  section: string
  order: number
  readingTime: number
  /**
   * Cross-collection tags. Like section keys these are routing keys — lowercase
   * English — because they appear in URLs; display labels live in tags.json.
   */
  tags: string[]
  /** ISO dates from frontmatter, when the author set them. Used for SEO and sitemaps. */
  date?: string
  updated?: string
  /** False when this locale has no translation and the default-locale text is shown. */
  translated: boolean
}

export type Doc = DocMeta & { headings: Heading[]; body: string }

export type NavGroup = { section: Section; items: DocMeta[] }

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Pull `##` and `###` headings out of the raw MDX for the table of contents. */
function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = []
  let inFence = false

  for (const line of body.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const text = match[2].replace(/[*_`]/g, '')
    headings.push({ id: slugify(text), text, level: match[1].length as 2 | 3 })
  }
  return headings
}

/* --- Discovery ------------------------------------------------------------ */

type RawSection = { key?: string; title?: Localized; emoji?: string }

type RawManifest = {
  title?: Localized
  shortTitle?: Localized
  description?: Localized
  emoji?: string
  accent?: string
  hue?: number
  hueEnd?: number
  chroma?: number
  category?: string
  order?: number
  status?: Collection['status']
  sections?: RawSection[]
}

/** One .mdx file, before locales are merged. */
type RawDoc = {
  title: string
  description: string
  section: string
  order: number
  readingTime: number
  tags: string[]
  date?: string
  updated?: string
  headings: Heading[]
  body: string
}

type Entry = {
  manifest: RawManifest
  /** slug → locale → file contents. */
  docs: Map<string, Map<Locale, RawDoc>>
}

/**
 * `intro.mdx` is the default locale; `intro.en.mdx` is the English translation.
 * Anything else that ends in .mdx is treated as default-locale content.
 */
function parseFilename(file: string): { slug: string; locale: Locale } | null {
  if (!file.endsWith('.mdx')) return null
  const base = file.slice(0, -'.mdx'.length)

  const dot = base.lastIndexOf('.')
  if (dot > 0) {
    const suffix = base.slice(dot + 1)
    if (isLocale(suffix)) return { slug: base.slice(0, dot), locale: suffix }
  }
  return { slug: base, locale: DEFAULT_LOCALE }
}

/** gray-matter turns unquoted YAML dates into Date objects; normalise both forms. */
function toIsoDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString().slice(0, 10)
  }
  return undefined
}

/** Frontmatter lists are hand-written, so accept a YAML list or a comma-separated string. */
function toKeys(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []

  return [...new Set(raw.map((item) => slugify(String(item))).filter(Boolean))]
}

function readDoc(file: string): RawDoc {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const words = content.split(/\s+/).filter(Boolean).length

  return {
    title: data.title ?? '',
    description: data.description ?? '',
    section: data.section ?? 'other',
    order: typeof data.order === 'number' ? data.order : 999,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    tags: toKeys(data.tags),
    date: toIsoDate(data.date),
    updated: toIsoDate(data.updated),
    headings: extractHeadings(content),
    body: content,
  }
}

function readJson<T>(file: string, fallback: T): T {
  const full = nodePath.join(CONTENT_DIR, file)
  if (!fs.existsSync(full)) return fallback
  return JSON.parse(fs.readFileSync(full, 'utf8')) as T
}

// Content never changes within a build, so read the tree once.
let cache: Map<string, Entry> | null = null

function load(): Map<string, Entry> {
  if (cache) return cache
  cache = new Map()

  if (!fs.existsSync(CONTENT_DIR)) return cache

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .map((e) => e.name)

  for (const slug of dirs) {
    if (RESERVED_COLLECTIONS.has(slug)) {
      console.warn(
        `content: skipping content/${slug}/ — "${slug}" is a reserved route. Rename the folder.`,
      )
      continue
    }

    const dir = nodePath.join(CONTENT_DIR, slug)
    const manifestPath = nodePath.join(dir, 'collection.json')

    // A manifest is optional — a bare folder of .mdx files still works.
    const manifest: RawManifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      : {}

    const docs = new Map<string, Map<Locale, RawDoc>>()

    for (const file of fs.readdirSync(dir)) {
      const parsed = parseFilename(file)
      if (!parsed) continue

      const byLocale = docs.get(parsed.slug) ?? new Map<Locale, RawDoc>()
      byLocale.set(parsed.locale, readDoc(nodePath.join(dir, file)))
      docs.set(parsed.slug, byLocale)
    }

    cache.set(slug, { manifest, docs })
  }

  return cache
}

/* --- Resolution ----------------------------------------------------------- */

/** The file a locale actually renders: its own translation, else the default one. */
function resolve(byLocale: Map<Locale, RawDoc>, locale: Locale) {
  const base = byLocale.get(DEFAULT_LOCALE) ?? [...byLocale.values()][0]
  const translation = byLocale.get(locale)
  return { base, translation }
}

function toDoc(
  collection: string,
  slug: string,
  byLocale: Map<Locale, RawDoc>,
  locale: Locale,
): Doc | null {
  const { base, translation } = resolve(byLocale, locale)
  if (!base) return null

  // Structure stays canonical so ordering and grouping match across locales;
  // only the prose swaps out.
  const text = translation ?? base

  return {
    collection,
    slug,
    locale,
    href: localePath(locale, collection, slug),
    title: text.title || slug,
    description: text.description,
    section: base.section,
    order: base.order,
    readingTime: text.readingTime,
    tags: base.tags,
    date: base.date,
    updated: text.updated ?? base.updated ?? base.date,
    translated: translation !== undefined,
    headings: text.headings,
    body: text.body,
  }
}

function toCollection(slug: string, entry: Entry, locale: Locale): Collection {
  const { manifest, docs } = entry

  const declared: Section[] = (manifest.sections ?? []).map((section, i) => ({
    key: section.key ?? pick(section.title, DEFAULT_LOCALE) ?? `section-${i}`,
    title: pick(section.title, locale) ?? section.key ?? `section-${i}`,
    emoji: section.emoji,
  }))

  // A section used by a doc but missing from the manifest still gets rendered.
  const used = [...new Set([...docs.values()].map((d) => resolve(d, locale).base?.section))]
  const extra: Section[] = used
    .filter((key): key is string => !!key && !declared.some((s) => s.key === key))
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({ key, title: key }))

  const title = pick(manifest.title, locale) ?? slug

  return {
    slug,
    locale,
    href: localePath(locale, slug),
    title,
    shortTitle: pick(manifest.shortTitle, locale) ?? title,
    description: pick(manifest.description, locale) ?? '',
    emoji: manifest.emoji ?? '📘',
    accent: isAccent(manifest.accent) ? manifest.accent : DEFAULT_ACCENT,
    palette: resolvePalette(manifest),
    category: manifest.category,
    order: typeof manifest.order === 'number' ? manifest.order : 999,
    status: manifest.status ?? 'active',
    sections: [...declared, ...extra],
    docCount: docs.size,
  }
}

/* --- Categories ----------------------------------------------------------- */

type RawCategory = {
  key?: string
  title?: Localized
  description?: Localized
  emoji?: string
  order?: number
}

/** The category every collection without one falls into, so nothing goes missing. */
const UNCATEGORISED = '__other'

function loadCategories(locale: Locale): Category[] {
  const raw = readJson<{ categories?: RawCategory[] }>('categories.json', {})

  return (raw.categories ?? [])
    .filter((c): c is RawCategory & { key: string } => typeof c.key === 'string')
    .map((c, i) => ({
      key: c.key,
      title: pick(c.title, locale) ?? c.key,
      description: pick(c.description, locale) ?? '',
      emoji: c.emoji ?? '📂',
      order: typeof c.order === 'number' ? c.order : i,
    }))
}

/**
 * Collections grouped by category, in category order.
 *
 * Categories with nothing in them are dropped — the file can declare where the
 * site is going without the home page advertising empty shelves.
 */
export function getCategories(locale: Locale, { includeHidden = false } = {}): CategoryGroup[] {
  const collections = getCollections(locale, { includeHidden })
  const declared = loadCategories(locale)

  const groups: CategoryGroup[] = declared.map((category) => ({
    category,
    collections: collections.filter((c) => c.category === category.key),
  }))

  const known = new Set(declared.map((c) => c.key))
  const leftovers = collections.filter((c) => !c.category || !known.has(c.category))

  if (leftovers.length > 0) {
    groups.push({
      category: {
        key: UNCATEGORISED,
        title: t(locale, 'home.more'),
        description: '',
        emoji: '📦',
        order: Number.MAX_SAFE_INTEGER,
      },
      collections: leftovers,
    })
  }

  return groups
    .filter((group) => group.collections.length > 0)
    .sort((a, b) => a.category.order - b.category.order)
}

/* --- Tags ----------------------------------------------------------------- */

function loadTagLabels(locale: Locale): Record<string, string> {
  const raw = readJson<{ labels?: Record<string, Localized> }>('tags.json', {})

  return Object.fromEntries(
    Object.entries(raw.labels ?? {}).map(([key, value]) => [key, pick(value, locale) ?? key]),
  )
}

/** Turn a routing key into something readable when tags.json has no label for it. */
function humanise(key: string): string {
  return key.replace(/-/g, ' ')
}

export function tagLabel(locale: Locale, key: string): string {
  return loadTagLabels(locale)[key] ?? humanise(key)
}

/** Every tag in use, most-used first, then alphabetical. */
export function getTags(locale: Locale): Tag[] {
  const labels = loadTagLabels(locale)
  const counts = new Map<string, number>()

  for (const collection of getCollections(locale)) {
    for (const doc of docsOf(collection.slug, locale)) {
      for (const tag of doc.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labels[key] ?? humanise(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, locale))
}

/** Every doc carrying one tag, across every visible collection. */
export function getDocsByTag(locale: Locale, tag: string): DocMeta[] {
  return getCollections(locale)
    .flatMap((collection) => docsOf(collection.slug, locale))
    .filter((doc) => doc.tags.includes(tag))
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .map(toMeta)
}

/**
 * Docs worth reading next.
 *
 * Shared tags weigh most, because a tag is the only signal that deliberately
 * crosses collections — which is the whole point of showing this block. Section
 * and collection matches break ties so a tagless doc still gets neighbours.
 */
export function getRelated(locale: Locale, doc: DocMeta, limit = 4): DocMeta[] {
  const tags = new Set(doc.tags)

  return getCollections(locale)
    .flatMap((collection) => docsOf(collection.slug, locale))
    .filter((other) => !(other.collection === doc.collection && other.slug === doc.slug))
    .map((other) => {
      const shared = other.tags.filter((tag) => tags.has(tag)).length
      let score = shared * 4
      if (other.collection === doc.collection) {
        score += other.section === doc.section ? 2 : 1
      }
      return { doc: other, score, shared }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.order - b.doc.order)
    .slice(0, limit)
    .map((entry) => toMeta(entry.doc))
}

/* --- Public API ----------------------------------------------------------- */

export function getCollections(locale: Locale, { includeHidden = false } = {}): Collection[] {
  return [...load().entries()]
    .map(([slug, entry]) => toCollection(slug, entry, locale))
    .filter((c) => (includeHidden ? true : c.status !== 'hidden') && c.docCount > 0)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, locale))
}

export function getCollection(locale: Locale, slug: string): Collection | null {
  const entry = load().get(slug)
  return entry ? toCollection(slug, entry, locale) : null
}

export function getDoc(locale: Locale, collection: string, slug: string): Doc | null {
  const byLocale = load().get(collection)?.docs.get(slug)
  return byLocale ? toDoc(collection, slug, byLocale, locale) : null
}

function sortDocs(docs: Doc[], locale: Locale) {
  return [...docs].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, locale))
}

function docsOf(collection: string, locale: Locale): Doc[] {
  const entry = load().get(collection)
  if (!entry) return []

  return [...entry.docs.entries()]
    .map(([slug, byLocale]) => toDoc(collection, slug, byLocale, locale))
    .filter((d): d is Doc => d !== null)
}

/** Sidebar structure: sections in manifest order, docs in `order` order. */
export function getNav(locale: Locale, collection: string): NavGroup[] {
  const meta = getCollection(locale, collection)
  if (!meta) return []

  const docs = docsOf(collection, locale)

  return meta.sections
    .map((section) => ({
      section,
      items: sortDocs(
        docs.filter((d) => d.section === section.key),
        locale,
      ).map(toMeta),
    }))
    .filter((group) => group.items.length > 0)
}

/** Flattened sidebar order — used for prev/next paging. */
export function getFlatNav(locale: Locale, collection: string): DocMeta[] {
  return getNav(locale, collection).flatMap((g) => g.items)
}

/** Every doc in a collection, sorted, for listings. */
export function getDocs(locale: Locale, collection: string): Doc[] {
  return sortDocs(docsOf(collection, locale), locale)
}

/** Every doc across every collection, for the search index. */
export function getAllDocs(locale: Locale): Doc[] {
  return [...load().keys()].flatMap((collection) => getDocs(locale, collection))
}

/**
 * Routing keys are locale-independent, so static params are generated once and
 * reused by every locale's route tree.
 */
export function getAllDocPaths(): { collection: string; slug: string }[] {
  return [...load().entries()].flatMap(([collection, entry]) =>
    [...entry.docs.keys()].map((slug) => ({ collection, slug })),
  )
}

export function getAllCollectionPaths(): { collection: string }[] {
  return [...load().keys()].map((collection) => ({ collection }))
}

export function getAllTagPaths(): { tag: string }[] {
  return getTags(DEFAULT_LOCALE).map(({ key }) => ({ tag: key }))
}

function toMeta(doc: Doc): DocMeta {
  const { headings: _headings, body: _body, ...meta } = doc
  return meta
}
