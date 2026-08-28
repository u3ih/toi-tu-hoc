'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type IndexEntry = {
  slug: string
  title: string
  description: string
  section: string
  headings: string[]
  text: string
}

type Hit = IndexEntry & { score: number; snippet: string }

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Strip Vietnamese diacritics so "tu vung" also matches "từ vựng". */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
}

function search(index: IndexEntry[], query: string): Hit[] {
  const q = fold(query.trim())
  if (q.length < 2) return []
  const terms = q.split(/\s+/)

  return index
    .map((entry) => {
      const title = fold(entry.title)
      const headings = fold(entry.headings.join(' '))
      const text = fold(entry.text)

      let score = 0
      for (const term of terms) {
        if (title.includes(term)) score += 10
        if (headings.includes(term)) score += 4
        if (text.includes(term)) score += 1
      }
      // Require every term to appear somewhere in the document.
      const all = terms.every((t) => title.includes(t) || headings.includes(t) || text.includes(t))
      if (!all) score = 0

      const at = text.indexOf(terms[0])
      const snippet =
        at === -1 ? entry.description : `…${entry.text.slice(Math.max(0, at - 60), at + 100).trim()}…`

      return { ...entry, score, snippet }
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}

export function Search() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<IndexEntry[]>([])
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const hits = useMemo(() => search(index, query), [index, query])

  useEffect(() => setCursor(0), [query])

  // Cmd/Ctrl+K opens, Escape closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Load the build-time index once, on first open.
  useEffect(() => {
    if (!open || index.length) return
    fetch(`${BASE_PATH}/search-index.json`)
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]))
  }, [open, index.length])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQuery('')
  }, [open])

  function go(hit: Hit) {
    setOpen(false)
    router.push(`/guide/${hit.slug}/`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm muted transition-colors hover:bg-brand-500/8 sm:w-56"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Tìm kiếm…</span>
        <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 font-sans text-[11px] sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm nội dung"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="surface w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 shrink-0 muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setCursor((c) => Math.min(c + 1, hits.length - 1))
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setCursor((c) => Math.max(c - 1, 0))
                  }
                  if (e.key === 'Enter' && hits[cursor]) go(hits[cursor])
                }}
                placeholder="Tìm bài viết, chủ đề…"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:opacity-60"
              />
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.map((hit, i) => (
                <li key={hit.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(hit)}
                    className={[
                      'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                      i === cursor ? 'bg-brand-500/12' : '',
                    ].join(' ')}
                  >
                    <p className="text-xs muted">{hit.section}</p>
                    <p className="text-sm font-medium">{hit.title}</p>
                    <p className="line-clamp-2 text-xs muted">{hit.snippet}</p>
                  </button>
                </li>
              ))}
              {query.trim().length >= 2 && hits.length === 0 && (
                <li className="px-3 py-6 text-center text-sm muted">Không tìm thấy kết quả nào.</li>
              )}
              {query.trim().length < 2 && (
                <li className="px-3 py-6 text-center text-sm muted">
                  Nhập ít nhất 2 ký tự. Dùng ↑ ↓ để chọn, Enter để mở.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
