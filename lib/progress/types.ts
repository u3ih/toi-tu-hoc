/**
 * The storage contract for reading progress.
 *
 * Today progress lives in the reader's own browser; one day it may live behind
 * an account. Everything above this file talks to the interface rather than to
 * `localStorage`, so that change is a new implementation plus one line in
 * `createProgressStore` — not a rewrite of every component that shows a tick.
 *
 * The methods are async even though the local implementation resolves
 * immediately. A synchronous API would have to be broken to add a network.
 */

/** Identifies one article, independent of locale — progress is not per language. */
export type ProgressKey = string

/** `collection/slug`, the same pair the routes use. */
export function progressKey(collection: string, slug: string): ProgressKey {
  return `${collection}/${slug}`
}

export type ProgressEntry = {
  /** Marked finished by the reader. */
  done: boolean
  /** When that happened, ISO 8601 — the basis for anything time-based later. */
  at: string
}

export type ProgressData = Record<ProgressKey, ProgressEntry>

export interface ProgressStore {
  /** Everything known about this reader. Never rejects; returns `{}` on failure. */
  load(): Promise<ProgressData>

  /** Write one entry, or remove it when `entry` is null. */
  write(key: ProgressKey, entry: ProgressEntry | null): Promise<void>

  /** Forget everything. */
  clear(): Promise<void>

  /**
   * Called when the data changed somewhere this tab did not — another tab now,
   * another device once there is a server. Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void
}
