// Builds public/search-index.json from content/<collection>/*.mdx so the client
// search box has something to query in a fully static export.
//
// One file covers every locale: each entry carries a `locale` field and the
// client filters on it. A page with no translation is indexed once per locale
// with the default-locale text, matching what the page itself renders.
import fs from 'node:fs'
import path from 'node:path'
import {
  LOCALES,
  docHref,
  pick,
  plainText,
  readCollections,
  root,
  sectionTitle,
  sortedDocs,
} from './lib/content.mjs'

const outFile = path.join(root, 'public', 'search-index.json')

const collections = readCollections()
const index = []

for (const collection of collections) {
  for (const locale of LOCALES) {
    for (const doc of sortedDocs(collection, locale)) {
      const headings = [...doc.text.content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) =>
        m[1].replace(/[*_`]/g, ''),
      )

      index.push({
        locale,
        collection: collection.slug,
        collectionTitle: pick(collection.manifest.title, locale) ?? collection.slug,
        slug: doc.slug,
        href: docHref(locale, collection.slug, doc.slug),
        title: doc.text.data.title ?? doc.slug,
        description: doc.text.data.description ?? '',
        section: sectionTitle(collection.manifest, doc.section, locale),
        tags: Array.isArray(doc.base.data.tags) ? doc.base.data.tags : [],
        headings,
        text: plainText(doc.text.content).slice(0, 8000),
      })
    }
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(index))
console.log(
  `search index: ${index.length} entries (${collections.length} collections × ${LOCALES.length} locales) -> public/search-index.json`,
)
