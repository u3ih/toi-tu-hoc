import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { slugify } from '@/lib/content'

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
  tip: { label: 'Mẹo', icon: '💡', ring: 'bg-[oklch(0.56_0.115_154)]/12' },
  warning: { label: 'Lưu ý', icon: '⚠️', ring: 'bg-accent-400/25' },
  danger: { label: 'Cẩn thận', icon: '🛑', ring: 'bg-[oklch(0.56_0.15_21)]/15' },
  info: { label: 'Thông tin', icon: 'ℹ️', ring: 'bg-brand-500/12' },
  story: { label: 'Chuyện của mình', icon: '📖', ring: 'bg-brand-500/12' },
} as const

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: keyof typeof CALLOUTS
  title?: string
  children: ReactNode
}) {
  const style = CALLOUTS[type] ?? CALLOUTS.info

  // Personal asides read as a quiet aside rather than a boxed warning.
  if (type === 'story') {
    return (
      <aside className="my-7 border-l-4 border-accent-500 bg-accent-400/10 py-2 pl-5">
        <p className="mb-1 flex items-center gap-2 label-retro not-prose muted">
          <span aria-hidden>{style.icon}</span>
          {title ?? style.label}
        </p>
        <div className="[&>:last-child]:mb-0 [&>p]:my-1.5">{children}</div>
      </aside>
    )
  }

  return (
    <div className={`retro-shadow my-6 rounded-retro border-2 p-4 ${style.ring}`}>
      <p className="mb-1 flex items-center gap-2 font-display text-sm not-prose">
        <span aria-hidden>{style.icon}</span>
        {title ?? style.label}
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
  children,
}: {
  title: string
  href?: string
  emoji?: string
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

  return href ? (
    <Link href={href} className="surface retro-lift p-4">
      {inner}
    </Link>
  ) : (
    <div className="surface p-4">{inner}</div>
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
          <span
            aria-hidden
            className="ml-2 opacity-0 transition-opacity group-hover:opacity-40"
          >
            #
          </span>
        </a>
      </Tag>
    )
  }
}

export const mdxComponents: MDXComponents = {
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  a: ({ href = '', children, ...props }: ComponentProps<'a'>) => {
    const external = /^https?:\/\//.test(href)
    return external ? (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    ) : (
      <Link href={href}>{children}</Link>
    )
  },
  table: (props: ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto rounded-retro border-2">
      <table {...props} className="my-0" />
    </div>
  ),
  Callout,
  Cards,
  Card,
  Steps,
}
