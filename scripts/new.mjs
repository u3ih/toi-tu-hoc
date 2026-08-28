#!/usr/bin/env node
// Scaffolds content.
//   npm run new -- <collection>                     -> new collection folder + manifest
//   npm run new -- <collection> <slug> [section]    -> new .mdx page in that collection
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const [collection, slug, section] = process.argv.slice(2)

if (!collection) {
  console.error('Usage: npm run new -- <collection> [slug] [section]')
  process.exit(1)
}

const dir = path.join(process.cwd(), 'content', collection)
const manifestPath = path.join(dir, 'collection.json')

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        title: collection,
        shortTitle: collection,
        description: 'Mô tả ngắn cho bộ nội dung này.',
        emoji: '📘',
        accent: 'indigo',
        order: 99,
        status: 'wip',
        sections: [{ title: 'Bắt đầu', emoji: '🚀' }],
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`created content/${collection}/collection.json`)
  console.log('  → edit title, emoji, accent (indigo|violet|sky|emerald|amber|rose) and sections')
}

if (!slug) process.exit(0)

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const targetSection = section ?? manifest.sections?.[0]?.title ?? 'Bắt đầu'

// Place the new page after the last one already in that section.
const existing = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => matter(fs.readFileSync(path.join(dir, f), 'utf8')).data)
  .filter((d) => d.section === targetSection)
const nextOrder = existing.length ? Math.max(...existing.map((d) => d.order ?? 0)) + 1 : 1

const file = path.join(dir, `${slug}.mdx`)
if (fs.existsSync(file)) {
  console.error(`content/${collection}/${slug}.mdx already exists`)
  process.exit(1)
}

fs.writeFileSync(
  file,
  `---
title: ${slug}
description: Mô tả ngắn, hiện dưới tiêu đề và trong kết quả tìm kiếm.
section: ${targetSection}
order: ${nextOrder}
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

console.log('  → giọng viết: xưng "mình", kể chuyện thật. Xem content/STYLE.md')

console.log(`created content/${collection}/${slug}.mdx (section "${targetSection}", order ${nextOrder})`)
