import type { Metadata } from 'next'
import { getAllCollectionPaths } from '@/lib/content'
import { CollectionPage, collectionMetadata } from '@/components/pages/collection'

type Props = { params: Promise<{ collection: string }> }

export function generateStaticParams() {
  return getAllCollectionPaths()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  return collectionMetadata('vi', collection)
}

export default async function Page({ params }: Props) {
  const { collection } = await params
  return <CollectionPage locale="vi" slug={collection} />
}
