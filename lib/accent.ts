import type { CSSProperties } from 'react'

/**
 * Per-collection brand palettes, generated instead of authored.
 *
 * The lightness and chroma curves below are fixed — they are what makes every
 * collection's ramp feel like it came off the same press — so a palette is just
 * a hue, and the site can carry as many collections as it likes. `hueEnd` lets a
 * ramp drift as it darkens (mustard settling into burnt orange, for instance),
 * which is the one thing a single hue cannot express.
 */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

/** Fixed tone curve, shared by every palette. */
const LIGHTNESS = [0.95, 0.9, 0.82, 0.72, 0.62, 0.53, 0.46, 0.39, 0.32, 0.26]

/** Chroma peaks mid-ramp and falls off at both ends, like offset ink on paper. */
const CHROMA = [0.03, 0.055, 0.09, 0.12, 0.145, 0.155, 0.15, 0.125, 0.095, 0.07]

export type Palette = {
  /** Hue at the lightest step, in oklch degrees. */
  hue: number
  /** Hue at the darkest step; equal to `hue` for a ramp that does not drift. */
  hueEnd: number
  /** Multiplier on the chroma curve. Below 1 reads dustier, more printed. */
  chroma: number
}

/**
 * Named palettes, kept as aliases so existing manifests keep working and authors
 * have a shortlist that is known to sit well together. A collection can also set
 * `hue` directly and skip the list entirely.
 */
export const ACCENT_PALETTES = {
  indigo: { hue: 268, hueEnd: 269, chroma: 1 },
  violet: { hue: 305, hueEnd: 307, chroma: 0.92 },
  sky: { hue: 232, hueEnd: 242, chroma: 0.9 },
  teal: { hue: 195, hueEnd: 205, chroma: 0.8 },
  emerald: { hue: 150, hueEnd: 154, chroma: 0.75 },
  lime: { hue: 128, hueEnd: 136, chroma: 0.72 },
  amber: { hue: 82, hueEnd: 45, chroma: 0.9 },
  clay: { hue: 62, hueEnd: 38, chroma: 0.78 },
  rose: { hue: 30, hueEnd: 20, chroma: 0.95 },
  plum: { hue: 350, hueEnd: 342, chroma: 0.85 },
} as const satisfies Record<string, Palette>

export type Accent = keyof typeof ACCENT_PALETTES

export const ACCENTS = Object.keys(ACCENT_PALETTES) as Accent[]

export const DEFAULT_ACCENT: Accent = 'indigo'

export function isAccent(value: unknown): value is Accent {
  return typeof value === 'string' && value in ACCENT_PALETTES
}

/** Wrap a hue into [0, 360) so `hue: -20` and `hue: 340` mean the same thing. */
function wrap(hue: number): number {
  return ((hue % 360) + 360) % 360
}

/**
 * Resolve a manifest's colour fields into a palette. An explicit `hue` wins over
 * a named accent, so a new collection can pick an unused hue without touching
 * this file.
 */
export function resolvePalette(manifest: {
  accent?: unknown
  hue?: unknown
  hueEnd?: unknown
  chroma?: unknown
}): Palette {
  const named = isAccent(manifest.accent)
    ? ACCENT_PALETTES[manifest.accent]
    : ACCENT_PALETTES[DEFAULT_ACCENT]

  const hue = typeof manifest.hue === 'number' ? wrap(manifest.hue) : named.hue
  const hueEnd =
    typeof manifest.hueEnd === 'number'
      ? wrap(manifest.hueEnd)
      : typeof manifest.hue === 'number'
        ? hue
        : named.hueEnd
  const chroma = typeof manifest.chroma === 'number' ? manifest.chroma : named.chroma

  return { hue, hueEnd, chroma }
}

/**
 * The `--color-brand-*` overrides for one palette, as an inline style.
 *
 * Tailwind's `brand-*` utilities compile to `var(--color-brand-…)`, so setting
 * these on any ancestor re-themes everything below it — the same mechanism the
 * old hand-written `[data-accent]` blocks used, minus the hand-writing.
 */
export function paletteVars(palette: Palette): CSSProperties {
  const vars: Record<string, string> = {}

  STEPS.forEach((step, i) => {
    const ratio = i / (STEPS.length - 1)
    const hue = palette.hue + shortestDelta(palette.hue, palette.hueEnd) * ratio
    const chroma = +(CHROMA[i] * palette.chroma).toFixed(4)
    vars[`--color-brand-${step}`] = `oklch(${LIGHTNESS[i]} ${chroma} ${+wrap(hue).toFixed(1)})`
  })

  return vars as CSSProperties
}

/** Travel the short way round the colour wheel, so 350 → 10 is +20, not -340. */
function shortestDelta(from: number, to: number): number {
  const delta = (to - from + 540) % 360 - 180
  return delta
}

/* --- sRGB conversion ------------------------------------------------------ */

/**
 * oklch → `#rrggbb`.
 *
 * The site itself never needs this — browsers read oklch directly. Generated
 * social images do: they are rendered by satori, which understands neither
 * oklch nor CSS variables, so the same palette has to be handed over as hex.
 */
export function oklchToHex(lightness: number, chroma: number, hueDeg: number): string {
  const hue = (hueDeg * Math.PI) / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  // Oklab → LMS (cube roots), then LMS → linear sRGB.
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]

  return (
    '#' +
    linear
      .map((channel) => {
        // sRGB transfer function, then clamp — out-of-gamut colours clip rather
        // than wrap, which is what a viewer would expect from a flat swatch.
        const encoded =
          channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
        const byte = Math.round(Math.min(1, Math.max(0, encoded)) * 255)
        return byte.toString(16).padStart(2, '0')
      })
      .join('')
  )
}

/** One step of a palette, as hex. `step` is a Tailwind shade number. */
export function paletteHex(palette: Palette, step: (typeof STEPS)[number]): string {
  const i = STEPS.indexOf(step)
  const ratio = i / (STEPS.length - 1)
  const hue = palette.hue + shortestDelta(palette.hue, palette.hueEnd) * ratio
  return oklchToHex(LIGHTNESS[i], CHROMA[i] * palette.chroma, wrap(hue))
}
