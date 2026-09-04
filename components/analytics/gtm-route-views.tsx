'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { gtmEnabled, pushEvent } from '@/lib/gtm'
import type { Locale } from '@/lib/i18n'

/**
 * Page views for client-side navigation.
 *
 * GTM's built-in Page View trigger fires once, when `gtm.js` loads. Every
 * navigation after that is a `pushState` inside the App Router, so without this
 * a reader who opens the home page and works through ten articles is recorded
 * as a single view. This pushes an explicit `page_view` on each route change —
 * trigger a GA4 config or event tag on it in the container.
 *
 * The first render is skipped on purpose: the initial view already came from
 * the container's own trigger, and firing here as well would double-count it.
 */
export function GtmRouteViews({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    if (!gtmEnabled) return

    // Mount: record where we are, let the container's own trigger own this view.
    if (previous.current === null) {
      previous.current = pathname
      return
    }
    if (previous.current === pathname) return
    previous.current = pathname

    // Read the live location rather than `useSearchParams`, which would force
    // this subtree into a Suspense bailout during the static export. The
    // pathname is what changes between pages here anyway.
    pushEvent({
      event: 'page_view',
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
      page_locale: locale,
    })
  }, [pathname, locale])

  return null
}
