'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { paletteVars } from '@/lib/accent'
import type { CategoryGroup, Collection } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { Button, Link } from '@/lib/ui'

/** Above this many collections a flat list stops being scannable. */
const FILTER_THRESHOLD = 8

/** Strip Vietnamese diacritics so "ky nang" also matches "kỹ năng". */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
}

export function CollectionSwitcher({
  collections,
  groups = [],
  current,
  locale,
}: {
  collections: Collection[]
  groups?: CategoryGroup[]
  current?: Collection
  locale: Locale
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

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

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filterable = collections.length > FILTER_THRESHOLD

  // Fall back to a single unnamed group so the render path stays the same whether
  // or not the site has categories yet.
  const shown = useMemo(() => {
    const source: CategoryGroup[] =
      groups.length > 0
        ? groups
        : [
            {
              category: { key: 'all', title: '', description: '', emoji: '', order: 0 },
              collections,
            },
          ]

    const q = fold(query.trim())
    if (!q) return source

    return source
      .map((group) => ({
        ...group,
        collections: group.collections.filter(
          (c) => fold(c.title).includes(q) || fold(c.description).includes(q),
        ),
      }))
      .filter((group) => group.collections.length > 0)
  }, [groups, collections, query])

  if (collections.length < 2) return null

  // "Chọn chủ đề" alone is not enough: the trigger also reports the current one,
  // which on a phone is the only place that name is announced at all.
  const label = current
    ? `${t(locale, 'nav.switchTopic')}: ${current.shortTitle}`
    : t(locale, 'nav.topics')

  return (
    <div ref={ref} className="relative">
      <Button
        // The title collapses to a bare emoji below `sm`, and the emoji is
        // decorative — the accessible name has to come from `label`.
        label={label}
        text={current?.shortTitle ?? t(locale, 'nav.topics')}
        textHidden="sm"
        textClassName="max-w-32 truncate"
        icon={current?.emoji ?? '📚'}
        trailing={
          <svg
            aria-hidden="true"
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
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="surface absolute right-0 z-50 mt-2 w-72 overflow-hidden shadow-[6px_6px_0_var(--shadow-ink)]"
        >
          {filterable && (
            <div className="border-b-2 px-3 py-2">
              {/* The reader opened this menu a keystroke ago; focus landing
                  anywhere else would be the surprise. */}
              <input
                // biome-ignore lint/a11y/noAutofocus: focus follows the reader's own click
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(locale, 'nav.filterTopics')}
                aria-label={t(locale, 'nav.filterTopics')}
                className="w-full bg-transparent py-1 text-sm outline-none placeholder:opacity-60"
              />
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto p-1.5">
            {shown.map((group) => (
              <div key={group.category.key} className="mb-1 last:mb-0">
                {group.category.title && (
                  <p className="px-2.5 pt-2 pb-1 label-retro muted">
                    {group.category.emoji} {group.category.title}
                  </p>
                )}
                {group.collections.map((c) => (
                  <Link
                    key={c.slug}
                    href={c.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    data-accent={c.accent}
                    style={paletteVars(c.palette)}
                    className={[
                      'flex items-start gap-2.5 rounded-retro border-2 px-2.5 py-2 transition-colors',
                      c.slug === current?.slug
                        ? 'border-[var(--border)] bg-accent-400/30'
                        : 'border-transparent hover:border-[var(--border)] hover:bg-brand-500/10',
                    ].join(' ')}
                  >
                    <span aria-hidden className="mt-0.5">
                      {c.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {c.title}
                        {c.status === 'wip' && (
                          <span className="rounded-retro border-2 border-brand-900 bg-accent-400 px-1.5 py-0.5 label-retro text-brand-900">
                            {t(locale, 'collection.wip')}
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-2 text-xs muted">{c.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ))}

            {shown.length === 0 && (
              <p className="px-3 py-6 text-center text-sm muted">{t(locale, 'nav.noTopics')}</p>
            )}
          </div>

          <Link
            href={path(locale, 'topics')}
            onClick={() => setOpen(false)}
            className="block border-t-2 px-3 py-2.5 text-center label-retro muted transition-colors hover:bg-accent-400 hover:text-brand-900"
          >
            {t(locale, 'home.browseAll')} →
          </Link>
        </div>
      )}
    </div>
  )
}
