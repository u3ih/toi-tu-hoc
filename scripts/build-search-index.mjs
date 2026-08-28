// Builds public/search-index.json from content/<collection>/*.mdx so the client
// search box has something to query in a fully static export.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const outFile = path.join(root, 'public', 'search-index.json')

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

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const slug = file.replace(/\.mdx$/, '')
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
    const headings = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, ''))

    index.push({
      collection,
      collectionTitle: manifest.title ?? collection,
      accent: manifest.accent ?? 'indigo',
      slug,
      href: `/${collection}/${slug}/`,
      title: data.title ?? slug,
      description: data.description ?? '',
      section: data.section ?? 'Khác',
      headings,
      text: stripMdx(content).slice(0, 8000),
    })
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(index))
console.log(
  `search index: ${index.length} documents across ${collections.length} collections -> public/search-index.json`,
)
