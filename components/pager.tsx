import Link from 'next/link'
import type { DocMeta } from '@/lib/content'

export function Pager({ flatNav, slug }: { flatNav: DocMeta[]; slug: string }) {
  const i = flatNav.findIndex((item) => item.slug === slug)
  const prev = i > 0 ? flatNav[i - 1] : null
  const next = i >= 0 && i < flatNav.length - 1 ? flatNav[i + 1] : null

  if (!prev && !next) return null

  return (
    <nav className="mt-14 grid gap-3 border-t pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="surface group rounded-xl p-4 transition-colors hover:border-brand-500">
          <p className="text-xs muted">← Bài trước</p>
          <p className="mt-1 font-medium group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="surface group rounded-xl p-4 text-right transition-colors hover:border-brand-500 sm:col-start-2"
        >
          <p className="text-xs muted">Bài tiếp →</p>
          <p className="mt-1 font-medium group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  )
}
