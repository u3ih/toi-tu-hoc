import type { Metadata } from 'next'
import { getAllTagPaths } from '@/lib/content'
import { TagPage, tagMetadata } from '@/components/pages/tag'

type Props = { params: Promise<{ tag: string }> }

export function generateStaticParams() {
  return getAllTagPaths()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return tagMetadata('vi', tag)
}

export default async function Page({ params }: Props) {
  const { tag } = await params
  return <TagPage locale="vi" tag={tag} />
}
