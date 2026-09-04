import { collectionParams, getCollection } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage, siteOgImage } from '@/lib/og'
import { localeFrom } from '@/lib/route'
import { getSite } from '@/lib/site'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Tôi Tự Học'

export function generateStaticParams() {
  return collectionParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; collection: string }>
}) {
  const locale = await localeFrom(params)
  const { collection: slug } = await params
  const collection = getCollection(locale, slug)
  if (!collection) return siteOgImage(locale)

  return ogImage({
    locale,
    eyebrow: getSite(locale).name,
    title: collection.title,
    description: collection.description,
    meta: t(locale, 'collection.count', {
      docs: collection.docCount,
      sections: collection.sections.length,
    }),
    palette: collection.palette,
  })
}
