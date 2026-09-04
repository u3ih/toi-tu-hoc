'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavGroup } from '@/lib/content'
import type { Locale } from '@/lib/i18n'
import { DocCheck } from './progress/doc-check'

export function SidebarNav({
  nav,
  locale,
  onNavigate,
}: {
  nav: NavGroup[]
  locale: Locale
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-7 text-sm">
      {nav.map(({ section, items }) => (
        <div key={section.title}>
          <p className="mb-2.5 flex items-center gap-2 border-b-2 px-3 pb-1.5 label-retro muted">
            {section.emoji && <span aria-hidden>{section.emoji}</span>}
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = pathname === item.href

              return (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'flex items-start gap-2 rounded-retro border-2 px-3 py-1.5 transition-colors',
                      active
                        ? 'retro-shadow-sm border-brand-900 bg-accent-400 font-semibold text-brand-900'
                        : 'border-transparent muted hover:border-[var(--border)] hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-accent-300',
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1">{item.title}</span>
                    <DocCheck locale={locale} collection={item.collection} slug={item.slug} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({ nav, locale }: { nav: NavGroup[]; locale: Locale }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r-2 py-8 pr-4 lg:block">
      <SidebarNav nav={nav} locale={locale} />
    </aside>
  )
}
