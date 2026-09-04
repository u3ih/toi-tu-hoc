'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_META, switchLocale, t, type Locale } from '@/lib/i18n'

/**
 * VI | EN segmented control.
 *
 * Routing keys are the same in every locale, so the counterpart URL is the
 * current path with its prefix swapped — no per-page mapping needed. Each locale
 * lives under its own root layout, so these are plain links, not client
 * navigations: the browser reloads and picks up the right `<html lang>`.
 */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/'

  return (
    <div
      className="retro-shadow-sm flex items-center overflow-hidden rounded-retro border-2"
      role="group"
      aria-label={t(locale, 'nav.language')}
    >
      {LOCALES.map((other) => {
        const active = other === locale
        const meta = LOCALE_META[other]

        return active ? (
          <span
            key={other}
            aria-current="true"
            className="bg-accent-400 px-2 py-1.5 font-mono text-xs font-bold text-brand-900"
          >
            {meta.short}
          </span>
        ) : (
          <Link
            key={other}
            href={switchLocale(pathname, other)}
            hrefLang={meta.htmlLang}
            lang={meta.htmlLang}
            prefetch={false}
            title={meta.label}
            className="px-2 py-1.5 font-mono text-xs transition-colors hover:bg-accent-400 hover:text-brand-900"
          >
            {meta.short}
          </Link>
        )
      })}
    </div>
  )
}
