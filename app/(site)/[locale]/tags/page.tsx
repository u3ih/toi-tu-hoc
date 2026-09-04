import type { Metadata } from 'next'
import { localeFrom } from '@/lib/route'
import { TagsPage, tagsMetadata } from '@/components/pages/tags'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return tagsMetadata(await localeFrom(params))
}

export default async function Page({ params }: Props) {
  return <TagsPage locale={await localeFrom(params)} />
}
