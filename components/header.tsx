'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { CategoryGroup, Collection, NavGroup } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { SidebarNav } from './sidebar'
import { Search } from './search'
import { ThemeToggle } from './theme-toggle'
import { CollectionSwitcher } from './collection-switcher'
import { LocaleSwitcher } from './locale-switcher'

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

  // Close the mobile drawer whenever navigation lands on a new page. The effect
  // body does not read `pathname` — the dependency *is* the point.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on route change
  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const hasNav = nav.length > 0

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b-2 backdrop-blur-xl"
        style={{ background: 'color-mix(in oklab, var(--bg) 88%, transparent)' }}
      >
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          {hasNav && (
            <button
              type="button"
              aria-label={t(locale, drawerOpen ? 'nav.close' : 'nav.menu')}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              className="retro-shadow-sm grid h-9 w-9 shrink-0 place-items-center rounded-retro border-2 transition-colors hover:bg-accent-400 lg:hidden"
            >
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
            </button>
          )}

          <Link
            href={path(locale)}
            aria-label={t(locale, 'nav.home')}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="retro-shadow-sm grid h-9 w-9 place-items-center rounded-retro border-2 border-brand-900 bg-accent-400 font-display text-base text-brand-900 transition-transform group-hover:-translate-y-0.5">
              {siteName.charAt(0)}
            </span>
            <span className="hidden font-display text-base tracking-tight sm:inline">
              {siteName}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
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
        <div className="fixed inset-0 top-16 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            className="relative h-full w-72 max-w-[85vw] overflow-y-auto border-r-2 p-5"
            style={{ background: 'var(--bg)' }}
          >
            {collection && (
              <p className="mb-5 flex items-center gap-2 border-b-2 pb-4 font-display text-sm">
                <span aria-hidden>{collection.emoji}</span>
                {collection.title}
              </p>
            )}
            <SidebarNav nav={nav} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
