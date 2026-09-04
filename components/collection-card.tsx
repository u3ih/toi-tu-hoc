import { paletteVars } from '@/lib/accent'
import type { Collection, DocMeta } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'
import { CollectionProgressCount } from '@/components/progress/collection-progress'
import { Link } from '@/lib/ui'

/**
 * One collection, as a card.
 *
 * Shared by the home page, /topics/ and the tag pages so a collection looks the
 * same wherever it is listed — which matters more the more collections there are.
 */
export function CollectionCard({
  collection,
  locale,
  preview = [],
  slugs = [],
}: {
  collection: Collection
  locale: Locale
  /** First few articles, shown so a reader can judge the topic without clicking. */
  preview?: DocMeta[]
  /** Every article in the collection, so the card can show progress through it. */
  slugs?: string[]
}) {
  return (
    <Link
      href={collection.href}
      data-accent={collection.accent}
      style={paletteVars(collection.palette)}
      className="surface retro-lift group relative flex flex-col overflow-hidden p-6"
    >
      {/* Colour block in the corner, hard-edged like a printed swatch. */}
      <div
        aria-hidden
        className="absolute -top-9 -right-9 h-20 w-20 rotate-45 bg-brand-500/30 transition-colors group-hover:bg-accent-400/70"
      />
      <div className="relative flex flex-1 flex-col">
        <span
          className="grid h-12 w-12 place-items-center rounded-retro border-2 bg-brand-500/15 text-2xl"
          aria-hidden
        >
          {collection.emoji}
        </span>
        <h3 className="mt-4 flex flex-wrap items-center gap-2 font-display text-lg">
          {collection.title}
          <CollectionProgressCount locale={locale} collection={collection.slug} slugs={slugs} />
          {collection.status === 'wip' && (
            <span className="rounded-retro border-2 border-brand-900 bg-accent-400 px-1.5 py-0.5 label-retro text-brand-900">
              {t(locale, 'collection.wip')}
            </span>
          )}
        </h3>
        <p className="mt-2 text-sm muted">{collection.description}</p>

        {preview.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm">
            {preview.map((doc) => (
              <li key={doc.slug} className="flex gap-2 muted">
                <span aria-hidden className="text-brand-500">
                  ›
                </span>
                <span className="line-clamp-1">{doc.title}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto pt-4 label-retro muted">
          <span className="block border-t-2 pt-3">
            {t(locale, 'collection.count', {
              docs: collection.docCount,
              sections: collection.sections.length,
            })}
          </span>
        </p>
      </div>
    </Link>
  )
}
