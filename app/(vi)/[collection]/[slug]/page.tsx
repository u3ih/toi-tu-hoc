import type { Metadata } from 'next'
import { getAllDocPaths } from '@/lib/content'
import { DocPage, docMetadata } from '@/components/pages/doc'

type Props = { params: Promise<{ collection: string; slug: string }> }

export function generateStaticParams() {
  return getAllDocPaths()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params
  return docMetadata('vi', collection, slug)
}

export default async function Page({ params }: Props) {
  const { collection, slug } = await params
  return <DocPage locale="vi" collection={collection} slug={slug} />
}
