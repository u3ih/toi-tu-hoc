import type { ReactNode } from 'react'
import { LOCALE_META, type Locale } from '@/lib/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'

/**
 * The document shell.
 *
 * Each locale has its own root layout so `<html lang>` is correct in the static
 * HTML rather than patched after hydration — search engines and screen readers
 * both read the served markup.
 */
export function Shell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={LOCALE_META[locale].htmlLang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Footer locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  )
}
