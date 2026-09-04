import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCollection, getDocsByTag, tagLabel } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { tagSchema } from '@/lib/schema'
import { SiteHeader } from '@/components/site-header'
import { JsonLd } from '@/components/json-ld'
import { DocCard } from '@/components/doc-card'
import { Link } from '@/lib/ui'

export function tagMetadata(locale: Locale, tag: string): Metadata {
  const label = tagLabel(locale, tag)

  return pageMetadata({
    locale,
    bare: `/tags/${tag}/`,
    title: t(locale, 'tag.title', { tag: label }),
    description: t(locale, 'tag.description', { tag: label }),
  })
}

/**
 * Everything tagged one way, across every collection.
 *
 * This is the page that makes "sleep" a thing the site has an opinion about
 * rather than a word that happens to appear in two unrelated articles.
 */
export function TagPage({ locale, tag }: { locale: Locale; tag: string }) {
  const docs = getDocsByTag(locale, tag)
  if (docs.length === 0) notFound()

  const label = tagLabel(locale, tag)

  return (
    <>
      <JsonLd data={tagSchema(locale, tag, label, docs)} />
      <SiteHeader locale={locale} />

      <main id="main" className="mx-auto w-full max-w-4xl px-6 py-16">
        <nav
          className="flex flex-wrap items-center gap-1.5 label-retro muted"
          aria-label={t(locale, 'nav.breadcrumb')}
        >
          <Link href={path(locale)} className="hover:text-brand-600 dark:hover:text-accent-400">
            {t(locale, 'nav.home')}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={path(locale, 'tags')}
            className="hover:text-brand-600 dark:hover:text-accent-400"
          >
            {t(locale, 'tags.title')}
          </Link>
        </nav>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl">
          <span aria-hidden className="muted">
            #
          </span>
          {label}
        </h1>
        <p className="mt-3 label-retro muted">{t(locale, 'tag.count', { count: docs.length })}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {docs.map((doc) => (
            <DocCard
              key={`${doc.collection}/${doc.slug}`}
              doc={doc}
              collection={getCollection(locale, doc.collection) ?? undefined}
              locale={locale}
            />
          ))}
        </div>
      </main>
    </>
  )
}
