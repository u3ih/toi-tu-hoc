'use client'

import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_META, switchLocale, t, type Locale } from '@/lib/i18n'

/**
 * VI | EN segmented control.
 *
 * Routing keys are the same in every locale, so the counterpart URL is the
 * current path with its prefix swapped — no per-page mapping needed.
 *
 * On a phone the segments become a single button, because the header band has
 * to hold six controls inside 320px and two 28px halves are the worst tap
 * target on the page. The button carries the language you would get by
 * pressing it, and cycles if the site ever has more than two.
 *
 * These are plain anchors rather than `next/link`, deliberately. Both locales
 * now render from the same root layout, and a client-side navigation between
 * them is not guaranteed to repaint `<html lang>`; a full load always does. The
 * language switch is also where a reader most expects a real page load.
 */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/'
  const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]
  const nextMeta = LOCALE_META[next]

  return (
    <>
      <a
        href={switchLocale(pathname, next)}
        hrefLang={nextMeta.htmlLang}
        lang={nextMeta.htmlLang}
        aria-label={`${t(locale, 'nav.language')}: ${nextMeta.label}`}
        title={nextMeta.label}
        className="retro-shadow-sm grid h-10 w-10 place-items-center rounded-retro border-2 font-mono text-xs font-bold transition-colors hover:bg-accent-400 hover:text-brand-900 sm:hidden"
      >
        {nextMeta.short}
      </a>

      <nav
        className="retro-shadow-sm hidden items-center overflow-hidden rounded-retro border-2 sm:flex"
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
    </>
  )
}
