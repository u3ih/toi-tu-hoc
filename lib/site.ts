import { t, type Locale } from './i18n'

/**
 * Site-wide settings that are the same in every language.
 *
 * Anything translatable — tagline, description, keywords — lives in
 * messages/<locale>.json under the `site.*` keys.
 */
export const site = {
  name: 'Tôi Tự Học',
  /** Author credited in metadata and JSON-LD. */
  author: 'Tôi Tự Học',
  /** Shown in the footer; set to '' to hide the link. */
  repoUrl: 'https://github.com',
  /**
   * Public origin, used for canonical URLs, hreflang, sitemap and JSON-LD.
   * Set NEXT_PUBLIC_SITE_URL at build time once the site has a real domain.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
} as const

/** Site strings resolved for one locale. */
export function getSite(locale: Locale) {
  return {
    ...site,
    tagline: t(locale, 'site.tagline'),
    description: t(locale, 'site.description'),
    keywords: t(locale, 'site.keywords')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
  }
}

export type Site = ReturnType<typeof getSite>
