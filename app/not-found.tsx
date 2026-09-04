import Link from 'next/link'
import { site } from '@/lib/site'
import { getCollections } from '@/lib/content'
import { Header } from '@/components/header'

export default function NotFound() {
  return (
    <>
      <Header siteName={site.name} collections={getCollections()} />
      <main className="mx-auto grid max-w-xl place-items-center px-6 py-32 text-center">
        <p className="retro-shadow rounded-retro border-2 border-brand-900 bg-accent-400 px-6 py-2 font-display text-6xl text-brand-900">
          404
        </p>
        <h1 className="mt-6 font-display text-2xl">Không tìm thấy trang này</h1>
        <p className="mt-3 muted">Có thể bài viết đã được đổi tên hoặc chưa được viết.</p>
        <Link
          href="/"
          className="retro-lift retro-shadow mt-8 rounded-retro border-2 bg-brand-600 px-5 py-2.5 font-semibold text-white"
        >
          Về trang chủ
        </Link>
      </main>
    </>
  )
}
