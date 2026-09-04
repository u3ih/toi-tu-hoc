import fs from 'node:fs'
import nodePath from 'node:path'
import matter from 'gray-matter'
import {
  DEFAULT_LOCALE,
  isLocale,
  path as localePath,
  pick,
  type Locale,
  type Localized,
} from './i18n'

const CONTENT_DIR = nodePath.join(process.cwd(), 'content')

/** Accent palettes defined in app/globals.css under [data-accent='…']. */
export const ACCENTS = ['indigo', 'violet', 'sky', 'emerald', 'amber', 'rose'] as const
export type Accent = (typeof ACCENTS)[number]

/** A resolved section: `key` is the stable id used in frontmatter, `title` is display text. */
export type Section = { key: string; title: string; emoji?: string }

export type Collection = {
  slug: string
  locale: Locale
  href: string
  title: string
  shortTitle: string
  description: string
  emoji: string
  accent: Accent
  order: number
  /** 'wip' renders a "đang viết" badge; 'hidden' keeps it out of listings. */
  status: 'active' | 'wip' | 'hidden'
  sections: Section[]
  docCount: number
}

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

function readDoc(file: string): RawDoc {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const words = content.split(/\s+/).filter(Boolean).length

  return {
    title: data.title ?? '',
    description: data.description ?? '',
    section: data.section ?? 'other',
    order: typeof data.order === 'number' ? data.order : 999,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    date: toIsoDate(data.date),
    updated: toIsoDate(data.updated),
    headings: extractHeadings(content),
    body: content,
  }
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

  const accent = (ACCENTS as readonly string[]).includes(manifest.accent ?? '')
    ? (manifest.accent as Accent)
    : 'indigo'

  const title = pick(manifest.title, locale) ?? slug

  return {
    slug,
    locale,
    href: localePath(locale, slug),
    title,
    shortTitle: pick(manifest.shortTitle, locale) ?? title,
    description: pick(manifest.description, locale) ?? '',
    emoji: manifest.emoji ?? '📘',
    accent,
    order: typeof manifest.order === 'number' ? manifest.order : 999,
    status: manifest.status ?? 'active',
    sections: [...declared, ...extra],
    docCount: docs.size,
  }
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

function toMeta(doc: Doc): DocMeta {
  const { headings: _headings, body: _body, ...meta } = doc
  return meta
}
