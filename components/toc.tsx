'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/content'

export function Toc({ headings }: { headings: Heading[] }) {
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

  if (headings.length < 2) return null

  return (
    <aside className="sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-56 shrink-0 overflow-y-auto py-8 xl:block">
      <p className="mb-3 text-xs font-semibold tracking-wide uppercase muted">Trong bài này</p>
      <ul className="space-y-1 border-l text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={[
                '-ml-px block border-l py-1 transition-colors',
                h.level === 3 ? 'pl-6' : 'pl-3',
                activeId === h.id
                  ? 'border-brand-500 font-medium text-brand-600 dark:text-brand-300'
                  : 'border-transparent muted hover:text-brand-600 dark:hover:text-brand-300',
              ].join(' ')}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
