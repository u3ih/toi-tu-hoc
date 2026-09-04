/**
 * The UI library: presentation primitives with no knowledge of this site's
 * content.
 *
 * Most of these extend a Next.js primitive rather than replace it — `Link` over
 * `next/link`, `Image` over `next/image`. App code imports from here instead of
 * from `next/*` directly, so a cross-cutting change lands in one file rather
 * than in every caller.
 *
 * Components that know about docs, collections or locales belong in
 * `components/`; behaviour with no markup belongs in `lib/hooks/`.
 */
export { Image, type ImageProps } from './image'
export { isExternalHref, Link, type LinkProps } from './link'
export { Overlay } from './overlay'
export { Portal } from './portal'
