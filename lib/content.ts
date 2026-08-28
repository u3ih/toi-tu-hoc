import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export type Heading = { id: string; text: string; level: 2 | 3 }

export type Doc = {
  slug: string
  title: string
  description: string
  /** Minutes, rounded up. Vietnamese prose ~ 200 wpm. */
  readingTime: number
  headings: Heading[]
  body: string
}

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

export function getSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
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

export function getDoc(slug: string): Doc | null {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const words = content.split(/\s+/).filter(Boolean).length

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    readingTime: Math.max(1, Math.ceil(words / 200)),
    headings: extractHeadings(content),
    body: content,
  }
}
