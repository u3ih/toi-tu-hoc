import { getAllTagPaths, getDocsByTag, tagLabel } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = t('vi', 'tags.title')

export function generateStaticParams() {
  return getAllTagPaths()
}

export default async function Image({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = tagLabel('vi', tag)

  return ogImage({
    locale: 'vi',
    eyebrow: `${getSite('vi').name} · ${t('vi', 'tags.title')}`,
    title: label,
    description: t('vi', 'tag.description', { tag: label }),
    meta: t('vi', 'tag.count', { count: getDocsByTag('vi', tag).length }),
  })
}
