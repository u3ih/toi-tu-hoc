import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

/** Accent palettes defined in app/globals.css under [data-accent='…']. */
export const ACCENTS = ['indigo', 'violet', 'sky', 'emerald', 'amber', 'rose'] as const
export type Accent = (typeof ACCENTS)[number]

export type Section = { title: string; emoji?: string }

export type Collection = {
  slug: string
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
  href: string
  title: string
  description: string
  section: string
  order: number
  readingTime: number
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

function readDoc(collection: string, slug: string): Doc | null {
  const file = path.join(CONTENT_DIR, collection, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const words = content.split(/\s+/).filter(Boolean).length

  return {
    collection,
    slug,
    href: `/${collection}/${slug}/`,
    title: data.title ?? slug,
    description: data.description ?? '',
    section: data.section ?? 'Khác',
    order: typeof data.order === 'number' ? data.order : 999,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    headings: extractHeadings(content),
    body: content,
  }
}

/* --- Discovery ------------------------------------------------------------ */

// Content never changes within a build, so read the tree once.
let cache: Map<string, { collection: Collection; docs: Doc[] }> | null = null

function load() {
  if (cache) return cache
  cache = new Map()

  if (!fs.existsSync(CONTENT_DIR)) return cache

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .map((e) => e.name)

  for (const slug of dirs) {
    const dir = path.join(CONTENT_DIR, slug)
    const manifestPath = path.join(dir, 'collection.json')

    // A manifest is optional — a bare folder of .mdx files still works.
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      : {}

    const docs = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => readDoc(slug, f.replace(/\.mdx$/, '')))
      .filter((d): d is Doc => d !== null)

    const declared: Section[] = Array.isArray(manifest.sections) ? manifest.sections : []
    // Any section used by a doc but missing from the manifest still gets rendered.
    const extra = [...new Set(docs.map((d) => d.section))]
      .filter((title) => !declared.some((s) => s.title === title))
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((title) => ({ title }))

    const accent: Accent = ACCENTS.includes(manifest.accent) ? manifest.accent : 'indigo'

    cache.set(slug, {
      collection: {
        slug,
        title: manifest.title ?? slug,
        shortTitle: manifest.shortTitle ?? manifest.title ?? slug,
        description: manifest.description ?? '',
        emoji: manifest.emoji ?? '📘',
        accent,
        order: typeof manifest.order === 'number' ? manifest.order : 999,
        status: manifest.status ?? 'active',
        sections: [...declared, ...extra],
        docCount: docs.length,
      },
      docs,
    })
  }

  return cache
}

/* --- Public API ----------------------------------------------------------- */

export function getCollections({ includeHidden = false } = {}): Collection[] {
  return [...load().values()]
    .map((e) => e.collection)
    .filter((c) => (includeHidden ? true : c.status !== 'hidden') && c.docCount > 0)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'vi'))
}

export function getCollection(slug: string): Collection | null {
  return load().get(slug)?.collection ?? null
}

function sortDocs(docs: Doc[]) {
  return [...docs].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'vi'))
}

export function getDoc(collection: string, slug: string): Doc | null {
  return load().get(collection)?.docs.find((d) => d.slug === slug) ?? null
}

/** Sidebar structure: sections in manifest order, docs in `order` order. */
export function getNav(collection: string): NavGroup[] {
  const entry = load().get(collection)
  if (!entry) return []

  return entry.collection.sections
    .map((section) => ({
      section,
      items: sortDocs(entry.docs.filter((d) => d.section === section.title)).map(toMeta),
    }))
    .filter((group) => group.items.length > 0)
}

/** Flattened sidebar order — used for prev/next paging. */
export function getFlatNav(collection: string): DocMeta[] {
  return getNav(collection).flatMap((g) => g.items)
}

/** Every doc across every collection, for the search index and sitemaps. */
export function getAllDocs(): Doc[] {
  return [...load().values()].flatMap((e) => sortDocs(e.docs))
}

function toMeta(doc: Doc): DocMeta {
  const { headings: _headings, body: _body, ...meta } = doc
  return meta
}
