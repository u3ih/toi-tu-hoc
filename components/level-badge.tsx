import type { Level } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'

/** How full the bars read at a glance, before the label is read at all. */
const FILLED: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3 }

/**
 * How much an article assumes.
 *
 * The commonest way to bounce off a self-study site is to open the wrong article
 * first, so this says so before the reader has spent ten minutes finding out.
 */
export function LevelBadge({ locale, level }: { locale: Locale; level?: Level }) {
  if (!level) return null

  const filled = FILLED[level]

  return (
    <span
      className="inline-flex items-center gap-2 rounded-retro border-2 px-2.5 py-1 label-retro"
      title={`${t(locale, 'level.label')}: ${t(locale, `level.${level}`)}`}
    >
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={step <= filled ? 'w-1 bg-brand-500' : 'w-1 bg-brand-500/25'}
            style={{ height: `${step * 3 + 2}px` }}
          />
        ))}
      </span>
      {t(locale, `level.${level}`)}
    </span>
  )
}
