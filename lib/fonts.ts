import { Alfa_Slab_One, Be_Vietnam_Pro, Space_Mono } from 'next/font/google'

/**
 * The three faces, self-hosted.
 *
 * `next/font` downloads these at build time and serves them from the same
 * origin as the site, which removes the whole Google Fonts round trip: no
 * `preconnect` to two extra hosts, no render-blocking stylesheet on the
 * critical path, and no third party learning who read what. It also emits
 * `size-adjust` metrics for the fallback face, so the swap no longer reflows
 * the page.
 *
 * The cost is that a cold build needs network access to fonts.googleapis.com.
 * Warm builds hit `.next/cache`.
 *
 * Each face is exposed as a CSS variable rather than a class so `@theme` in
 * globals.css can keep owning the real font stacks — `--font-sans` and friends
 * stay the single place a fallback chain is written down.
 */

export const fontDisplay = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display-face',
})

// Vietnamese is the site's primary language, so the subset is not optional.
export const fontSans = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans-face',
})

export const fontMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-mono-face',
})

/** The variable classes, for the `<html>` element of every root layout. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`
