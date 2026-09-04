import { t, type Locale } from '@/lib/i18n'

/**
 * The page in three or four lines, above the prose.
 *
 * Two audiences, one box. A reader deciding whether to spend ten minutes gets
 * the answer without scrolling; an answer engine gets a short, self-contained
 * claim it can quote — `data-takeaways` is the selector named by the page's
 * `speakable` markup, so keep the two in step.
 */
export function Takeaways({ locale, items }: { locale: Locale; items: string[] }) {
  if (items.length === 0) return null

  return (
    <aside
      data-takeaways
      className="retro-shadow mb-10 rounded-retro border-2 bg-accent-400/20 p-5 not-prose"
    >
      <p className="flex items-center gap-2 font-display text-sm">
        <span aria-hidden>🔑</span>
        {t(locale, 'doc.takeaways')}
      </p>
      <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden className="mt-px shrink-0 font-bold text-brand-600 dark:text-accent-400">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
