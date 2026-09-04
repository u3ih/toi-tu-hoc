'use client'

import { t, type Locale } from '@/lib/i18n'
import { useProgress } from './provider'

/**
 * "I finished this" for one article.
 *
 * Sized and positioned identically in both states so the page does not jump
 * when the store answers a moment after first paint.
 */
export function DoneToggle({
  locale,
  collection,
  slug,
}: {
  locale: Locale
  collection: string
  slug: string
}) {
  const { ready, isDone, toggle } = useProgress()
  const done = ready && isDone(collection, slug)

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t-2 pt-6 not-prose">
      <button
        type="button"
        onClick={() => toggle(collection, slug)}
        aria-pressed={done}
        className={[
          'retro-lift flex items-center gap-2 rounded-retro border-2 px-4 py-2 text-sm font-semibold transition-colors',
          done
            ? 'retro-shadow border-brand-900 bg-accent-400 text-brand-900'
            : 'retro-shadow-sm hover:bg-accent-400 hover:text-brand-900',
        ].join(' ')}
      >
        <span aria-hidden>{done ? '✓' : '○'}</span>
        {t(locale, done ? 'progress.done' : 'progress.markDone')}
      </button>

      <p className="text-xs muted">{t(locale, 'progress.storedLocally')}</p>
    </div>
  )
}
