import type { Metadata } from 'next'
import { getAllDocPaths } from '@/lib/content'
import { DocPage, docMetadata } from '@/components/pages/doc'

type Props = { params: Promise<{ collection: string; slug: string }> }

export function generateStaticParams() {
  return getAllDocPaths()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params
  return docMetadata('en', collection, slug)
}

export default async function Page({ params }: Props) {
  const { collection, slug } = await params
  return <DocPage locale="en" collection={collection} slug={slug} />
}
