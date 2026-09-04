import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCollection, getDocs, getFlatNav, getNav } from '@/lib/content'
import { barePath, path, t, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { collectionSchema } from '@/lib/schema'
import { JsonLd } from '@/components/json-ld'
import { CollectionProgress } from '@/components/progress/collection-progress'
import { DocCheck } from '@/components/progress/doc-check'
import { Link } from '@/lib/ui'

export function collectionMetadata(locale: Locale, slug: string): Metadata {
  const collection = getCollection(locale, slug)
  if (!collection) return {}

  return pageMetadata({
    locale,
    bare: barePath(collection.href),
    title: collection.title,
    description: collection.description,
  })
}

export function CollectionPage({ locale, slug }: { locale: Locale; slug: string }) {
  const collection = getCollection(locale, slug)
  if (!collection) notFound()

  const nav = getNav(locale, slug)
  const flat = getFlatNav(locale, slug)
  const first = flat[0]

  return (
    <main id="main">
      <JsonLd data={collectionSchema(locale, collection, getDocs(locale, slug))} />

      <section className="relative overflow-hidden border-b-2">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="retro-rays animate-float-slow absolute -top-72 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          {/* Matches the BreadcrumbList in this page's JSON-LD. */}
          <nav className="mb-6 label-retro muted" aria-label={t(locale, 'nav.breadcrumb')}>
            <Link href={path(locale)} className="hover:text-brand-600 dark:hover:text-accent-400">
              {t(locale, 'nav.home')}
            </Link>
          </nav>
          <span
            className="retro-shadow mx-auto grid h-16 w-16 place-items-center rounded-retro border-2 border-brand-900 bg-accent-400 text-3xl"
            aria-hidden
          >
            {collection.emoji}
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] text-balance sm:text-5xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg muted text-pretty">
            {collection.description}
          </p>

          {first && (
            <Link
              href={first.href}
              className="retro-lift retro-shadow mt-9 inline-block rounded-retro border-2 bg-brand-600 px-6 py-3 font-semibold text-white"
            >
              {t(locale, 'collection.start')}: {first.title} →
            </Link>
          )}

          <CollectionProgress
            locale={locale}
            collection={slug}
            slugs={flat.map((doc) => doc.slug)}
            className="mx-auto mt-10 max-w-sm text-left"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {nav.map(({ section, items }) => (
            <div key={section.key} className="surface p-6">
              <h2 className="flex items-center gap-2 border-b-2 pb-3 font-display text-base">
                {section.emoji && <span aria-hidden>{section.emoji}</span>}
                {section.title}
              </h2>
              {/* The whole row is the link, title and blurb together: on a phone
                  a reader aims at the row, not at one line of 14px type. */}
              <ul className="mt-4 space-y-1 text-sm sm:space-y-2.5">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="group -mx-2 flex items-start gap-2 rounded-retro px-2 py-1.5 transition-colors hover:bg-brand-500/10 sm:mx-0 sm:px-0 sm:py-0 sm:hover:bg-transparent"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="font-medium decoration-2 underline-offset-4 transition-colors group-hover:text-brand-600 group-hover:underline dark:group-hover:text-accent-400">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="line-clamp-2 text-xs muted sm:line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </span>
                      <DocCheck locale={locale} collection={slug} slug={item.slug} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
