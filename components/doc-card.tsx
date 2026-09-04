import { paletteVars } from '@/lib/accent'
import type { Collection, DocMeta } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'
import { Link } from '@/lib/ui'

/**
 * One article, as a card, labelled with the collection it came from.
 *
 * Used wherever articles are listed outside their own sidebar — tag pages and
 * the related block — where the reader has no other way to tell which topic a
 * title belongs to.
 */
export function DocCard({
  doc,
  collection,
  locale,
}: {
  doc: DocMeta
  collection?: Collection
  locale: Locale
}) {
  return (
    <Link
      href={doc.href}
      data-accent={collection?.accent}
      style={collection ? paletteVars(collection.palette) : undefined}
      className="surface retro-lift flex flex-col p-5"
    >
      {collection && (
        <p className="flex items-center gap-1.5 label-retro muted">
          <span aria-hidden>{collection.emoji}</span>
          {collection.shortTitle}
        </p>
      )}
      <p className="mt-1.5 font-display text-base leading-snug">{doc.title}</p>
      {doc.description && <p className="mt-2 line-clamp-2 text-sm muted">{doc.description}</p>}
      <p className="mt-auto pt-4 label-retro muted">
        {t(locale, 'doc.readingTime', { minutes: doc.readingTime })}
      </p>
    </Link>
  )
}
