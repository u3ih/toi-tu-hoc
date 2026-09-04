import './globals.css'
import { DEFAULT_LOCALE, LOCALE_META } from '@/lib/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'
import { NotFoundPage } from '@/components/pages/not-found'

/**
 * The global 404, which a static export writes to `out/404.html`.
 *
 * It sits outside both locale route groups, so Next wraps it in its own default
 * `<html><body>` rather than one of the root layouts — this file must therefore
 * render body content only, and set `lang` from a script. Every real page keeps
 * `lang` in the served HTML; only this one, which is noindex by convention,
 * resolves it on load.
 */
export default function NotFound() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-encoded locale code
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(LOCALE_META[DEFAULT_LOCALE].htmlLang)}`,
        }}
      />
      <div className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotFoundPage locale={DEFAULT_LOCALE} />
          <Footer locale={DEFAULT_LOCALE} />
        </ThemeProvider>
      </div>
    </>
  )
}
