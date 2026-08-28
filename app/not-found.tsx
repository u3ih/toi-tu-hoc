import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-xl place-items-center px-6 py-32 text-center">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang này</h1>
      <p className="mt-2 muted">Có thể bài viết đã được đổi tên hoặc chưa được viết.</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </main>
  )
}
