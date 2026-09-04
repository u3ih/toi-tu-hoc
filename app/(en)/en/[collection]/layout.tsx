import { getAllCollectionPaths } from '@/lib/content'
import { CollectionShell } from '@/components/pages/collection-shell'

export function generateStaticParams() {
  return getAllCollectionPaths()
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ collection: string }>
}) {
  const { collection } = await params
  return (
    <CollectionShell locale="en" slug={collection}>
      {children}
    </CollectionShell>
  )
}
