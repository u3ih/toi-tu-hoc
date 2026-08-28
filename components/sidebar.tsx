'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '@/lib/nav'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-7 text-sm">
      {nav.map((section) => (
        <div key={section.title}>
          <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold tracking-wide uppercase muted">
            <span aria-hidden>{section.emoji}</span>
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const href = item.external ? item.slug : `/guide/${item.slug}/`
              const active = !item.external && pathname === href

              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'block rounded-lg px-3 py-1.5 transition-colors',
                      active
                        ? 'bg-brand-500/12 font-medium text-brand-700 dark:text-brand-300'
                        : 'muted hover:bg-brand-500/8 hover:text-brand-600 dark:hover:text-brand-300',
                    ].join(' ')}
                  >
                    {item.title}
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

export function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
      <SidebarNav />
    </aside>
  )
}
