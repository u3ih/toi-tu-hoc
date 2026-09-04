'use client'

import { t, type Locale } from '@/lib/i18n'
import { useProgress } from './provider'

/**
 * A tick next to an article title in a list.
 *
 * Renders nothing until the article is known to be finished, so nothing shifts
 * on hydration for the far more common unfinished case.
 */
export function DocCheck({
  locale,
  collection,
  slug,
}: {
  locale: Locale
  collection: string
  slug: string
}) {
  const { ready, isDone } = useProgress()
  if (!ready || !isDone(collection, slug)) return null

  return (
    <span
      title={t(locale, 'progress.done')}
      className="shrink-0 font-bold text-brand-600 dark:text-accent-400"
    >
      <span className="sr-only">{t(locale, 'progress.done')}</span>
      <span aria-hidden>✓</span>
    </span>
  )
}
