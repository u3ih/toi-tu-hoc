// Builds public/search-index.json from content/*.mdx so the client search box
// has something to query in a fully static export.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const outFile = path.join(root, 'public', 'search-index.json')

const navSource = fs.readFileSync(path.join(root, 'lib', 'nav.ts'), 'utf8')

/** Map slug -> section title by reading lib/nav.ts without compiling TS. */
function sectionBySlug() {
  const map = {}
  let section = ''
  for (const line of navSource.split('\n')) {
    const sectionMatch = /^\s*title:\s*'(.+?)',\s*$/.exec(line)
    if (sectionMatch) section = sectionMatch[1]
    const itemMatch = /slug:\s*'([^']+)'/.exec(line)
    if (itemMatch) map[itemMatch[1]] = section
  }
  return map
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

const sections = sectionBySlug()

const index = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const { data, content } = matter(fs.readFileSync(path.join(contentDir, file), 'utf8'))
    const headings = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, ''))

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      section: sections[slug] ?? 'Hướng dẫn',
      headings,
      text: stripMdx(content).slice(0, 8000),
    }
  })

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(index))
console.log(`search index: ${index.length} documents -> public/search-index.json`)
