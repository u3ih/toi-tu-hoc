import { notFound } from 'next/navigation'
import { isLocale, type Locale } from './i18n'

/**
 * The locale from a route's params, validated.
 *
 * `generateStaticParams` only ever emits real locales, so this never fires in a
 * static export — it is here so that a stray `/de/english/faq/` 404s instead of
 * rendering a page in whichever language `pick` fell back to.
 */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return locale
}
