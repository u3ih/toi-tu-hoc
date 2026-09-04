'use client'

import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_META, switchLocale, t, type Locale } from '@/lib/i18n'

/**
 * VI | EN segmented control.
 *
 * Routing keys are the same in every locale, so the counterpart URL is the
 * current path with its prefix swapped — no per-page mapping needed.
 *
 * These are plain anchors rather than `next/link`, deliberately. Both locales
 * now render from the same root layout, and a client-side navigation between
 * them is not guaranteed to repaint `<html lang>`; a full load always does. The
 * language switch is also where a reader most expects a real page load.
 */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/'

  return (
    <nav
      className="retro-shadow-sm flex items-center overflow-hidden rounded-retro border-2"
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
          <a
            key={other}
            href={switchLocale(pathname, other)}
            hrefLang={meta.htmlLang}
            lang={meta.htmlLang}
            title={meta.label}
            className="px-2 py-1.5 font-mono text-xs transition-colors hover:bg-accent-400 hover:text-brand-900"
          >
            {meta.short}
          </a>
        )
      })}
    </nav>
  )
}
