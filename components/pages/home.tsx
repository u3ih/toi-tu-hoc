import Link from 'next/link'
import { getCollections } from '@/lib/content'
import { t, type Locale } from '@/lib/i18n'
import { homeSchema } from '@/lib/schema'
import { getSite } from '@/lib/site'
import { Header } from '@/components/header'
import { JsonLd } from '@/components/json-ld'

export function HomePage({ locale }: { locale: Locale }) {
  const site = getSite(locale)
  const collections = getCollections(locale)

  return (
    <>
      <JsonLd data={homeSchema(locale, collections)} />
      <Header siteName={site.name} locale={locale} collections={collections} />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b-2">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {/* Sun rays fanning out from above the title. */}
            <div className="retro-rays animate-float-slow absolute -top-64 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2" />
            {/* Half-disc cresting the top edge, like a sun on a travel poster. */}
            <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border-2 border-brand-900 bg-accent-400" />
          </div>

          <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
            <p className="retro-shadow-sm inline-flex items-center gap-2 rounded-full border-2 border-brand-900 bg-accent-400 px-4 py-1.5 label-retro text-brand-900">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-900" />
              {t(locale, 'home.badge')}
            </p>

            <h1 className="mt-7 font-display text-4xl leading-[1.08] text-balance sm:text-6xl">
              {site.name}
              <span className="mt-2 block text-brand-600 dark:text-accent-400">{site.tagline}</span>
            </h1>

            {/* Barber-pole rule under the title. */}
            <div aria-hidden className="retro-stripes mx-auto mt-8 h-3 w-40 rounded-retro border-2" />

            <p className="mx-auto mt-8 max-w-2xl text-lg muted text-pretty">{site.description}</p>
          </div>
        </section>

        {/* Collections */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center font-display text-2xl sm:text-3xl">
            {t(locale, 'home.collections')}
          </h2>
          <p className="mt-3 text-center label-retro muted">{t(locale, 'home.pick')}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={c.href}
                data-accent={c.accent}
                className="surface retro-lift group relative overflow-hidden p-6"
              >
                {/* Colour block in the corner, hard-edged like a printed swatch. */}
                <div
                  aria-hidden
                  className="absolute -top-9 -right-9 h-20 w-20 rotate-45 bg-brand-500/30 transition-colors group-hover:bg-accent-400/70"
                />
                <div className="relative">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-retro border-2 bg-brand-500/15 text-2xl"
                    aria-hidden
                  >
                    {c.emoji}
                  </span>
                  <h3 className="mt-4 flex items-center gap-2 font-display text-lg">
                    {c.title}
                    {c.status === 'wip' && (
                      <span className="rounded-retro border-2 border-brand-900 bg-accent-400 px-1.5 py-0.5 label-retro text-brand-900">
                        {t(locale, 'collection.wip')}
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm muted">{c.description}</p>
                  <p className="mt-4 border-t-2 pt-3 label-retro muted">
                    {t(locale, 'collection.count', {
                      docs: c.docCount,
                      sections: c.sections.length,
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {collections.length === 0 && (
            <p className="mt-10 text-center muted">{t(locale, 'home.empty')}</p>
          )}
        </section>
      </main>
    </>
  )
}
