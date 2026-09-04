import Link from 'next/link'
import type { Metadata } from 'next'
import { getTags } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { tagsSchema } from '@/lib/schema'
import { SiteHeader } from '@/components/site-header'
import { JsonLd } from '@/components/json-ld'
import { TagPill } from '@/components/tag-pill'

export function tagsMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    bare: '/tags/',
    title: t(locale, 'tags.title'),
    description: t(locale, 'tags.description'),
  })
}

/** The tag index: one hub linking every cross-collection thread on the site. */
export function TagsPage({ locale }: { locale: Locale }) {
  const tags = getTags(locale)

  return (
    <>
      <JsonLd data={tagsSchema(locale, tags)} />
      <SiteHeader locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 py-16">
        <nav className="label-retro muted" aria-label={t(locale, 'nav.breadcrumb')}>
          <Link href={path(locale)} className="hover:text-brand-600 dark:hover:text-accent-400">
            {t(locale, 'nav.home')}
          </Link>
        </nav>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl">{t(locale, 'tags.title')}</h1>
        <p className="mt-4 text-lg muted text-pretty">{t(locale, 'tags.description')}</p>

        {tags.length === 0 ? (
          <p className="mt-10 muted">{t(locale, 'tags.empty')}</p>
        ) : (
          <ul className="mt-10 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.key}>
                <TagPill locale={locale} tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
