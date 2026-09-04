import { ImageResponse } from 'next/og'
import { oklchToHex, paletteHex, type Palette } from './accent'
import { LOCALE_META, t, type Locale } from './i18n'
import { getSite } from './site'

/**
 * Generated social cards.
 *
 * Every page declares `summary_large_image`, so without these the site hands
 * every share — every Slack paste, every Facebook post — a blank rectangle.
 * They are rendered at build time into the static export, one PNG per page.
 *
 * satori, which does the rendering, understands neither oklch nor CSS variables,
 * so the palette is converted to hex here rather than reused from globals.css.
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** The light theme, flattened. Kept next to the values in app/globals.css. */
const INK = oklchToHex(0.26, 0.05, 258)
const INK_MUTED = oklchToHex(0.47, 0.04, 258)
const PAPER = oklchToHex(0.955, 0.028, 88)
const MUSTARD = oklchToHex(0.83, 0.155, 86)

/**
 * The display face, fetched once per build.
 *
 * Google's CSS endpoint serves woff2 to modern clients and TrueType to old ones,
 * and satori can only parse the latter — hence the ancient user agent. A build
 * without network access still succeeds: the card falls back to the font bundled
 * with next/og, which covers Vietnamese too.
 */
const LEGACY_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30'

let fontPromise: Promise<ArrayBuffer | null> | null = null

function loadDisplayFont(): Promise<ArrayBuffer | null> {
  fontPromise ??= (async () => {
    try {
      const css = await fetch(
        'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap',
        { headers: { 'User-Agent': LEGACY_UA } },
      ).then((r) => r.text())

      const url = /src:\s*url\((https:[^)]+)\)/.exec(css)?.[1]
      if (!url) return null

      return await fetch(url).then((r) => r.arrayBuffer())
    } catch {
      return null
    }
  })()

  return fontPromise
}

/**
 * Emoji are dropped rather than drawn.
 *
 * satori fetches an SVG per emoji from a CDN, and unlike the font that fetch has
 * no fallback — an offline build would fail rather than degrade. Card text comes
 * from message catalogs and titles that do contain emoji, so strip them here.
 */
function stripEmoji(text: string): string {
  // Alternation rather than one character class: a class cannot express an
  // emoji plus its skin-tone modifier as a single match.
  return text
    .replace(
      /\p{Extended_Pictographic}(\u{FE0F}|[\u{1F3FB}-\u{1F3FF}])?(\u{200D}\p{Extended_Pictographic}(\u{FE0F}|[\u{1F3FB}-\u{1F3FF}])?)*/gu,
      '',
    )
    .replace(/\s+/g, ' ')
    .replace(/^[\s·-]+|[\s·-]+$/g, '')
}

/** The barber-pole rule, drawn as blocks because satori has no gradients. */
const STRIPES = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

/** Long titles get smaller type rather than a clipped third line. */
function titleSize(title: string): number {
  if (title.length > 70) return 46
  if (title.length > 45) return 56
  return 68
}

export type OgCard = {
  locale: Locale
  /** Small uppercase line above the title: the site, then where the page sits. */
  eyebrow: string
  title: string
  description?: string
  /** Bottom-right metadata — reading time, article count, whatever the page has. */
  meta?: string
  /** The collection's colour, so a share card is recognisably from that topic. */
  palette?: Palette
}

export async function ogImage({
  locale,
  eyebrow,
  title,
  description,
  meta,
  palette,
}: OgCard): Promise<ImageResponse> {
  const font = await loadDisplayFont()
  const [safeEyebrow, safeTitle, safeMeta] = [eyebrow, title, meta ?? ''].map(stripEmoji)
  const brand = palette ? paletteHex(palette, 500) : oklchToHex(0.53, 0.16, 259)
  const site = getSite(locale)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: PAPER,
        color: INK,
        fontFamily: font ? 'Display' : 'sans-serif',
        position: 'relative',
      }}
      lang={LOCALE_META[locale].htmlLang}
    >
      {/* Spine in the collection's colour — the one part that changes per topic. */}
      <div style={{ width: 28, height: '100%', background: brand, display: 'flex' }} />

      {/* Printed swatch cresting the top-right corner. */}
      <div
        style={{
          position: 'absolute',
          top: -110,
          right: -110,
          width: 300,
          height: 300,
          background: MUSTARD,
          border: `4px solid ${INK}`,
          transform: 'rotate(45deg)',
          display: 'flex',
        }}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 72px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: INK_MUTED,
              maxWidth: 820,
            }}
          >
            {safeEyebrow}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: titleSize(safeTitle),
              lineHeight: 1.12,
              maxWidth: 900,
            }}
          >
            {safeTitle}
          </div>

          {description && (
            <div
              style={{
                display: 'flex',
                marginTop: 26,
                fontSize: 28,
                lineHeight: 1.4,
                color: INK_MUTED,
                maxWidth: 860,
              }}
            >
              {description.length > 150 ? `${description.slice(0, 147)}…` : description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STRIPES.map((stripe) => (
                <div
                  key={stripe}
                  style={{ width: 22, height: 12, background: MUSTARD, display: 'flex' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 18, fontSize: 30 }}>{site.name}</div>
          </div>

          {safeMeta && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: INK,
                background: MUSTARD,
                border: `3px solid ${INK}`,
                padding: '8px 16px',
              }}
            >
              {safeMeta}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      ...(font ? { fonts: [{ name: 'Display', data: font, style: 'normal', weight: 400 }] } : {}),
    },
  )
}

/**
 * The site-wide card. The name already sits in the footer of every card, so the
 * title carries the tagline alone rather than repeating it.
 */
export function siteOgImage(locale: Locale) {
  const site = getSite(locale)

  return ogImage({
    locale,
    eyebrow: t(locale, 'home.badge'),
    title: site.tagline,
    description: site.description,
  })
}
