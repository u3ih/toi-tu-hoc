import { getAllTagPaths, getDocsByTag, tagLabel } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = t('en', 'tags.title')

export function generateStaticParams() {
  return getAllTagPaths()
}

export default async function Image({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = tagLabel('en', tag)

  return ogImage({
    locale: 'en',
    eyebrow: `${getSite('en').name} · ${t('en', 'tags.title')}`,
    title: label,
    description: t('en', 'tag.description', { tag: label }),
    meta: t('en', 'tag.count', { count: getDocsByTag('en', tag).length }),
  })
}
