import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCollection, getNav } from '@/lib/content'
import { paletteVars } from '@/lib/accent'
import type { Locale } from '@/lib/i18n'
import { SiteHeader } from '@/components/site-header'

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
    // The palette variables re-point --color-brand-*, so every brand-* utility
    // below this node picks up the collection's colour. `display: contents` keeps
    // the wrapper out of the layout while still carrying the inherited variables.
    <div data-accent={collection.accent} style={paletteVars(collection.palette)} className="contents">
      <SiteHeader locale={locale} collection={collection} nav={getNav(locale, slug)} />
      {children}
    </div>
  )
}
