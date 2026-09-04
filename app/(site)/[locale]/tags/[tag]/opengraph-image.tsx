import { getDocsByTag, tagLabel, tagParams } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { localeFrom } from '@/lib/route'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Tôi Tự Học'

export function generateStaticParams() {
  return tagParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}) {
  const locale = await localeFrom(params)
  const { tag } = await params
  const label = tagLabel(locale, tag)

  return ogImage({
    locale,
    eyebrow: `${getSite(locale).name} · ${t(locale, 'tags.title')}`,
    title: label,
    description: t(locale, 'tag.description', { tag: label }),
    meta: t(locale, 'tag.count', { count: getDocsByTag(locale, tag).length }),
  })
}
