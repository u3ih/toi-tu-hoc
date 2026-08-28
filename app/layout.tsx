import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: {
    default: 'Tôi Tự Học Tiếng Anh',
    template: '%s · Tôi Tự Học Tiếng Anh',
  },
  description:
    'Hướng dẫn tự học Tiếng Anh bằng phương pháp immersion: nghe, đọc, từ vựng, công cụ và lộ trình cụ thể.',
  openGraph: {
    type: 'website',
    siteName: 'Tôi Tự Học Tiếng Anh',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <footer className="border-t py-10 text-center text-sm muted">
            <p>
              Nội dung mở — đóng góp trên{' '}
              <a href="https://github.com" className="underline underline-offset-4 hover:text-brand-600">
                GitHub
              </a>
              .
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
