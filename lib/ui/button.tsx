import type { ComponentProps, ReactNode } from 'react'

export type ButtonVariant = 'control' | 'chip' | 'row' | 'bar' | 'text'
export type ButtonSize = 'icon' | 'sm' | 'md' | 'none'

/**
 * Content comes in one of two shapes, and the union is the point: a button
 * either declares its name in `label`, or renders visible text as `children`.
 * There is no third form, so "button with only an icon and no name" — the thing
 * Lighthouse flagged in the header — does not type-check.
 */
type ButtonContent =
  | {
      /**
       * The accessible name, and the visible text unless `text` overrides it.
       * Mirrored into `aria-label` whenever `textHidden` hides that text, so the
       * name survives a breakpoint that the label does not.
       */
      label: string
      /** Visible text, when it should differ from the accessible name. */
      text?: ReactNode
      /**
       * `true` for a permanently icon-only control, `'sm'` for one that is
       * icon-only on a phone and labelled from `sm` up.
       */
      textHidden?: boolean | 'sm'
      /** Extra classes for the text span — a width clamp, mostly. */
      textClassName?: string
      children?: never
    }
  | {
      /** Self-labelling content, for a button whose body is already prose. */
      children: ReactNode
      label?: never
      text?: never
      textHidden?: never
      textClassName?: never
    }

export type ButtonProps = Omit<ComponentProps<'button'>, 'aria-label' | 'children'> &
  ButtonContent & {
    /** Leading glyph. Wrapped in `aria-hidden`, so it never doubles the name. */
    icon?: ReactNode
    /** Trailing content — a chevron, a `⌘K` hint. Rendered as given. */
    trailing?: ReactNode
    variant?: ButtonVariant
    /** Height and padding for the `control` variant; the others carry their own. */
    size?: ButtonSize
    /** Pressed/selected styling. Callers still own `aria-pressed`/`aria-expanded`. */
    active?: boolean
  }

/**
 * The one button component.
 *
 * The retro control — 2px border, hard 2px shadow, accent on hover — was copied
 * into eleven files with eleven slightly different class strings, and the two
 * that dropped their label below `sm` also dropped their accessible name. Both
 * concerns live here now: the shapes this site actually uses, and the rule that
 * a control always has a name whether or not it shows one.
 *
 * The five variants are the five shapes already in the design, not a
 * speculative set:
 *
 * - `control` — the bordered header/CTA button, in three `size`s
 * - `chip` — the round scope filter in search
 * - `row` — a full-width result row, borderless until it is the cursor
 * - `bar` — the borderless full-width strip the mobile TOC opens from
 * - `text` — an underlined text button, for destructive confirmations
 *
 * The tables below are shaped like a `cva` config on purpose — `base`,
 * per-variant classes, and an `active`×`variant` compound. If this ever needs
 * more combinations than a `Record` reads well for, `cva` drops straight in.
 * It is not a dependency yet because `cva` alone would not solve the one real
 * footgun here, which is the `className` merge below.
 *
 * Anchors are out of scope. A link that navigates is a `Link` even when it is
 * styled like a button, and `tag-pill.tsx` stays its own thing.
 *
 * `className` merges last but Tailwind resolves conflicts by stylesheet order,
 * not string order — so pass classes the variant and size do not already set (a
 * width, a `lg:hidden`, an override at a breakpoint they leave alone).
 */
const BASE =
  'inline-flex transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60'

const VARIANTS: Record<ButtonVariant, string> = {
  control: 'items-center rounded-retro border-2',
  chip: 'items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs',
  row: 'w-full flex-col items-start rounded-retro border-2 px-3 py-2.5 text-left',
  bar: 'w-full items-center gap-2 min-h-11 px-4 py-2.5 text-left sm:px-6',
  text: 'items-center underline decoration-2 underline-offset-4',
}

/** Idle and active are mutually exclusive, so no two `box-shadow` (or border,
 *  or background) utilities from this file ever apply to the same element. */
const STATES: Record<ButtonVariant, { idle: string; active: string }> = {
  control: {
    idle: 'retro-shadow-sm hover:bg-accent-400 hover:text-brand-900',
    active: 'retro-shadow border-brand-900 bg-accent-400 font-semibold text-brand-900',
  },
  chip: {
    idle: 'border-transparent muted hover:border-[var(--border)] hover:bg-brand-500/10',
    active: 'border-brand-900 bg-accent-400 font-semibold text-brand-900',
  },
  row: {
    idle: 'border-transparent',
    active: 'border-[var(--border)] bg-accent-400/30',
  },
  bar: { idle: '', active: '' },
  text: { idle: 'hover:text-brand-600 dark:hover:text-accent-400', active: '' },
}

const SIZES: Record<ButtonSize, string> = {
  icon: 'h-10 w-10 justify-center sm:h-9 sm:w-9',
  sm: 'h-10 gap-1.5 px-2.5 text-sm sm:h-9',
  md: 'min-h-11 gap-2 px-4 py-2 text-sm font-semibold',
  none: '',
}

/** Only `control` is sized from outside; the rest carry their own padding. */
const DEFAULT_SIZE: Record<ButtonVariant, ButtonSize> = {
  control: 'sm',
  chip: 'none',
  row: 'none',
  bar: 'none',
  text: 'none',
}

export function Button({
  variant = 'control',
  size,
  active = false,
  icon,
  trailing,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  // The content union is enforced at the call site; widening it here keeps one
  // render path instead of two near-identical ones.
  const {
    label,
    text,
    textHidden = false,
    textClassName,
    children,
    ...attrs
  } = rest as {
    label?: string
    text?: ReactNode
    textHidden?: boolean | 'sm'
    textClassName?: string
    children?: ReactNode
  } & ComponentProps<'button'>

  return (
    <button
      type={type}
      aria-label={textHidden && label ? label : undefined}
      className={[
        BASE,
        VARIANTS[variant],
        SIZES[size ?? DEFAULT_SIZE[variant]],
        active ? STATES[variant].active : STATES[variant].idle,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...attrs}
    >
      {icon != null && (
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {icon}
        </span>
      )}
      {children ??
        (textHidden !== true && (
          <span
            className={[textHidden === 'sm' ? 'hidden sm:inline' : '', textClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {text ?? label}
          </span>
        ))}
      {trailing}
    </button>
  )
}
