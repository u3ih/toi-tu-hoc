'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SidebarNav } from './sidebar'
import { Search } from './search'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the mobile drawer whenever navigation lands on a new page.
  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <>
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: 'color-mix(in oklab, var(--bg) 82%, transparent)' }}>
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            aria-label="Mở menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-[18px] w-[18px]"
            >
              {drawerOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
              A
            </span>
            <span className="hidden sm:inline">Tôi Tự Học Tiếng Anh</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Search />
            <Link
              href="/guide/gioi-thieu/"
              className="hidden rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 md:inline-block"
            >
              Bắt đầu học
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 top-16 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            className="surface relative h-full w-72 max-w-[85vw] overflow-y-auto p-5"
            style={{ background: 'var(--bg)' }}
          >
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
