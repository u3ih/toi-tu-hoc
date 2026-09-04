'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'

/**
 * Which heading the reader is currently under.
 *
 * Measured on scroll rather than with an IntersectionObserver because the
 * question is not "what is visible" but "what did I last pass" — a long section
 * whose heading has scrolled off the top is still the section being read.
 */
function useActiveHeading(headings: Heading[]): string {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!headings.length) return

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)

    // Highlight the last heading whose top has scrolled past the header band.
    function update() {
      let current = elements[0]?.id ?? ''
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= 96) current = el.id
        else break
      }
      setActiveId(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [headings])

  return activeId
}

function TocList({
  headings,
  activeId,
  onNavigate,
}: {
  headings: Heading[]
  activeId: string
  onNavigate?: () => void
}) {
  return (
    <ul className="space-y-1 border-l-2 text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={onNavigate}
            aria-current={activeId === h.id ? 'location' : undefined}
            className={[
              '-ml-0.5 block border-l-2 py-1 transition-colors',
              h.level === 3 ? 'pl-6' : 'pl-3',
              activeId === h.id
                ? 'border-accent-500 font-semibold text-brand-700 dark:text-accent-400'
                : 'border-transparent muted hover:text-brand-600 dark:hover:text-accent-300',
            ].join(' ')}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

/** The anchor rail beside a wide article. */
export function Toc({ headings, locale }: { headings: Heading[]; locale: Locale }) {
  const activeId = useActiveHeading(headings)
  if (headings.length < 2) return null

  return (
    <aside className="sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-56 shrink-0 overflow-y-auto py-8 xl:block">
      <p className="mb-3 label-retro muted">{t(locale, 'doc.toc')}</p>
      <TocList headings={headings} activeId={activeId} />
    </aside>
  )
}

/**
 * The same anchors on a narrow screen, where the rail has nowhere to sit.
 *
 * Collapsed it is one line naming the section being read, which doubles as a
 * position indicator; open it is the full list. Sticky just below the header
 * and the reading-progress bar, so it stays reachable through a long article
 * instead of only at the top.
 */
export function TocMenu({ headings, locale }: { headings: Heading[]; locale: Locale }) {
  const activeId = useActiveHeading(headings)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (headings.length < 2) return null

  const current = headings.find((h) => h.id === activeId) ?? headings[0]

  return (
    <div
      className="sticky top-[4.375rem] z-30 -mx-4 mb-8 border-b-2 sm:-mx-6 xl:hidden"
      style={{ background: 'color-mix(in oklab, var(--bg) 94%, transparent)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left sm:px-6"
      >
        <span className="label-retro muted">{t(locale, 'doc.toc')}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{current.text}</span>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="max-h-[60vh] overflow-y-auto border-t-2 px-4 py-3 sm:px-6">
          <TocList headings={headings} activeId={activeId} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
