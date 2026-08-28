import Link from 'next/link'
import { nav } from '@/lib/nav'

const stats = [
  { value: '4', label: 'Nhóm chủ đề' },
  { value: '12', label: 'Bài hướng dẫn' },
  { value: '0đ', label: 'Chi phí' },
]

const pillars = [
  {
    emoji: '🎧',
    title: 'Immersion trước, ngữ pháp sau',
    body: 'Nghe và đọc nội dung thật mỗi ngày. Ngữ pháp học để hiểu, không phải để làm bài tập.',
  },
  {
    emoji: '🃏',
    title: 'Từ vựng bằng Anki',
    body: 'Sentence mining từ nội dung bạn đang xem, lặp lại ngắt quãng thay vì học list 3000 từ.',
  },
  {
    emoji: '📖',
    title: 'Đơn ngữ càng sớm càng tốt',
    body: 'Chuyển sang từ điển Anh–Anh khi đủ nền, để nghĩa của từ gắn với ngữ cảnh chứ không qua tiếng Việt.',
  },
  {
    emoji: '🗣️',
    title: 'Output khi đã đủ input',
    body: 'Nói và viết là kết quả của lượng input tích lũy, ép output quá sớm chỉ tạo thói quen sai.',
  },
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-float-slow absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="animate-float-slow absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl [animation-delay:3s]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Miễn phí · Cập nhật liên tục
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Tự học Tiếng Anh
            <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
              {' '}
              đến trình độ dùng được
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg muted text-pretty">
            Không phải khoá học, không phải mẹo thi. Đây là lộ trình dựa trên immersion — thứ đã đưa
            rất nhiều người từ mất gốc đến đọc sách, xem phim và nói chuyện thoải mái.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/guide/gioi-thieu/"
              className="rounded-xl bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
            >
              Bắt đầu từ đây
            </Link>
            <Link
              href="/guide/30-ngay-tieng-anh/"
              className="surface rounded-xl px-6 py-3 font-medium transition-colors hover:border-brand-500"
            >
              Lộ trình 30 ngày
            </Link>
          </div>

          <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="surface rounded-xl py-4">
                <dt className="text-2xl font-bold text-brand-600 dark:text-brand-400">{s.value}</dt>
                <dd className="text-xs muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Bốn nguyên tắc cốt lõi</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="surface rounded-2xl p-6 transition-colors hover:border-brand-500"
            >
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full index */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Toàn bộ nội dung</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {nav.map((section) => (
            <div key={section.title} className="surface rounded-2xl p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <span aria-hidden>{section.emoji}</span>
                {section.title}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {section.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/guide/${item.slug}/`}
                      className="muted transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
