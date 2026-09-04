import { createLocalProgressStore } from './local-store'
import type { ProgressStore } from './types'

/**
 * The one place that decides where progress is kept.
 *
 * Adding a server-backed store means writing it, then choosing it here — on a
 * signed-in reader, say, falling back to the local store for everyone else.
 * Nothing else in the app needs to know which one it got.
 */
export function createProgressStore(): ProgressStore {
  return createLocalProgressStore()
}

export * from './types'
