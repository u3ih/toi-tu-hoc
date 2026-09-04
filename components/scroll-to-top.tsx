'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Send the reader to the top of the page when the route changes.
 *
 * The App Router restores the previous scroll position often enough that paging
 * from the bottom of one article — which is where the pager lives — can drop you
 * into the middle of the next one. Reading always starts at the top, so this
 * makes that unconditional.
 *
 * `instant` is deliberate: `html` carries `scroll-behavior: smooth` for in-page
 * anchors, and inheriting it here would animate a scroll back through the whole
 * length of the article the reader has just left.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  // The previous path, not a "have I run yet" flag: comparing paths means the
  // effect only acts on a real navigation, never on a re-run at the same URL.
  const previous = useRef<string | null>(null)

  useEffect(() => {
    // First paint: the browser is already at the top, or is honouring a hash the
    // reader arrived with. Either way there is nothing to correct.
    if (previous.current === null || previous.current === pathname) {
      previous.current = pathname
      return
    }
    previous.current = pathname

    // A link to a specific section owns the scroll position; leave it alone.
    if (window.location.hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
