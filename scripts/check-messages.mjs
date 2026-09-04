#!/usr/bin/env node
// Fails the build when a message catalog drifts from the default locale.
//
// messages/<defaultLocale>.json is the source of truth for the key set. A missing
// key silently falls back at runtime, which is easy to ship and hard to notice —
// so it is reported here instead.
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const config = JSON.parse(fs.readFileSync(path.join(root, 'i18n.config.json'), 'utf8'))
const locales = config.locales.map((l) => l.code)
const base = config.defaultLocale

function read(locale) {
  const file = path.join(root, 'messages', `${locale}.json`)
  if (!fs.existsSync(file)) {
    console.error(`i18n: messages/${locale}.json is missing`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** Dot-joined paths to every string leaf. */
function keys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [full] : keys(value, full)
  })
}

/** `{name}` slots, so a translation cannot quietly drop an interpolated value. */
function slots(value) {
  return [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
}

function at(node, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), node)
}

const reference = read(base)
const referenceKeys = keys(reference)
let failed = false

for (const locale of locales) {
  if (locale === base) continue
  const catalog = read(locale)

  const missing = referenceKeys.filter((key) => typeof at(catalog, key) !== 'string')
  const extra = keys(catalog).filter((key) => !referenceKeys.includes(key))
  const mismatched = referenceKeys
    .filter((key) => typeof at(catalog, key) === 'string')
    .filter((key) => String(slots(at(reference, key))) !== String(slots(at(catalog, key))))

  for (const key of missing) console.error(`i18n: ${locale} is missing "${key}"`)
  for (const key of extra) console.error(`i18n: ${locale} has "${key}", not in ${base}`)
  for (const key of mismatched) {
    console.error(
      `i18n: ${locale} "${key}" uses {${slots(at(catalog, key))}}, ${base} uses {${slots(at(reference, key))}}`,
    )
  }

  failed ||= missing.length + extra.length + mismatched.length > 0
}

if (failed) process.exit(1)
console.log(`i18n: ${locales.length} catalogs, ${referenceKeys.length} keys, in sync`)
