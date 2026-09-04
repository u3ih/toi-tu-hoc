'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

/**
 * Render children at the end of `<body>` instead of where they sit in the tree.
 *
 * This exists because of one CSS rule with a long reach: an element with a
 * `backdrop-filter` becomes a containing block for `position: fixed`
 * descendants *and* its own stacking context. The site header carries
 * `backdrop-blur-xl`, so a `fixed inset-0` overlay rendered inside the header —
 * which is where the search button lives — is sized against the 64px header
 * rather than the viewport, and its own `backdrop-filter` samples only what the
 * header painted. The visible symptom is the header blurring while the page
 * behind the overlay stays sharp.
 *
 * Portalling to `<body>` puts the overlay back in the root stacking context,
 * where `fixed` and `backdrop-filter` mean what they look like they mean.
 *
 * Renders nothing until mounted: `document` does not exist while the static
 * export is being generated, and an overlay is never part of the first paint.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
