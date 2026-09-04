import { getAllCollectionPaths, getCollection } from '@/lib/content'
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
  return getAllCollectionPaths()
}

export default async function Image({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params
  const collection = getCollection('en', slug)
  if (!collection) return siteOgImage('en')

  return ogImage({
    locale: 'en',
    eyebrow: getSite('en').name,
    title: collection.title,
    description: collection.description,
    meta: t('en', 'collection.count', {
      docs: collection.docCount,
      sections: collection.sections.length,
    }),
    palette: collection.palette,
  })
}
