import type { Metadata } from 'next'
import { docParams } from '@/lib/content'
import { localeFrom } from '@/lib/route'
import { DocPage, docMetadata } from '@/components/pages/doc'

type Props = { params: Promise<{ locale: string; collection: string; slug: string }> }

export function generateStaticParams() {
  return docParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params
  return docMetadata(await localeFrom(params), collection, slug)
}

export default async function Page({ params }: Props) {
  const { collection, slug } = await params
  return <DocPage locale={await localeFrom(params)} collection={collection} slug={slug} />
}
