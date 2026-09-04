import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = t('en', 'topics.title')

export default function Image() {
  return ogImage({
    locale: 'en',
    eyebrow: getSite('en').name,
    title: t('en', 'topics.title'),
    description: t('en', 'topics.description'),
  })
}
