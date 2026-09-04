import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../globals.css'
import { localeParams } from '@/lib/i18n'
import { rootMetadata } from '@/lib/metadata'
import { localeFrom } from '@/lib/route'
import { Shell } from '@/components/pages/shell'

type Props = { children: ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return localeParams()
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  return rootMetadata(await localeFrom(params))
}

/**
 * Root layout for the whole site, once per locale.
 *
 * `<html lang>` is resolved here from the route param, so it ships correct in
 * the served HTML rather than being patched after hydration — which is the
 * reason the locale is a real path segment instead of a rewrite.
 */
export default async function LocaleLayout({ children, params }: Props) {
  return <Shell locale={await localeFrom(params)}>{children}</Shell>
}
