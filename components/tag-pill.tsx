import type { Tag } from '@/lib/content'
import { path, type Locale } from '@/lib/i18n'
import { Link } from '@/lib/ui'

/** A tag, as a link. The count is shown when the caller has one. */
export function TagPill({
  locale,
  tag,
  showCount = true,
}: {
  locale: Locale
  tag: Tag | { key: string; label: string; count?: number }
  showCount?: boolean
}) {
  return (
    <Link
      href={path(locale, 'tags', tag.key)}
      className="retro-shadow-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs transition-colors hover:bg-accent-400 hover:text-brand-900"
    >
      <span aria-hidden className="muted">
        #
      </span>
      {tag.label}
      {showCount && typeof tag.count === 'number' && <span className="muted">{tag.count}</span>}
    </Link>
  )
}
