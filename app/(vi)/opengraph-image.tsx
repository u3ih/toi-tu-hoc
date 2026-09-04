import { OG_CONTENT_TYPE, OG_SIZE, siteOgImage } from '@/lib/og'
import { getSite } from '@/lib/site'

// Image routes are Route Handlers under the hood, so a static export needs them
// told explicitly that they never vary.
export const dynamic = 'force-static'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = `${getSite('vi').name} — ${getSite('vi').tagline}`

export default function Image() {
  return siteOgImage('vi')
}
