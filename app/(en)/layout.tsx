import type { Metadata } from 'next'
import '../globals.css'
import { rootMetadata } from '@/lib/metadata'
import { Shell } from '@/components/pages/shell'

export const metadata: Metadata = rootMetadata('en')

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return <Shell locale="en">{children}</Shell>
}
