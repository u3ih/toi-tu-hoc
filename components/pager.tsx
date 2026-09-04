import Link from 'next/link'
import type { DocMeta } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'

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
    <nav className="mt-14 grid gap-4 border-t-2 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="surface retro-lift group p-4">
          <p className="label-retro muted">{t(locale, 'doc.prev')}</p>
          <p className="mt-1.5 font-semibold group-hover:text-brand-700 dark:group-hover:text-accent-400">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="surface retro-lift group p-4 text-right sm:col-start-2"
        >
          <p className="label-retro muted">{t(locale, 'doc.next')}</p>
          <p className="mt-1.5 font-semibold group-hover:text-brand-700 dark:group-hover:text-accent-400">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  )
}
