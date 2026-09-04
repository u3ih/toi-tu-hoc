'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/lib/content'

type IndexEntry = {
  collection: string
  collectionTitle: string
  accent: string
  slug: string
  href: string
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

function search(index: IndexEntry[], query: string, boost?: string): Hit[] {
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
      // Nudge the collection the reader is already in to the top.
      if (score > 0 && entry.collection === boost) score += 3

      const at = text.indexOf(terms[0])
      const snippet =
        at === -1 ? entry.description : `…${entry.text.slice(Math.max(0, at - 60), at + 100).trim()}…`

      return { ...entry, score, snippet }
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

export function Search({
  collections,
  currentCollection,
}: {
  collections: Collection[]
  currentCollection?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<IndexEntry[]>([])
  const [scope, setScope] = useState<string>('all')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const scoped = useMemo(
    () => (scope === 'all' ? index : index.filter((e) => e.collection === scope)),
    [index, scope],
  )
  const hits = useMemo(
    () => search(scoped, query, scope === 'all' ? currentCollection : undefined),
    [scoped, query, scope, currentCollection],
  )

  useEffect(() => setCursor(0), [query, scope])

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
    if (open) {
      inputRef.current?.focus()
      setScope(currentCollection ?? 'all')
    } else {
      setQuery('')
    }
  }, [open, currentCollection])

  function go(hit: Hit) {
    setOpen(false)
    router.push(hit.href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="retro-shadow-sm flex items-center gap-2 rounded-retro border-2 px-2.5 py-1.5 text-sm muted transition-colors hover:bg-accent-400 hover:text-brand-900 sm:w-52"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Tìm kiếm…</span>
        <kbd className="ml-auto hidden rounded-retro border-2 px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm nội dung"
          className="fixed inset-0 z-50 flex items-start justify-center bg-brand-900/60 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="surface w-full max-w-xl overflow-hidden shadow-[6px_6px_0_var(--shadow-ink)]">
            <div className="flex items-center gap-3 border-b-2 px-4">
              <SearchIcon className="muted" />
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

            {collections.length > 1 && (
              <div className="flex flex-wrap gap-1.5 border-b-2 px-3 py-2">
                <ScopeChip active={scope === 'all'} onClick={() => setScope('all')}>
                  Tất cả
                </ScopeChip>
                {collections.map((c) => (
                  <ScopeChip key={c.slug} active={scope === c.slug} onClick={() => setScope(c.slug)}>
                    <span aria-hidden>{c.emoji}</span> {c.shortTitle}
                  </ScopeChip>
                ))}
              </div>
            )}

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.map((hit, i) => (
                <li key={`${hit.collection}/${hit.slug}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(hit)}
                    data-accent={hit.accent}
                    className={[
                      'w-full rounded-retro border-2 px-3 py-2.5 text-left transition-colors',
                      i === cursor ? 'border-[var(--border)] bg-accent-400/30' : 'border-transparent',
                    ].join(' ')}
                  >
                    <p className="label-retro muted">
                      {hit.collectionTitle} · {hit.section}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{hit.title}</p>
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

function ScopeChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border-2 px-2.5 py-1 text-xs transition-colors',
        active
          ? 'border-brand-900 bg-accent-400 font-semibold text-brand-900'
          : 'border-transparent muted hover:border-[var(--border)] hover:bg-brand-500/10',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
