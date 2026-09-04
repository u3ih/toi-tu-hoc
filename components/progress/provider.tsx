'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createProgressStore, progressKey, type ProgressData } from '@/lib/progress/store'

type ProgressApi = {
  /**
   * False until the store has answered.
   *
   * Progress cannot be known during server rendering, so every consumer holds
   * its neutral state until this flips — which is also what keeps the first
   * paint identical on server and client.
   */
  ready: boolean
  isDone(collection: string, slug: string): boolean
  toggle(collection: string, slug: string): void
  /**
   * Mark finished, idempotently.
   *
   * Separate from `toggle` because the caller is not always the reader: an
   * article that has been read to the end marks itself, and doing that with
   * `toggle` would un-mark one the reader had already ticked.
   */
  markDone(collection: string, slug: string): void
  /** How many of `slugs` are finished, for a collection's counter. */
  countDone(collection: string, slugs: string[]): number
  /** Total finished across the whole site. */
  total: number
  reset(): void
}

const NOOP: ProgressApi = {
  ready: false,
  isDone: () => false,
  toggle: () => {},
  markDone: () => {},
  countDone: () => 0,
  total: 0,
  reset: () => {},
}

const ProgressContext = createContext<ProgressApi>(NOOP)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>({})
  const [ready, setReady] = useState(false)

  // One store for the life of the provider; swapping implementations happens in
  // createProgressStore, not here.
  const storeRef = useRef<ReturnType<typeof createProgressStore> | null>(null)
  if (!storeRef.current) storeRef.current = createProgressStore()
  const store = storeRef.current

  useEffect(() => {
    let live = true

    store.load().then((loaded) => {
      if (!live) return
      setData(loaded)
      setReady(true)
    })

    const unsubscribe = store.subscribe(() => {
      store.load().then((loaded) => {
        if (live) setData(loaded)
      })
    })

    return () => {
      live = false
      unsubscribe()
    }
  }, [store])

  const toggle = useCallback(
    (collection: string, slug: string) => {
      const key = progressKey(collection, slug)

      setData((current) => {
        const next = { ...current }
        if (current[key]?.done) {
          delete next[key]
          void store.write(key, null)
        } else {
          const entry = { done: true, at: new Date().toISOString() }
          next[key] = entry
          void store.write(key, entry)
        }
        return next
      })
    },
    [store],
  )

  const markDone = useCallback(
    (collection: string, slug: string) => {
      const key = progressKey(collection, slug)

      setData((current) => {
        if (current[key]?.done) return current
        const entry = { done: true, at: new Date().toISOString() }
        void store.write(key, entry)
        return { ...current, [key]: entry }
      })
    },
    [store],
  )

  const reset = useCallback(() => {
    setData({})
    void store.clear()
  }, [store])

  const api = useMemo<ProgressApi>(
    () => ({
      ready,
      isDone: (collection, slug) => data[progressKey(collection, slug)]?.done === true,
      toggle,
      markDone,
      countDone: (collection, slugs) =>
        slugs.filter((slug) => data[progressKey(collection, slug)]?.done).length,
      total: Object.values(data).filter((entry) => entry.done).length,
      reset,
    }),
    [data, ready, toggle, markDone, reset],
  )

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
}

/**
 * Reading progress.
 *
 * Safe to call outside a provider — it returns the neutral state, so a
 * component can be dropped anywhere without a guard.
 */
export function useProgress(): ProgressApi {
  return useContext(ProgressContext)
}
