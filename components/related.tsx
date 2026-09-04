import { getCollection, getRelated, type DocMeta } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'
import { DocCard } from '@/components/doc-card'

/**
 * "Read next" for one article.
 *
 * Deliberately allowed to leave the current collection: a reader who came for
 * listening practice is often the same reader who needs the sleep article, and
 * nothing else on the page can make that jump.
 */
export function Related({ locale, doc }: { locale: Locale; doc: DocMeta }) {
  const related = getRelated(locale, doc)
  if (related.length === 0) return null

  return (
    <section className="mt-14 border-t-2 pt-8 not-prose">
      <h2 className="font-display text-lg">{t(locale, 'doc.related')}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {related.map((item) => (
          <DocCard
            key={`${item.collection}/${item.slug}`}
            doc={item}
            collection={getCollection(locale, item.collection) ?? undefined}
            locale={locale}
          />
        ))}
      </div>
    </section>
  )
}
