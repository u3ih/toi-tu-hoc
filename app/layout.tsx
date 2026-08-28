import type { Metadata } from 'next'
import './globals.css'
import { site } from '@/lib/site'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: { type: 'website', siteName: site.name },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
