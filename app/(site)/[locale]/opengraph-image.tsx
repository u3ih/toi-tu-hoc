import { OG_CONTENT_TYPE, OG_SIZE, siteOgImage } from '@/lib/og'
import { localeParams } from '@/lib/i18n'
import { localeFrom } from '@/lib/route'

// Image routes are Route Handlers under the hood, so a static export needs them
// told explicitly that they never vary.
export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Tôi Tự Học'

export function generateStaticParams() {
  return localeParams()
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  return siteOgImage(await localeFrom(params))
}
