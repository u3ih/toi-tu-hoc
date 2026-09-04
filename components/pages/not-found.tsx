import Link from 'next/link'
import { getCollections } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { getSite } from '@/lib/site'
import { Header } from '@/components/header'

export function NotFoundPage({ locale }: { locale: Locale }) {
  return (
    <>
      <Header siteName={getSite(locale).name} locale={locale} collections={getCollections(locale)} />
      <main id="main" className="mx-auto grid max-w-xl place-items-center px-6 py-32 text-center">
        <p className="retro-shadow rounded-retro border-2 border-brand-900 bg-accent-400 px-6 py-2 font-display text-6xl text-brand-900">
          404
        </p>
        <h1 className="mt-6 font-display text-2xl">{t(locale, 'notFound.title')}</h1>
        <p className="mt-3 muted">{t(locale, 'notFound.body')}</p>
        <Link
          href={path(locale)}
          className="retro-lift retro-shadow mt-8 rounded-retro border-2 bg-brand-600 px-5 py-2.5 font-semibold text-white"
        >
          {t(locale, 'notFound.home')}
        </Link>
      </main>
    </>
  )
}
