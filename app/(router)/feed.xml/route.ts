import { FEED_CONTENT_TYPE, renderFeed } from '@/lib/feed'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// `/feed.xml` is where a reader guesses the feed lives, so the default locale
// answers there as well as at its own prefixed URL.
export const dynamic = 'force-static'

export function GET() {
  return new Response(renderFeed(DEFAULT_LOCALE), {
    headers: { 'Content-Type': FEED_CONTENT_TYPE },
  })
}
