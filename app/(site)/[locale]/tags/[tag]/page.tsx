import type { Metadata } from 'next'
import { tagParams } from '@/lib/content'
import { localeFrom } from '@/lib/route'
import { TagPage, tagMetadata } from '@/components/pages/tag'

type Props = { params: Promise<{ locale: string; tag: string }> }

export function generateStaticParams() {
  return tagParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return tagMetadata(await localeFrom(params), tag)
}

export default async function Page({ params }: Props) {
  const { tag } = await params
  return <TagPage locale={await localeFrom(params)} tag={tag} />
}
