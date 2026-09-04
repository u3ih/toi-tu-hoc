import type { Metadata } from 'next'
import { localeFrom } from '@/lib/route'
import { TopicsPage, topicsMetadata } from '@/components/pages/topics'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return topicsMetadata(await localeFrom(params))
}

export default async function Page({ params }: Props) {
  return <TopicsPage locale={await localeFrom(params)} />
}
