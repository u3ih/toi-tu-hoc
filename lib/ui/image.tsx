import NextImage from 'next/image'
import type { ComponentProps } from 'react'

export type ImageProps = ComponentProps<typeof NextImage>

/**
 * The one image component.
 *
 * Wraps `next/image` and pins the two rules that a static export cannot enforce
 * on its own:
 *
 * - `h-auto max-w-full`, so an image wider than the prose column scales down
 *   instead of pushing the page sideways. `next/image` writes intrinsic
 *   `width`/`height` attributes onto the tag, and without this they win.
 * - `alt` stays a required prop, inherited from `next/image`'s own types.
 *
 * Note that `next.config.mjs` sets `images: { unoptimized: true }`, which
 * `output: 'export'` requires — there is no server to resize on request. So
 * this buys layout safety and a single place to change, not resizing. Serve
 * files at roughly the size they are displayed.
 *
 * Nothing renders an image yet; this is here so the first one does not reach
 * for `next/image` directly.
 */
export function Image({ className, ...rest }: ImageProps) {
  return (
    <NextImage className={['h-auto max-w-full', className].filter(Boolean).join(' ')} {...rest} />
  )
}
