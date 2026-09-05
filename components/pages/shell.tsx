import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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

        {/* Vercel Web Analytics. No id to configure: the script is served from
            this deployment's own origin, so it counts only what Vercel is
            already serving, and Vercel's dashboard is the container. On a
            `pnpm dev` server the package swaps in its debug build, which logs
            page views to the console and sends nothing. */}
        <Analytics />

        {/* Real-user Web Vitals, same deal: no id, served from this origin,
            reported to Vercel's Speed Insights tab. Samples real visitors, so
            it measures the site people actually get rather than a lab run. */}
        <SpeedInsights />
      </body>
    </html>
  )
}
