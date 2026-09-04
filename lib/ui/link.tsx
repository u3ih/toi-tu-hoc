import NextLink from 'next/link'
import type { ComponentProps } from 'react'

type NextLinkProps = ComponentProps<typeof NextLink>

export type LinkProps = Omit<ComponentProps<'a'>, 'href'> &
  Pick<NextLinkProps, 'prefetch' | 'replace' | 'scroll'> & {
    href: string
    /**
     * Force the external treatment on a link this cannot recognise — a URL
     * built at runtime, say. Pass `false` to keep client routing on a URL that
     * looks absolute but points back at this site.
     */
    external?: boolean
  }

/** `https://`, `//cdn…`, and the non-web schemes worth linking to. */
const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i
const OTHER_SCHEME = /^(?:mailto|tel|sms):/i

export function isExternalHref(href: string): boolean {
  return ABSOLUTE.test(href) || OTHER_SCHEME.test(href)
}

/**
 * The one link component.
 *
 * Three kinds of href need three different elements, and getting that wrong is
 * either a broken link or a security hole:
 *
 * - external → a plain anchor, opened in a new tab with `noreferrer noopener`,
 *   because `next/link` would try to client-route to another origin
 * - `#section` → a plain anchor, so the browser's own fragment handling and the
 *   `scroll-padding-top` in globals.css apply
 * - everything else → `next/link`, for prefetch and client navigation
 *
 * That branching used to live inline in `components/mdx.tsx`, twice. Every
 * caller now gets it for free, and a future change — a tracking hook, an
 * external-link icon, a locale prefix — has one place to land.
 *
 * Deliberately not a client component: it renders in server components too.
 */
export function Link({ href, external, prefetch, replace, scroll, ...anchor }: LinkProps) {
  if (external ?? isExternalHref(href)) {
    // Spread last so a caller can override either attribute on purpose.
    return <a href={href} target="_blank" rel="noreferrer noopener" {...anchor} />
  }

  if (href.startsWith('#')) return <a href={href} {...anchor} />

  return <NextLink href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...anchor} />
}
