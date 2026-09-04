import { docParams, getCollection, getDoc } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage, siteOgImage } from '@/lib/og'
import { localeFrom } from '@/lib/route'

export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Tôi Tự Học'

export function generateStaticParams() {
  return docParams()
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; collection: string; slug: string }>
}) {
  const locale = await localeFrom(params)
  const { collection: collectionSlug, slug } = await params
  const collection = getCollection(locale, collectionSlug)
  const doc = getDoc(locale, collectionSlug, slug)
  if (!collection || !doc) return siteOgImage(locale)

  const section = collection.sections.find((s) => s.key === doc.section)

  return ogImage({
    locale,
    eyebrow: [collection.title, section?.title].filter(Boolean).join(' · '),
    title: doc.title,
    description: doc.description,
    meta: t(locale, 'doc.readingTime', { minutes: doc.readingTime }),
    palette: collection.palette,
  })
}
