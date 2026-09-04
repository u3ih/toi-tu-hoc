#!/usr/bin/env node
// Plain-text mirrors of the site, for agents and answer engines.
//
// Three artefacts per locale, written into the export after `next build`:
//
//   /llms.txt              an index — every page, one line each, with its URL
//   /llms-full.txt         the whole site as one markdown document
//   /<path>/index.md       one page, as the markdown it was written in
//
// The reason is simple: a crawler that wants the words has to parse a React
// page to find them, and an agent asked to read one article should not have to
// download a hundred kilobytes of HTML to get three kilobytes of prose. The
// format follows llmstxt.org.
import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePrefix,
  pick,
  readCollections,
  sectionTitle,
  siteUrl,
  sortedDocs,
} from './lib/content.mjs'

const root = process.cwd()
const outDir = path.join(root, 'out')

if (!fs.existsSync(outDir)) {
  console.error('llms: out/ does not exist — run next build first')
  process.exit(1)
}

const messages = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(path.join(root, 'messages', `${locale}.json`), 'utf8')),
  ]),
)

const siteName = 'Tôi Tự Học'

function write(relative, body) {
  const file = path.join(outDir, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
  return Buffer.byteLength(body)
}

/** Frontmatter fields worth restating in the mirror, as a short header block. */
function header(locale, collection, doc, url) {
  const data = doc.text.data
  const base = doc.base.data
  const lines = [`# ${data.title ?? doc.slug}`, '']

  if (data.description) lines.push(`> ${data.description}`, '')

  lines.push(`- Source: ${url}`)
  lines.push(`- Collection: ${pick(collection.manifest.title, locale) ?? collection.slug}`)
  lines.push(`- Section: ${sectionTitle(collection.manifest, doc.section, locale)}`)
  if (Array.isArray(base.tags) && base.tags.length) lines.push(`- Tags: ${base.tags.join(', ')}`)
  if (base.date) lines.push(`- Published: ${String(base.date).slice(0, 10)}`)
  const updated = data.updated ?? base.updated
  if (updated) lines.push(`- Updated: ${String(updated).slice(0, 10)}`)
  if (!doc.translated && locale !== DEFAULT_LOCALE) {
    lines.push(`- Note: no ${locale} translation yet; this is the ${DEFAULT_LOCALE} original.`)
  }

  const takeaways = data.takeaways ?? base.takeaways
  if (Array.isArray(takeaways) && takeaways.length) {
    lines.push('', '## Key points', '', ...takeaways.map((item) => `- ${item}`))
  }

  return lines.join('\n')
}

let files = 0
let bytes = 0

for (const locale of LOCALES) {
  const t = (key) => key.split('.').reduce((node, part) => node?.[part], messages[locale]) ?? key
  const prefix = localePrefix(locale)
  const collections = readCollections()

  const index = [
    `# ${siteName}`,
    '',
    `> ${t('site.description')}`,
    '',
    `${t('topics.description')} ${t('topics.tagsHint')}`,
    '',
    `- Home: ${siteUrl(`${prefix}/`)}`,
    `- Every topic: ${siteUrl(`${prefix}/topics/`)}`,
    `- Full text of every page: ${siteUrl(`${prefix}/llms-full.txt`)}`,
    `- RSS: ${siteUrl(`${prefix}/feed.xml`)}`,
    '',
  ]

  const full = [
    `# ${siteName} — ${t('site.tagline')}`,
    '',
    `> ${t('site.description')}`,
    '',
    `Every page of ${siteUrl(`${prefix}/`)}, in reading order.`,
    '',
  ]

  for (const collection of collections) {
    const title = pick(collection.manifest.title, locale) ?? collection.slug
    const description = pick(collection.manifest.description, locale) ?? ''

    index.push(`## ${title}`, '')
    if (description) index.push(description, '')

    full.push('', '---', '', `# ${title}`, '')
    if (description) full.push(description, '')

    for (const doc of sortedDocs(collection, locale)) {
      const bare = `/${collection.slug}/${doc.slug}/`
      const url = siteUrl(`${prefix}${bare}`)
      const docTitle = doc.text.data.title ?? doc.slug
      const docDescription = doc.text.data.description ?? ''

      index.push(`- [${docTitle}](${url})${docDescription ? `: ${docDescription}` : ''}`)

      const mirror = `${header(locale, collection, doc, url)}\n\n${doc.text.content.trim()}\n`
      bytes += write(path.join(`.${prefix}`, bare, 'index.md'), mirror)
      files++

      full.push('', `## ${docTitle}`, '', `Source: ${url}`, '', doc.text.content.trim())
    }

    index.push('')
  }

  bytes += write(path.join(`.${prefix}`, 'llms.txt'), index.join('\n'))
  bytes += write(path.join(`.${prefix}`, 'llms-full.txt'), `${full.join('\n')}\n`)
  files += 2

  // `/llms.txt` is the path an agent guesses first, so the default locale also
  // answers at the root — the same courtesy `/feed.xml` gets.
  if (locale === DEFAULT_LOCALE) {
    bytes += write('llms.txt', index.join('\n'))
    bytes += write('llms-full.txt', `${full.join('\n')}\n`)
    files += 2
  }
}

console.log(
  `llms: ${files} files, ${(bytes / 1024).toFixed(0)} KB -> out/{llms.txt,llms-full.txt,**/index.md}`,
)
