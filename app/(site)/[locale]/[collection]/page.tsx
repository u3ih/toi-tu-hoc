import type { Metadata } from 'next'
import { collectionParams } from '@/lib/content'
import { localeFrom } from '@/lib/route'
import { CollectionPage, collectionMetadata } from '@/components/pages/collection'

type Props = { params: Promise<{ locale: string; collection: string }> }

export function generateStaticParams() {
  return collectionParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  return collectionMetadata(await localeFrom(params), collection)
}

export default async function Page({ params }: Props) {
  const { collection } = await params
  return <CollectionPage locale={await localeFrom(params)} slug={collection} />
}
