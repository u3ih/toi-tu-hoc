'use client'

import { t, type Locale } from '@/lib/i18n'
import { useProgress } from './provider'

/**
 * How far through a collection the reader is.
 *
 * `slugs` comes from the server so the bar knows its denominator without the
 * client needing the content tree.
 */
export function CollectionProgress({
  locale,
  collection,
  slugs,
  className = '',
}: {
  locale: Locale
  collection: string
  slugs: string[]
  className?: string
}) {
  const { ready, countDone } = useProgress()
  const done = ready ? countDone(collection, slugs) : 0
  const total = slugs.length
  if (total === 0) return null

  const complete = done === total
  const percent = Math.round((done / total) * 100)

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 label-retro muted">
        <span>
          {complete ? t(locale, 'progress.complete') : t(locale, 'progress.count', { done, total })}
        </span>
        <span aria-hidden>{percent}%</span>
      </div>
      <div
        className="mt-2 h-3 overflow-hidden rounded-retro border-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={t(locale, 'progress.count', { done, total })}
      >
        <div
          className="h-full bg-accent-400 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/** The same number without the bar, for a card that has no room for one. */
export function CollectionProgressCount({
  locale,
  collection,
  slugs,
}: {
  locale: Locale
  collection: string
  slugs: string[]
}) {
  const { ready, countDone } = useProgress()
  if (!ready || slugs.length === 0) return null

  const done = countDone(collection, slugs)
  if (done === 0) return null

  return (
    <span className="rounded-retro border-2 border-brand-900 bg-accent-400 px-1.5 py-0.5 label-retro text-brand-900">
      {done === slugs.length
        ? t(locale, 'progress.complete')
        : t(locale, 'progress.count', { done, total: slugs.length })}
    </span>
  )
}
