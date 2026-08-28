'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Collection } from '@/lib/content'

export function CollectionSwitcher({
  collections,
  current,
}: {
  collections: Collection[]
  current?: Collection
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (collections.length < 2) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-brand-500/8"
      >
        <span aria-hidden>{current?.emoji ?? '📚'}</span>
        <span className="hidden max-w-32 truncate sm:inline">
          {current?.shortTitle ?? 'Chủ đề'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="surface absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl p-1.5 shadow-xl"
        >
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}/`}
              role="menuitem"
              onClick={() => setOpen(false)}
              data-accent={c.accent}
              className={[
                'flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors',
                c.slug === current?.slug ? 'bg-brand-500/12' : 'hover:bg-brand-500/8',
              ].join(' ')}
            >
              <span aria-hidden className="mt-0.5">
                {c.emoji}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {c.title}
                  {c.status === 'wip' && (
                    <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-normal text-brand-700 dark:text-brand-300">
                      đang viết
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs muted">{c.description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
