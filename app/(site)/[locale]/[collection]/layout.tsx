import type { ReactNode } from 'react'
import { collectionParams } from '@/lib/content'
import { localeFrom } from '@/lib/route'
import { CollectionShell } from '@/components/pages/collection-shell'

type Props = { children: ReactNode; params: Promise<{ locale: string; collection: string }> }

export function generateStaticParams() {
  return collectionParams()
}

export default async function Layout({ children, params }: Props) {
  const { collection } = await params

  return (
    <CollectionShell locale={await localeFrom(params)} slug={collection}>
      {children}
    </CollectionShell>
  )
}
