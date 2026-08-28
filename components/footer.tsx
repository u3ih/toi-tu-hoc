import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-auto border-t py-10 text-center text-sm muted">
      <p>
        {site.name} — nội dung mở
        {site.repoUrl && (
          <>
            {', đóng góp trên '}
            <a href={site.repoUrl} className="underline underline-offset-4 hover:text-brand-600">
              GitHub
            </a>
          </>
        )}
        .
      </p>
    </footer>
  )
}
