import Link from 'next/link'
import { site } from '@/lib/site'
import { getCollections } from '@/lib/content'
import { Header } from '@/components/header'

export default function HomePage() {
  const collections = getCollections()

  return (
    <>
      <Header siteName={site.name} collections={collections} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-float-slow absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="animate-float-slow absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl [animation-delay:3s]" />
          </div>

          <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
            <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Miễn phí · Cập nhật liên tục
            </p>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              {site.name}
              <span className="block bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent">
                {site.tagline}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg muted text-pretty">{site.description}</p>
          </div>
        </section>

        {/* Collections */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Các bộ nội dung</h2>
          <p className="mt-2 text-center muted">Chọn một chủ đề để bắt đầu.</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}/`}
                data-accent={c.accent}
                className="surface group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-brand-500"
              >
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-500/20 opacity-50 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div className="relative">
                  <span className="text-3xl" aria-hidden>
                    {c.emoji}
                  </span>
                  <h3 className="mt-3 flex items-center gap-2 text-lg font-semibold">
                    {c.title}
                    {c.status === 'wip' && (
                      <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-normal text-brand-700 dark:text-brand-300">
                        đang viết
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm muted">{c.description}</p>
                  <p className="mt-4 text-xs muted">
                    {c.docCount} bài · {c.sections.length} phần
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {collections.length === 0 && (
            <p className="mt-10 text-center muted">
              Chưa có bộ nội dung nào. Tạo một thư mục trong <code>content/</code> để bắt đầu.
            </p>
          )}
        </section>
      </main>
    </>
  )
}
