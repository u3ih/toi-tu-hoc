import config from '@/i18n.config.json'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

/**
 * Locale configuration and message lookup.
 *
 * Routing keys — collection folders, page slugs and section keys — are always
 * English and identical across locales. Only the rendered text changes, which
 * keeps one URL shape per page and lets the language switcher map a page to its
 * counterpart without a lookup table.
 *
 * Every locale is prefixed: `/vi/english/reading/`, `/en/english/reading/`. The
 * bare `/` is a language router that sends a reader to one of them. Prefixing
 * the default locale too is what lets the whole site live under a single
 * `app/[locale]/` route tree instead of one hand-copied tree per language.
 *
 * UI strings live in messages/<locale>.json. `messages/vi.json` is the source of
 * truth for the key set — `scripts/check-messages.mjs` fails the build if another
 * locale drifts from it.
 *
 * To add a locale: add it to i18n.config.json, widen the `Locale` union below,
 * and copy messages/vi.json to messages/<code>.json. Nothing else is
 * locale-aware — there are no per-locale route files to copy.
 */

/** Kept in sync with i18n.config.json; the union is what makes message keys type-safe. */
export type Locale = 'vi' | 'en'

export type LocaleMeta = { label: string; short: string; htmlLang: string; ogLocale: string }

export const LOCALES = config.locales.map((l) => l.code as Locale)

export const DEFAULT_LOCALE = config.defaultLocale as Locale

export const LOCALE_META = Object.fromEntries(
  config.locales.map(({ code, ...meta }) => [code, meta]),
) as Record<Locale, LocaleMeta>

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value)
}

/* --- Localised values ------------------------------------------------------ */

/** A value in content JSON: either one string for every locale, or one per locale. */
export type Localized<T = string> = T | Partial<Record<Locale, T>>

/** Resolve a `Localized` value, falling back to the default locale then to any value present. */
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object' || Array.isArray(value)) return value as T

  const map = value as Partial<Record<Locale, T>>
  return map[locale] ?? map[DEFAULT_LOCALE] ?? Object.values(map)[0]
}

/* --- URLs ------------------------------------------------------------------ */

/** Always `/<code>` — every locale is prefixed, including the default one. */
export function localePrefix(locale: Locale): string {
  return `/${locale}`
}

/** Build a trailing-slash URL for `parts` under `locale`. `path('en', 'x', 'y') → /en/x/y/` */
export function path(locale: Locale, ...parts: string[]): string {
  const joined = parts.filter(Boolean).join('/')
  return `${localePrefix(locale)}/${joined}${joined ? '/' : ''}`
}

/** Strip the locale prefix, leaving the locale-independent path (`/english/faq/`). */
export function barePath(href: string): string {
  for (const locale of LOCALES) {
    if (href === `/${locale}` || href === `/${locale}/`) return '/'
    if (href.startsWith(`/${locale}/`)) return href.slice(`/${locale}`.length)
  }
  return href
}

/** The locale a URL is under, or the default when it is the language router at `/`. */
export function localeOf(href: string): Locale {
  for (const locale of LOCALES) {
    if (href === `/${locale}` || href.startsWith(`/${locale}/`)) return locale
  }
  return DEFAULT_LOCALE
}

/** Static params for the `[locale]` segment. */
export function localeParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }))
}

/** Move an in-site URL from one locale to another, preserving the hash. */
export function switchLocale(href: string, to: Locale): string {
  const [bare, hash] = href.split('#')
  const stripped = barePath(bare)
  const next = stripped === '/' ? `${localePrefix(to)}/` : `${localePrefix(to)}${stripped}`
  return hash ? `${next}#${hash}` : next
}

/* --- Messages -------------------------------------------------------------- */

const messages = { vi, en } satisfies Record<Locale, unknown>

type Catalog = typeof vi

/** Dot-joined paths to every string in the catalog, e.g. `'doc.readingTime'`. */
type MessagePath<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${MessagePath<T[K]>}`
}[keyof T & string]

export type MessageKey = MessagePath<Catalog>

function lookup(catalog: unknown, key: string): string | undefined {
  let node: unknown = catalog
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** Look up a UI string, substituting `{name}` placeholders. */
export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  // Falling back to the default locale keeps a half-translated catalog readable
  // instead of leaking raw keys into the page.
  const message = lookup(messages[locale], key) ?? lookup(messages[DEFAULT_LOCALE], key) ?? key
  if (!vars) return message
  return message.replace(/\{(\w+)\}/g, (whole, name) => String(vars[name] ?? whole))
}
