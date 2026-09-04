import type { ProgressData, ProgressEntry, ProgressKey, ProgressStore } from './types'

/**
 * Progress in the reader's own browser.
 *
 * Every access is guarded: `localStorage` throws outright in some privacy
 * modes, and a reader who cannot store progress should still be able to read
 * the site. A failed read is an empty history, not an error.
 */

const KEY = 'toi-tu-hoc:progress:v1'

/** Reject anything that is not shaped like an entry, so a corrupt blob cannot crash a render. */
function parse(raw: string | null): ProgressData {
  if (!raw) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const clean: ProgressData = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue
      const { done, at } = value as { done?: unknown; at?: unknown }
      if (typeof done !== 'boolean') continue
      clean[key] = { done, at: typeof at === 'string' ? at : new Date(0).toISOString() }
    }
    return clean
  } catch {
    return {}
  }
}

export function createLocalProgressStore(): ProgressStore {
  function read(): ProgressData {
    try {
      return parse(localStorage.getItem(KEY))
    } catch {
      return {}
    }
  }

  function save(data: ProgressData): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      // Out of quota or storage denied. Progress is a convenience, not the site.
    }
  }

  return {
    async load() {
      return read()
    },

    async write(key: ProgressKey, entry: ProgressEntry | null) {
      const data = read()
      if (entry) data[key] = entry
      else delete data[key]
      save(data)
    },

    async clear() {
      try {
        localStorage.removeItem(KEY)
      } catch {
        // Nothing to do; see save().
      }
    },

    subscribe(listener) {
      // Fires only for changes made by *other* tabs, which is exactly the case
      // this tab cannot otherwise know about.
      function onStorage(event: StorageEvent) {
        if (event.key === KEY || event.key === null) listener()
      }
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    },
  }
}
