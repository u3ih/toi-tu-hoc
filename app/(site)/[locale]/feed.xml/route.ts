import { FEED_CONTENT_TYPE, renderFeed } from '@/lib/feed'
import { localeParams } from '@/lib/i18n'
import { localeFrom } from '@/lib/route'

// A static export writes the response body to a file at build time.
export const dynamic = 'force-static'

export function generateStaticParams() {
  return localeParams()
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  return new Response(renderFeed(await localeFrom(params)), {
    headers: { 'Content-Type': FEED_CONTENT_TYPE },
  })
}
