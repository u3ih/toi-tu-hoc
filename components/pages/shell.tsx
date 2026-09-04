import type { ReactNode } from 'react'
import { fontVariables } from '@/lib/fonts'
import { LOCALE_META, type Locale } from '@/lib/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'
import { ProgressProvider } from '@/components/progress/provider'
import { GoogleTagManager } from '@/components/analytics/gtm'
import { GtmRouteViews } from '@/components/analytics/gtm-route-views'
import { ScrollToTop } from '@/components/scroll-to-top'

/**
 * The document shell.
 *
 * Each locale has its own root layout so `<html lang>` is correct in the static
 * HTML rather than patched after hydration — search engines and screen readers
 * both read the served markup.
 *
 * Fonts arrive as CSS variables on `<html>` from next/font, which self-hosts
 * them; there is deliberately no `<head>` here, and nothing to preconnect to.
 */
export function Shell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={LOCALE_META[locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressProvider>
            <ScrollToTop />
            {children}
            <Footer locale={locale} />
          </ProgressProvider>
        </ThemeProvider>
        <GoogleTagManager />
        <GtmRouteViews locale={locale} />
      </body>
    </html>
  )
}
