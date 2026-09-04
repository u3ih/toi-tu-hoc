'use client'

import { useEffect } from 'react'

/**
 * Freeze background scrolling while something is open over the page.
 *
 * Restores whatever `overflow` was there before rather than clearing it, so two
 * of these overlapping — a drawer that opens the search dialog, say — cannot
 * leave the page permanently unscrollable when the inner one closes.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
