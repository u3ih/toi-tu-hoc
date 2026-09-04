import { localeParams, t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { localeFrom } from '@/lib/route'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Tôi Tự Học'

export function generateStaticParams() {
  return localeParams()
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFrom(params)

  return ogImage({
    locale,
    eyebrow: getSite(locale).name,
    title: t(locale, 'tags.title'),
    description: t(locale, 'tags.description'),
  })
}
