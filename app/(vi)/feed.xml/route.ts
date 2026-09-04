import { FEED_CONTENT_TYPE, renderFeed } from '@/lib/feed'

// A static export writes the response body to a file at build time.
export const dynamic = 'force-static'

export function GET() {
  return new Response(renderFeed('vi'), { headers: { 'Content-Type': FEED_CONTENT_TYPE } })
}
