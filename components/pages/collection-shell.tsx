import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCollection, getCollections, getNav } from '@/lib/content'
import type { Locale } from '@/lib/i18n'
import { getSite } from '@/lib/site'
import { Header } from '@/components/header'

/** Header + accent scope shared by a collection's index and all of its articles. */
export function CollectionShell({
  locale,
  slug,
  children,
}: {
  locale: Locale
  slug: string
  children: ReactNode
}) {
  const collection = getCollection(locale, slug)
  if (!collection) notFound()

  return (
    // data-accent re-points the --color-brand-* variables, so every brand-*
    // utility below this node picks up the collection's palette.
    <div data-accent={collection.accent} className="contents">
      <Header
        siteName={getSite(locale).name}
        locale={locale}
        collections={getCollections(locale)}
        collection={collection}
        nav={getNav(locale, slug)}
      />
      {children}
    </div>
  )
}
