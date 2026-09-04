import { getTags } from '@/lib/content'
import { path, t, type Locale } from '@/lib/i18n'
import { contributeUrl, site } from '@/lib/site'
import { ResetProgress } from '@/components/progress/reset-progress'
import { Link } from '@/lib/ui'

export function Footer({ locale }: { locale: Locale }) {
  const contribute = contributeUrl()
  const hasTags = getTags(locale).length > 0

  return (
    <footer className="mt-auto border-t-2 py-10 text-center text-sm muted">
      <div aria-hidden className="retro-stripes mx-auto mb-6 h-2.5 w-32 rounded-retro border-2" />

      {/* Every hub reachable from every page — the cheapest internal linking there is. */}
      <nav className="mb-5 flex flex-wrap justify-center gap-x-5 gap-y-2 label-retro">
        <Link href={path(locale)} className="hover:text-brand-600 dark:hover:text-accent-400">
          {t(locale, 'nav.home')}
        </Link>
        <Link
          href={path(locale, 'topics')}
          className="hover:text-brand-600 dark:hover:text-accent-400"
        >
          {t(locale, 'topics.title')}
        </Link>
        {hasTags && (
          <Link
            href={path(locale, 'tags')}
            className="hover:text-brand-600 dark:hover:text-accent-400"
          >
            {t(locale, 'tags.title')}
          </Link>
        )}
      </nav>

      <p>
        {site.name} — {t(locale, 'footer.open')}
        {contribute && (
          <>
            {`, ${t(locale, 'footer.contribute')} `}
            <a
              href={contribute}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-2 underline-offset-4 hover:text-brand-600 dark:hover:text-accent-400"
            >
              GitHub
            </a>
          </>
        )}
        .
      </p>

      <p className="mt-3 text-xs">
        <ResetProgress locale={locale} />
      </p>
    </footer>
  )
}
