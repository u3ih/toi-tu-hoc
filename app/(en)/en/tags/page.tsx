import type { Metadata } from 'next'
import { TagsPage, tagsMetadata } from '@/components/pages/tags'

export const metadata: Metadata = tagsMetadata('en')

export default function Page() {
  return <TagsPage locale="en" />
}
