import type { ReactNode } from 'react'
import '../globals.css'
import { DEFAULT_LOCALE, LOCALE_META } from '@/lib/i18n'

/**
 * Root layout for the language router at `/`.
 *
 * Every locale is prefixed, so `/` belongs to no language. It gets its own root
 * layout — one of two in this app — rather than being squeezed into the
 * `[locale]` tree, which would have forced a locale on a page that has none.
 */
export default function RouterLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LOCALE_META[DEFAULT_LOCALE].htmlLang}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
