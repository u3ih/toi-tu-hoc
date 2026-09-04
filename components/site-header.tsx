import { getCategories, getCollections, type Collection, type NavGroup } from '@/lib/content'
import type { Locale } from '@/lib/i18n'
import { getSite } from '@/lib/site'
import { Header } from '@/components/header'

/**
 * Server-side wrapper for the header.
 *
 * The header is a client component, so everything it needs has to be read here
 * and passed down. Doing that once means adding a new header input — categories,
 * for instance — does not mean editing every page that renders a header.
 */
export function SiteHeader({
  locale,
  collection,
  nav = [],
}: {
  locale: Locale
  collection?: Collection
  nav?: NavGroup[]
}) {
  return (
    <Header
      siteName={getSite(locale).name}
      locale={locale}
      collections={getCollections(locale)}
      groups={getCategories(locale)}
      collection={collection}
      nav={nav}
    />
  )
}
