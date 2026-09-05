'use client'

import { t, type Locale } from '@/lib/i18n'
import { Button } from '@/lib/ui'
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
      <Button
        size="md"
        active={done}
        label={t(locale, done ? 'progress.done' : 'progress.markDone')}
        icon={done ? '✓' : '○'}
        aria-pressed={done}
        onClick={() => toggle(collection, slug)}
        className="retro-lift"
      />

      <p className="text-xs muted">
        {t(locale, auto ? 'progress.autoDone' : 'progress.storedLocally')}
      </p>
    </div>
  )
}
