import { t, type Locale } from '@/lib/i18n'
import { contributeUrl, site } from '@/lib/site'

export function Footer({ locale }: { locale: Locale }) {
  const contribute = contributeUrl()

  return (
    <footer className="mt-auto border-t-2 py-10 text-center text-sm muted">
      <div aria-hidden className="retro-stripes mx-auto mb-6 h-2.5 w-32 rounded-retro border-2" />
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
    </footer>
  )
}
