'use client'

import { t, type Locale } from '@/lib/i18n'
import { useProgress } from './provider'
import { useAutoDone } from './use-auto-done'

/**
 * "I finished this" for one article.
 *
 * Sized and positioned identically in both states so the page does not jump
 * when the store answers a moment after first paint.
 *
 * The reader does not have to press it: an article that was read to the end
 * ticks itself (see `useAutoDone`), and the button then says so.
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
  const auto = useAutoDone(collection, slug)

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t-2 pt-6 not-prose">
      <button
        type="button"
        onClick={() => toggle(collection, slug)}
        aria-pressed={done}
        className={[
          'retro-lift flex min-h-11 items-center gap-2 rounded-retro border-2 px-4 py-2 text-sm font-semibold transition-colors',
          done
            ? 'retro-shadow border-brand-900 bg-accent-400 text-brand-900'
            : 'retro-shadow-sm hover:bg-accent-400 hover:text-brand-900',
        ].join(' ')}
      >
        <span aria-hidden>{done ? '✓' : '○'}</span>
        {t(locale, done ? 'progress.done' : 'progress.markDone')}
      </button>

      <p className="text-xs muted">
        {t(locale, auto ? 'progress.autoDone' : 'progress.storedLocally')}
      </p>
    </div>
  )
}
