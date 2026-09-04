'use client'

import { useEffect, useRef, useState } from 'react'
import { useProgress } from './provider'

/**
 * Active reading time an article has to collect before it may mark itself
 * finished. Reaching the end of a page takes a second if you flick the
 * scrollbar, so the clock is what separates reading from skimming.
 */
const MIN_ACTIVE_MS = 60_000

/** How close to the end of the page counts as having reached the end. */
const BOTTOM_SLACK_PX = 120

/** How often the two conditions are re-checked. */
const TICK_MS = 1_000

/**
 * Mark an article finished once it has actually been read: the reader reached
 * the bottom of the page *and* spent at least a minute on it.
 *
 * Time only accrues while the tab is visible, so a page left open in a
 * background tab never marks itself. The mark fires at most once per visit —
 * a reader who un-ticks it afterwards is not overruled.
 *
 * Returns whether this visit is the one that marked it, which is the only
 * reason the toggle knows to explain itself.
 */
export function useAutoDone(collection: string, slug: string): boolean {
  const { ready, isDone, markDone } = useProgress()
  const [markedHere, setMarkedHere] = useState(false)
  const firedRef = useRef(false)

  const done = ready && isDone(collection, slug)

  useEffect(() => {
    if (!ready || done || firedRef.current) return

    let activeMs = 0
    let last = Date.now()

    const timer = window.setInterval(() => {
      const now = Date.now()
      // A hidden tab is not being read, so its seconds do not count.
      if (document.visibilityState === 'visible') activeMs += now - last
      last = now

      if (activeMs < MIN_ACTIVE_MS) return

      const reached =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - BOTTOM_SLACK_PX
      if (!reached) return

      firedRef.current = true
      window.clearInterval(timer)
      markDone(collection, slug)
      setMarkedHere(true)
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [ready, done, collection, slug, markDone])

  return markedHere && done
}
