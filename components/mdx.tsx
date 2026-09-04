import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { slugify } from '@/lib/content'
import { DEFAULT_LOCALE, localePrefix, t, type Locale } from '@/lib/i18n'

function toText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(toText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

const CALLOUTS = {
  tip: { icon: '💡', label: 'callout.tip', ring: 'bg-[oklch(0.56_0.115_154)]/12' },
  warning: { icon: '⚠️', label: 'callout.warning', ring: 'bg-accent-400/25' },
  danger: { icon: '🛑', label: 'callout.danger', ring: 'bg-[oklch(0.56_0.15_21)]/15' },
  info: { icon: 'ℹ️', label: 'callout.info', ring: 'bg-brand-500/12' },
  story: { icon: '📖', label: 'callout.story', ring: 'bg-brand-500/12' },
} as const

type CalloutType = keyof typeof CALLOUTS

export function Callout({
  type = 'info',
  title,
  locale = DEFAULT_LOCALE,
  children,
}: {
  type?: CalloutType
  title?: string
  locale?: Locale
  children: ReactNode
}) {
  const style = CALLOUTS[type] ?? CALLOUTS.info
  const label = title ?? t(locale, style.label)

  // Personal asides read as a quiet aside rather than a boxed warning.
  if (type === 'story') {
    return (
      <aside className="my-7 border-l-4 border-accent-500 bg-accent-400/10 py-2 pl-5">
        <p className="mb-1 flex items-center gap-2 label-retro not-prose muted">
          <span aria-hidden>{style.icon}</span>
          {label}
        </p>
        <div className="[&>:last-child]:mb-0 [&>p]:my-1.5">{children}</div>
      </aside>
    )
  }

  return (
    <div className={`retro-shadow my-6 rounded-retro border-2 p-4 ${style.ring}`}>
      <p className="mb-1 flex items-center gap-2 font-display text-sm not-prose">
        <span aria-hidden>{style.icon}</span>
        {label}
      </p>
      <div className="[&>:last-child]:mb-0 [&>p]:my-1.5">{children}</div>
    </div>
  )
}

/** Wraps an ordered sequence of `###` steps in a vertical rail. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 border-l-4 border-brand-500/50 pl-6 [&>h3:first-child]:mt-0">{children}</div>
  )
}

export function Cards({ children }: { children: ReactNode }) {
  return <div className="my-6 grid gap-4 not-prose sm:grid-cols-2">{children}</div>
}

export function Card({
  title,
  href,
  emoji,
  locale = DEFAULT_LOCALE,
  children,
}: {
  title: string
  href?: string
  emoji?: string
  locale?: Locale
  children?: ReactNode
}) {
  const inner = (
    <>
      <p className="flex items-center gap-2 font-display text-sm">
        {emoji && <span aria-hidden>{emoji}</span>}
        {title}
      </p>
      {children && <p className="mt-1 text-sm muted">{children}</p>}
    </>
  )

  if (!href) return <div className="surface p-4">{inner}</div>

  return /^https?:\/\//.test(href) ? (
    <a href={href} target="_blank" rel="noreferrer noopener" className="surface retro-lift p-4">
      {inner}
    </a>
  ) : (
    <Link href={`${localePrefix(locale)}${href}`} className="surface retro-lift p-4">
      {inner}
    </Link>
  )
}

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const
  return function Heading({ children, ...props }: ComponentProps<'h2'>) {
    const id = slugify(toText(children))
    return (
      <Tag id={id} {...props} className="group scroll-mt-24">
        <a href={`#${id}`} className="text-inherit no-underline hover:no-underline">
          {children}
          <span aria-hidden className="ml-2 opacity-0 transition-opacity group-hover:opacity-40">
            #
          </span>
        </a>
      </Tag>
    )
  }
}

/**
 * MDX authors write locale-independent links (`/english/reading/`), the same keys
 * the route tree uses. The prefix for the current locale is added here so a
 * translated page never leaks back into the default locale.
 *
 * `textLocale` differs from `locale` on an untranslated page: the prose is still
 * in the default locale, so component labels should match it, while links must
 * keep the reader inside the locale they are browsing.
 */
export function mdxComponents(locale: Locale, textLocale: Locale = locale): MDXComponents {
  return {
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    a: ({ href = '', children, ...props }: ComponentProps<'a'>) => {
      if (/^https?:\/\//.test(href)) {
        return (
          <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
            {children}
          </a>
        )
      }
      if (href.startsWith('#')) return <a href={href} {...props}>{children}</a>

      return <Link href={`${localePrefix(locale)}${href}`}>{children}</Link>
    },
    table: (props: ComponentProps<'table'>) => (
      <div className="my-6 overflow-x-auto rounded-retro border-2">
        <table {...props} className="my-0" />
      </div>
    ),
    Callout: (props: ComponentProps<typeof Callout>) => <Callout locale={textLocale} {...props} />,
    Cards,
    Card: (props: ComponentProps<typeof Card>) => <Card locale={locale} {...props} />,
    Steps,
  }
}
