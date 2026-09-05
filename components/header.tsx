'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import type { CategoryGroup, Collection, NavGroup } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { SidebarNav } from './sidebar'
import { Search } from './search'
import { ThemeToggle } from './theme-toggle'
import { CollectionSwitcher } from './collection-switcher'
import { LocaleSwitcher } from './locale-switcher'
import { useBodyScrollLock } from '@/lib/hooks'
import { Button, Link } from '@/lib/ui'

export function Header({
  siteName,
  locale,
  collections,
  groups = [],
  collection,
  nav = [],
}: {
  siteName: string
  locale: Locale
  collections: Collection[]
  /** Collections grouped by category, so the switcher can stay legible at scale. */
  groups?: CategoryGroup[]
  collection?: Collection
  nav?: NavGroup[]
}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerId = useId()

  // Close the mobile drawer whenever navigation lands on a new page. The effect
  // body does not read `pathname` — the dependency *is* the point.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on route change
  useEffect(() => setDrawerOpen(false), [pathname])

  useBodyScrollLock(drawerOpen)

  const hasNav = nav.length > 0

  return (
    <>
      {/* Opaque on a phone, frosted from sm up: a blurred backdrop is the one
          expensive thing in this header, and it buys the least on the device
          that scrolls the most. */}
      <header className="sticky top-0 z-40 border-b-2 bg-[var(--bg)] sm:bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] sm:backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-1.5 px-3 sm:gap-3 sm:px-6">
          {hasNav && (
            <Button
              size="icon"
              label={t(locale, drawerOpen ? 'nav.close' : 'nav.menu')}
              textHidden
              aria-expanded={drawerOpen}
              aria-controls={drawerId}
              onClick={() => setDrawerOpen((v) => !v)}
              className="shrink-0 lg:hidden"
              icon={
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-[18px] w-[18px]"
                >
                  {drawerOpen ? (
                    <path d="M18 6 6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  )}
                </svg>
              }
            />
          )}

          <Link
            href={path(locale)}
            aria-label={t(locale, 'nav.home')}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="retro-shadow-sm grid h-10 w-10 place-items-center rounded-retro border-2 border-brand-900 bg-accent-400 font-display text-base text-brand-900 transition-transform group-hover:-translate-y-0.5 sm:h-9 sm:w-9">
              {siteName.charAt(0)}
            </span>
            <span className="hidden font-display text-base tracking-tight sm:inline">
              {siteName}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Search
              locale={locale}
              collections={collections}
              groups={groups}
              currentCollection={collection?.slug}
            />
            <CollectionSwitcher
              locale={locale}
              collections={collections}
              groups={groups}
              current={collection}
            />
            <LocaleSwitcher locale={locale} />
            <ThemeToggle locale={locale} />
          </div>
        </div>
      </header>

      {drawerOpen && hasNav && (
        // Above the header band (z-40) and the article's sticky anchor bar
        // (z-30), which otherwise paints a strip straight across the drawer.
        <div id={drawerId} className="fixed inset-0 top-16 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            className="relative h-full w-72 max-w-[85vw] overflow-y-auto border-r-2 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{ background: 'var(--bg)' }}
          >
            {collection && (
              <p className="mb-5 flex items-center gap-2 border-b-2 pb-4 font-display text-sm">
                <span aria-hidden>{collection.emoji}</span>
                {collection.title}
              </p>
            )}
            <SidebarNav nav={nav} locale={locale} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
