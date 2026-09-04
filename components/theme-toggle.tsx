'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { t, type Locale } from '@/lib/i18n'

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={t(locale, 'nav.theme')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="retro-shadow-sm grid h-10 w-10 place-items-center rounded-retro border-2 transition-colors hover:bg-accent-400 hover:text-brand-900 sm:h-9 sm:w-9"
    >
      {/* Render a stable icon until mounted so SSR and client markup agree. */}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  )
}
