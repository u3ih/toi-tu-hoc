#!/usr/bin/env node
// Scaffolds content.
//   pnpm new <collection>                      -> new collection folder + manifest
//   pnpm new <collection> <slug> [sectionKey]  -> new page in the default locale
//   pnpm new <collection> <slug> --locale en   -> translation stub for an existing page
//
// Collection folders, slugs and section keys are routing keys: lowercase ASCII,
// English, identical in every locale. Only the text inside files is translated.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const config = JSON.parse(fs.readFileSync(path.join(root, 'i18n.config.json'), 'utf8'))
const LOCALES = config.locales.map((l) => l.code)
const DEFAULT_LOCALE = config.defaultLocale

const argv = process.argv.slice(2)
const localeFlag = argv.indexOf('--locale')
const locale = localeFlag === -1 ? DEFAULT_LOCALE : argv[localeFlag + 1]
const positional = localeFlag === -1 ? argv : [...argv.slice(0, localeFlag), ...argv.slice(localeFlag + 2)]
const [collection, slug, section] = positional

const KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Category keys declared in content/categories.json, for the manifest stub. */
function categories() {
  const file = path.join(root, 'content', 'categories.json')
  if (!fs.existsSync(file)) return []
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  return (raw.categories ?? []).map((c) => c.key).filter(Boolean)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!collection) fail('Usage: pnpm new <collection> [slug] [sectionKey] [--locale <code>]')
if (!LOCALES.includes(locale)) fail(`Unknown locale "${locale}". Known: ${LOCALES.join(', ')}`)
if (!KEY.test(collection)) fail(`Collection "${collection}" must be a lowercase English key, e.g. "english".`)
if (slug && !KEY.test(slug)) fail(`Slug "${slug}" must be a lowercase English key, e.g. "how-many-words".`)

const dir = path.join(root, 'content', collection)
const manifestPath = path.join(dir, 'collection.json')

/** A fresh manifest with every locale stubbed, so nothing is silently missing. */
function blankManifest() {
  const perLocale = (value) => Object.fromEntries(LOCALES.map((code) => [code, value]))

  return {
    emoji: '📘',
    accent: 'indigo',
    category: categories()[0] ?? 'skills',
    order: 99,
    status: 'wip',
    title: perLocale(collection),
    shortTitle: perLocale(collection),
    description: perLocale('Mô tả ngắn cho bộ nội dung này.'),
    sections: [{ key: 'start', emoji: '🚀', title: perLocale('Bắt đầu') }],
  }
}

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(blankManifest(), null, 2) + '\n')
  console.log(`created content/${collection}/collection.json`)
  console.log(`  → edit title/description per locale, emoji, and category (${categories().join('|') || 'see content/categories.json'})`)
  console.log('  → accent: indigo|violet|sky|teal|emerald|lime|amber|clay|rose|plum, or set "hue": 0-359 for a new one')
}

if (!slug) process.exit(0)

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const sectionKeys = (manifest.sections ?? []).map((s) => s.key)
const targetSection = section ?? sectionKeys[0] ?? 'start'

if (section && !sectionKeys.includes(section)) {
  fail(`Section "${section}" is not in collection.json. Known: ${sectionKeys.join(', ') || '(none)'}`)
}

const sourceFile = path.join(dir, `${slug}.mdx`)
const file = locale === DEFAULT_LOCALE ? sourceFile : path.join(dir, `${slug}.${locale}.mdx`)

if (fs.existsSync(file)) fail(`content/${collection}/${path.basename(file)} already exists`)

/* --- Translation stub ----------------------------------------------------- */

if (locale !== DEFAULT_LOCALE) {
  if (!fs.existsSync(sourceFile)) {
    fail(`content/${collection}/${slug}.mdx does not exist — write the ${DEFAULT_LOCALE} page first.`)
  }

  const source = matter(fs.readFileSync(sourceFile, 'utf8'))
  // section and order stay canonical in the default-locale file; a translation
  // only carries the text, so nav order can never drift between locales.
  fs.writeFileSync(
    file,
    `---\ntitle: ${source.data.title ?? slug}\ndescription: ${source.data.description ?? ''}\n---\n\n${source.content.trimStart()}`,
  )

  console.log(`created content/${collection}/${slug}.${locale}.mdx`)
  console.log(`  → ${DEFAULT_LOCALE} text copied in as a starting point; translate it in place`)
  process.exit(0)
}

/* --- New page ------------------------------------------------------------- */

// Place the new page after the last one already in that section.
const existing = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.mdx') && !LOCALES.some((code) => f.endsWith(`.${code}.mdx`)))
  .map((f) => matter(fs.readFileSync(path.join(dir, f), 'utf8')).data)
  .filter((d) => d.section === targetSection)
const nextOrder = existing.length ? Math.max(...existing.map((d) => d.order ?? 0)) + 1 : 1

fs.writeFileSync(
  file,
  `---
title: ${slug}
description: Mô tả ngắn, hiện dưới tiêu đề và trong kết quả tìm kiếm.
section: ${targetSection}
order: ${nextOrder}
tags: []
---

Mở bài bằng chỗ mình từng mắc kẹt, không mở bằng định nghĩa.

## Mình đã làm sai thế nào

<Callout type="story">
Một chuyện cụ thể đã xảy ra với mình.
</Callout>

## Cách mình làm bây giờ

Các bước cụ thể.
`,
)

console.log(`created content/${collection}/${slug}.mdx (section "${targetSection}", order ${nextOrder})`)
console.log('  → giọng viết: xưng "mình", kể chuyện thật. Xem content/STYLE.md')
console.log('  → tags: [] là các khoá tiếng Anh, viết thường — chúng nối bài này với các chủ đề khác')
console.log(`  → bản dịch: pnpm new ${collection} ${slug} --locale en`)
