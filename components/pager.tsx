import type { DocMeta } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'
import { Link } from '@/lib/ui'

/**
 * Previous / next links at the foot of an article.
 *
 * The arrows are markup rather than part of the translated string so they can
 * lead the hover — the card steps up, the arrow steps out — and so a translator
 * never has to carry a glyph whose direction is not theirs to change.
 */
export function Pager({
  flatNav,
  slug,
  locale,
}: {
  flatNav: DocMeta[]
  slug: string
  locale: Locale
}) {
  const i = flatNav.findIndex((item) => item.slug === slug)
  const prev = i > 0 ? flatNav[i - 1] : null
  const next = i >= 0 && i < flatNav.length - 1 ? flatNav[i + 1] : null

  if (!prev && !next) return null

  return (
    <nav className="mt-14 grid items-stretch gap-4 border-t-2 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          rel="prev"
          className="surface retro-lift group flex h-full flex-col gap-1.5 p-4"
        >
          <span className="label-retro muted flex items-center gap-2">
            <span
              aria-hidden
              className="transition-transform duration-100 group-hover:-translate-x-1"
            >
              ←
            </span>
            {t(locale, 'doc.prev')}
          </span>
          <span className="font-semibold group-hover:text-brand-700 dark:group-hover:text-accent-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        // Holds the second column open on wide screens so a first page's "next"
        // card still sits on the right, where every other page puts it.
        <span className="hidden sm:block" aria-hidden />
      )}

      {next && (
        <Link
          href={next.href}
          rel="next"
          className="surface retro-lift group flex h-full flex-col items-end gap-1.5 p-4 text-right sm:col-start-2"
        >
          <span className="label-retro muted flex items-center gap-2">
            {t(locale, 'doc.next')}
            <span
              aria-hidden
              className="transition-transform duration-100 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
          <span className="font-semibold group-hover:text-brand-700 dark:group-hover:text-accent-400">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  )
}
