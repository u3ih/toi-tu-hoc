import type { Metadata } from 'next'
import { TopicsPage, topicsMetadata } from '@/components/pages/topics'

export const metadata: Metadata = topicsMetadata('vi')

export default function Page() {
  return <TopicsPage locale="vi" />
}
