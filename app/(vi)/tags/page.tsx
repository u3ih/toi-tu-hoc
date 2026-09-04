import type { Metadata } from 'next'
import { TagsPage, tagsMetadata } from '@/components/pages/tags'

export const metadata: Metadata = tagsMetadata('vi')

export default function Page() {
  return <TagsPage locale="vi" />
}
