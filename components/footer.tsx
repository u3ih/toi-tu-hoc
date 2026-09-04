import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 py-10 text-center text-sm muted">
      <div aria-hidden className="retro-stripes mx-auto mb-6 h-2.5 w-32 rounded-retro border-2" />
      <p>
        {site.name} — nội dung mở
        {site.repoUrl && (
          <>
            {', đóng góp trên '}
            <a href={site.repoUrl} className="font-semibold underline decoration-2 underline-offset-4 hover:text-brand-600 dark:hover:text-accent-400">
              GitHub
            </a>
          </>
        )}
        .
      </p>
    </footer>
  )
}
