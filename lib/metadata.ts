import type { Metadata } from 'next'
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePrefix, type Locale } from './i18n'
import { getSite, site } from './site'

// GitHub Pages serves project sites from /<repo>; the deploy workflow sets this.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Absolute URL for an in-site path. `next/link` adds basePath itself; metadata does not. */
export function siteUrl(path = '/'): string {
  return `${site.url}${BASE_PATH}${path}`
}

/**
 * canonical + hreflang for one page.
 *
 * `bare` is the locale-independent path (`/english/reading/`), which is exactly
 * what the route tree already knows, since routing keys never change per locale.
 */
export function alternatesFor(locale: Locale, bare: string): Metadata['alternates'] {
  const languages: Record<string, string> = {}

  for (const other of LOCALES) {
    languages[LOCALE_META[other].htmlLang] = siteUrl(`${localePrefix(other)}${bare}`)
  }
  languages['x-default'] = siteUrl(`${localePrefix(DEFAULT_LOCALE)}${bare}`)

  return { canonical: siteUrl(`${localePrefix(locale)}${bare}`), languages }
}

/** Root metadata for a locale's route tree; per-page files override title/description. */
export function rootMetadata(locale: Locale): Metadata {
  const s = getSite(locale)

  return {
    metadataBase: new URL(siteUrl('/')),
    title: {
      default: `${s.name} — ${s.tagline}`,
      template: `%s · ${s.name}`,
    },
    description: s.description,
    keywords: s.keywords,
    authors: [{ name: s.author }],
    creator: s.author,
    publisher: s.author,
    applicationName: s.name,
    alternates: alternatesFor(locale, '/'),
    openGraph: {
      type: 'website',
      siteName: s.name,
      title: `${s.name} — ${s.tagline}`,
      description: s.description,
      url: siteUrl(`${localePrefix(locale)}/`),
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${s.name} — ${s.tagline}`,
      description: s.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    formatDetection: { telephone: false, address: false, email: false },
  }
}

/** Page-level metadata shared by collection and article pages. */
export function pageMetadata({
  locale,
  bare,
  title,
  description,
  type = 'website',
  section,
}: {
  locale: Locale
  bare: string
  title: string
  description: string
  type?: 'website' | 'article'
  section?: string
}): Metadata {
  const s = getSite(locale)
  const url = siteUrl(`${localePrefix(locale)}${bare}`)

  return {
    title,
    description,
    alternates: alternatesFor(locale, bare),
    openGraph: {
      type,
      siteName: s.name,
      title,
      description,
      url,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      ...(type === 'article' ? { authors: [s.author], section } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
