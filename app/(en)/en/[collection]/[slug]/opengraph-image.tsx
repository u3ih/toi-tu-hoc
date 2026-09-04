import { getAllDocPaths, getCollection, getDoc } from '@/lib/content'
import { t } from '@/lib/i18n'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage, siteOgImage } from '@/lib/og'
import { getSite } from '@/lib/site'

// Image routes are Route Handlers under the hood, so a static export needs them
// told explicitly that they never vary.
export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = getSite('en').name

export function generateStaticParams() {
  return getAllDocPaths()
}

export default async function Image({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>
}) {
  const { collection: collectionSlug, slug } = await params
  const collection = getCollection('en', collectionSlug)
  const doc = getDoc('en', collectionSlug, slug)
  if (!collection || !doc) return siteOgImage('en')

  const section = collection.sections.find((s) => s.key === doc.section)

  return ogImage({
    locale: 'en',
    eyebrow: [collection.title, section?.title].filter(Boolean).join(' · '),
    title: doc.title,
    description: doc.description,
    meta: t('en', 'doc.readingTime', { minutes: doc.readingTime }),
    palette: collection.palette,
  })
}
