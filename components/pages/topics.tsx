import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategories, getCollections, getDocs, getTags } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { topicsSchema } from '@/lib/schema'
import { SiteHeader } from '@/components/site-header'
import { JsonLd } from '@/components/json-ld'
import { CollectionCard } from '@/components/collection-card'
import { TagPill } from '@/components/tag-pill'

export function topicsMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    bare: '/topics/',
    title: t(locale, 'topics.title'),
    description: t(locale, 'topics.description'),
  })
}

/**
 * The full index of everything the site covers.
 *
 * The home page shows a few collections per category; this page shows all of
 * them, plus the tag cloud. It is the page that stays usable at fifty topics,
 * and the one that gives search engines a single hub linking to every branch.
 */
export function TopicsPage({ locale }: { locale: Locale }) {
  const collections = getCollections(locale)
  const groups = getCategories(locale)
  const tags = getTags(locale)

  return (
    <>
      <JsonLd data={topicsSchema(locale, groups)} />
      <SiteHeader locale={locale} />

      <main id="main">
        <section className="relative overflow-hidden border-b-2">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="retro-rays animate-float-slow absolute -top-72 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2" />
          </div>

          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <nav className="label-retro muted" aria-label={t(locale, 'nav.breadcrumb')}>
              <Link href={path(locale)} className="hover:text-brand-600 dark:hover:text-accent-400">
                {t(locale, 'nav.home')}
              </Link>
            </nav>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-balance sm:text-5xl">
              {t(locale, 'topics.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg muted text-pretty">
              {t(locale, 'topics.description')}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl space-y-14 px-6 py-16">
          {groups.map(({ category, collections: inCategory }) => (
            <div key={category.key}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 pb-3">
                <h2 className="flex items-center gap-2 font-display text-xl">
                  <span aria-hidden>{category.emoji}</span>
                  {category.title}
                </h2>
                <p className="label-retro muted">
                  {t(locale, 'home.categoryCount', { count: inCategory.length })}
                </p>
              </div>
              {category.description && (
                <p className="mt-3 text-sm muted text-pretty">{category.description}</p>
              )}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {inCategory.map((c) => (
                  <CollectionCard
                    key={c.slug}
                    collection={c}
                    locale={locale}
                    preview={getDocs(locale, c.slug).slice(0, 3)}
                  />
                ))}
              </div>
            </div>
          ))}

          {collections.length === 0 && (
            <p className="text-center muted">{t(locale, 'home.empty')}</p>
          )}

          {tags.length > 0 && (
            <div>
              <h2 className="border-b-2 pb-3 font-display text-xl">{t(locale, 'topics.tags')}</h2>
              <p className="mt-3 text-sm muted">{t(locale, 'topics.tagsHint')}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li key={tag.key}>
                    <TagPill locale={locale} tag={tag} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
