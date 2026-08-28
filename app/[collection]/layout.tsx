import { notFound } from 'next/navigation'
import { site } from '@/lib/site'
import { getCollection, getCollections, getNav } from '@/lib/content'
import { Header } from '@/components/header'

export function generateStaticParams() {
  return getCollections({ includeHidden: true }).map((c) => ({ collection: c.slug }))
}

export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ collection: string }>
}) {
  const { collection: slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  return (
    // data-accent re-points the --color-brand-* variables, so every brand-*
    // utility below this node picks up the collection's palette.
    <div data-accent={collection.accent} className="contents">
      <Header
        siteName={site.name}
        collections={getCollections()}
        collection={collection}
        nav={getNav(slug)}
      />
      {children}
    </div>
  )
}
