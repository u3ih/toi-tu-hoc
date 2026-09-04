import { DEFAULT_LOCALE, t, type Locale } from './i18n'

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
  /** Repository root; set to '' to hide every GitHub link. */
  repoUrl: 'https://github.com/u3ih/toi-tu-hoc',
  /** Branch the "edit this page" links open against. */
  repoBranch: 'main',
  /**
   * Public origin, used for canonical URLs, hreflang, sitemap and JSON-LD.
   * Set NEXT_PUBLIC_SITE_URL at build time once the site has a real domain.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
} as const

/** The contributing guide — where the footer link sends people. */
export function contributeUrl(): string {
  if (!site.repoUrl) return ''
  return `${site.repoUrl}/blob/${site.repoBranch}/CONTRIBUTING.md`
}

/**
 * GitHub's web editor for one content file. Opening it on a repo you cannot push
 * to forks the repo and lands you on the pull-request form, so this is the whole
 * contribution flow for a typo fix — no clone, no local setup.
 */
export function editUrl(collection: string, slug: string, locale: Locale, translated: boolean) {
  if (!site.repoUrl) return ''

  // An untranslated page renders the default-locale file, so that is the file to edit.
  const file =
    translated && locale !== DEFAULT_LOCALE ? `${slug}.${locale}.mdx` : `${slug}.mdx`

  return `${site.repoUrl}/edit/${site.repoBranch}/content/${collection}/${file}`
}

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
