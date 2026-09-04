import type { Metadata } from 'next'
import '../globals.css'
import { rootMetadata } from '@/lib/metadata'
import { Shell } from '@/components/pages/shell'

// Each locale is its own root layout so `<html lang>` ships correct in the HTML.
export const metadata: Metadata = rootMetadata('vi')

export default function ViRootLayout({ children }: { children: React.ReactNode }) {
  return <Shell locale="vi">{children}</Shell>
}
