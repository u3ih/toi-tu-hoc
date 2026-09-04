import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getCollection, getDoc, getFlatNav, getNav, tagLabel } from '@/lib/content'
import { barePath, DEFAULT_LOCALE, LOCALE_META, path, t, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { editUrl } from '@/lib/site'
import { docSchema } from '@/lib/schema'
import { mdxComponents } from '@/components/mdx'
import { JsonLd } from '@/components/json-ld'
import { Sidebar } from '@/components/sidebar'
import { Toc, TocMenu } from '@/components/toc'
import { Pager } from '@/components/pager'
import { ReadingProgress } from '@/components/progress-bar'
import { Related } from '@/components/related'
import { Takeaways } from '@/components/takeaways'
import { DoneToggle } from '@/components/progress/done-toggle'
import { TagPill } from '@/components/tag-pill'
import { LevelBadge } from '@/components/level-badge'
import { Link } from '@/lib/ui'

export function docMetadata(locale: Locale, collection: string, slug: string): Metadata {
  const doc = getDoc(locale, collection, slug)
  if (!doc) return {}

  const section = getCollection(locale, collection)?.sections.find((s) => s.key === doc.section)

  return pageMetadata({
    locale,
    bare: barePath(doc.href),
    title: doc.title,
    description: doc.description,
    type: 'article',
    section: section?.title,
  })
}

export function DocPage({
  locale,
  collection: collectionSlug,
  slug,
}: {
  locale: Locale
  collection: string
  slug: string
}) {
  const collection = getCollection(locale, collectionSlug)
  const doc = getDoc(locale, collectionSlug, slug)
  if (!collection || !doc) notFound()

  const section = collection.sections.find((s) => s.key === doc.section)
  const edit = editUrl(collectionSlug, doc.slug, locale, doc.translated)

  return (
    <>
      <JsonLd data={docSchema(locale, collection, doc, section?.title ?? doc.section)} />
      <ReadingProgress />

      {/* `w-full` is load-bearing: the collection shell wraps the page in a
          `display: contents` node, so this div is a flex item of the column-flex
          body. An auto inline margin defeats the stretch, which would leave the
          row shrink-to-fit — sized by its content instead of the viewport, and
          wider than a phone screen. */}
      <div className="mx-auto flex w-full max-w-[100rem] gap-8 px-4 sm:px-6">
        <Sidebar nav={getNav(locale, collectionSlug)} locale={locale} />

        <main id="main" className="min-w-0 flex-1 py-10">
          <article className="mx-auto max-w-3xl">
            <header className="mb-10 border-b-2 pb-8">
              {/* Three levels, matching the BreadcrumbList in the JSON-LD graph —
                  a crawler that renders the trail should see the same trail. */}
              <nav
                className="flex flex-wrap items-center gap-1.5 label-retro muted"
                aria-label={t(locale, 'nav.breadcrumb')}
              >
                <Link
                  href={path(locale)}
                  className="hover:text-brand-600 dark:hover:text-accent-400"
                >
                  {t(locale, 'nav.home')}
                </Link>
                <span aria-hidden>/</span>
                <Link
                  href={collection.href}
                  className="hover:text-brand-600 dark:hover:text-accent-400"
                >
                  {collection.emoji} {collection.title}
                </Link>
                <span aria-hidden>/</span>
                <span>{section?.title ?? doc.section}</span>
              </nav>

              <h1 className="mt-4 font-display text-3xl leading-[1.15] text-balance sm:text-4xl">
                {doc.title}
              </h1>
              {doc.description && (
                <p className="mt-4 text-lg muted text-pretty">{doc.description}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <p className="retro-shadow-sm inline-block rounded-retro border-2 border-brand-900 bg-accent-400 px-2.5 py-1 label-retro text-brand-900">
                  {t(locale, 'doc.readingTime', { minutes: doc.readingTime })}
                </p>
                <LevelBadge locale={locale} level={doc.level} />
                {doc.tags.map((tag) => (
                  <TagPill
                    key={tag}
                    locale={locale}
                    tag={{ key: tag, label: tagLabel(locale, tag) }}
                    showCount={false}
                  />
                ))}
              </div>

              {/* The page falls back to the default locale rather than 404ing, so
                  say so instead of silently showing the wrong language. */}
              {!doc.translated && (
                <p
                  lang={LOCALE_META[DEFAULT_LOCALE].htmlLang}
                  className="mt-5 rounded-retro border-2 border-dashed bg-brand-500/10 px-3 py-2 text-sm muted"
                >
                  {t(locale, 'doc.untranslated', {
                    language: LOCALE_META[locale].label,
                    fallback: LOCALE_META[DEFAULT_LOCALE].label,
                  })}
                </p>
              )}
            </header>

            {/* On a narrow screen the anchor rail has nowhere to sit, so the
                same anchors ride along under the header instead. */}
            <TocMenu headings={doc.headings} locale={locale} />

            <Takeaways locale={locale} items={doc.takeaways} />

            <div
              className="prose prose-neutral max-w-none dark:prose-invert
                prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:font-normal
                prose-headings:tracking-tight
                prose-h2:mt-12 prose-h2:text-2xl prose-h2:border-b-2 prose-h2:pb-2
                prose-h3:mt-8 prose-h3:text-lg
                prose-a:text-brand-600 prose-a:font-medium prose-a:decoration-2
                prose-a:underline-offset-4 dark:prose-a:text-accent-400
                prose-strong:text-brand-700 dark:prose-strong:text-accent-300
                prose-code:rounded-retro prose-code:border-2 prose-code:bg-accent-400/25
                prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em]
                prose-code:font-normal
                prose-code:before:content-none prose-code:after:content-none
                prose-pre:rounded-retro prose-pre:border-2 prose-pre:border-[var(--border)]
                prose-blockquote:border-l-4 prose-blockquote:border-l-accent-500
                prose-blockquote:bg-accent-400/12 prose-blockquote:py-1 prose-blockquote:not-italic
                prose-blockquote:rounded-r-retro
                prose-th:label-retro prose-td:border-[var(--border)] prose-th:border-[var(--border)]
                prose-img:rounded-retro prose-img:border-2
                prose-hr:border-t-2 prose-hr:border-dashed"
            >
              <MDXRemote
                source={doc.body}
                components={mdxComponents(locale, doc.translated ? locale : DEFAULT_LOCALE)}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>

            {edit && (
              <p className="mt-12 text-sm">
                <a
                  href={edit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4 muted hover:text-brand-600 dark:hover:text-accent-400"
                >
                  ✏️ {t(locale, 'doc.edit')} →
                </a>
              </p>
            )}

            <DoneToggle locale={locale} collection={collectionSlug} slug={doc.slug} />

            <Pager flatNav={getFlatNav(locale, collectionSlug)} slug={doc.slug} locale={locale} />

            <Related locale={locale} doc={doc} />
          </article>
        </main>

        <Toc headings={doc.headings} locale={locale} />
      </div>
    </>
  )
}
