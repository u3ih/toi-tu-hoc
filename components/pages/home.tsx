import {
  getCategories,
  getCollections,
  getDocs,
  getFlatNav,
  type CategoryGroup,
} from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { homeSchema } from '@/lib/schema'
import { getSite } from '@/lib/site'
import { SiteHeader } from '@/components/site-header'
import { JsonLd } from '@/components/json-ld'
import { CollectionCard } from '@/components/collection-card'
import { Link } from '@/lib/ui'

/** Collections shown per category before the reader is sent to /topics/ instead. */
const PER_CATEGORY = 4

export function HomePage({ locale }: { locale: Locale }) {
  const site = getSite(locale)
  const collections = getCollections(locale)
  const groups = getCategories(locale)

  // The hero used to end on a paragraph, which left a reader who was already
  // convinced with nothing to press. This is the first page of the first
  // collection — the one answer to "so where do I start".
  const start = collections.length ? getFlatNav(locale, collections[0].slug)[0] : undefined

  // With one category there is nothing to distinguish, so the heading would be
  // noise. Grouping only earns its keep once the site spans several areas.
  const grouped = groups.length > 1

  return (
    <>
      <JsonLd data={homeSchema(locale, collections, groups)} />
      <SiteHeader locale={locale} />

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
            <div
              aria-hidden
              className="retro-stripes mx-auto mt-8 h-3 w-40 rounded-retro border-2"
            />

            <p className="mx-auto mt-8 max-w-2xl text-lg muted text-pretty">{site.description}</p>

            {start && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={start.href}
                  className="retro-lift retro-shadow inline-flex min-h-12 items-center rounded-retro border-2 bg-brand-600 px-6 font-semibold text-white"
                >
                  {t(locale, 'home.startHere')} →
                </Link>
                <Link
                  href={path(locale, 'topics')}
                  className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 muted hover:text-brand-600 dark:hover:text-accent-400"
                >
                  {t(locale, 'home.browseAll')}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Collections */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4 pt-16">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">{t(locale, 'home.collections')}</h2>
              <p className="mt-2 label-retro muted">{t(locale, 'home.pick')}</p>
            </div>
            {collections.length > PER_CATEGORY && (
              <Link
                href={path(locale, 'topics')}
                className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 muted hover:text-brand-600 dark:hover:text-accent-400"
              >
                {t(locale, 'home.browseAll')} →
              </Link>
            )}
          </div>

          {grouped ? (
            <div className="mt-12 space-y-14">
              {groups.map((group) => (
                <CategorySection key={group.category.key} group={group} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {collections.map((c) => (
                <CollectionCard
                  key={c.slug}
                  collection={c}
                  locale={locale}
                  preview={previewOf(locale, c.slug)}
                  slugs={slugsOf(locale, c.slug)}
                />
              ))}
            </div>
          )}

          {collections.length === 0 && (
            <p className="mt-10 text-center muted">{t(locale, 'home.empty')}</p>
          )}
        </section>
      </main>
    </>
  )
}

function CategorySection({ group, locale }: { group: CategoryGroup; locale: Locale }) {
  const shown = group.collections.slice(0, PER_CATEGORY)
  const hidden = group.collections.length - shown.length

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 pb-3">
        <h3 className="flex items-center gap-2 font-display text-xl">
          <span aria-hidden>{group.category.emoji}</span>
          {group.category.title}
        </h3>
        <p className="label-retro muted">
          {t(locale, 'home.categoryCount', { count: group.collections.length })}
        </p>
      </div>
      {group.category.description && (
        <p className="mt-3 text-sm muted text-pretty">{group.category.description}</p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {shown.map((c) => (
          <CollectionCard
            key={c.slug}
            collection={c}
            locale={locale}
            preview={previewOf(locale, c.slug)}
            slugs={slugsOf(locale, c.slug)}
          />
        ))}
      </div>

      {hidden > 0 && (
        <p className="mt-4 text-sm">
          <Link
            href={path(locale, 'topics')}
            className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 muted hover:text-brand-600 dark:hover:text-accent-400"
          >
            {t(locale, 'home.andMore', { count: hidden })} →
          </Link>
        </p>
      )}
    </div>
  )
}

/** First three articles of a collection, so the card shows content, not just a count. */
function previewOf(locale: Locale, slug: string) {
  return getDocs(locale, slug).slice(0, 3)
}

/** Every article key in a collection — the denominator for its progress badge. */
function slugsOf(locale: Locale, slug: string) {
  return getDocs(locale, slug).map((doc) => doc.slug)
}
