/**
 * Google Tag Manager wiring.
 *
 * The container id is a build-time env var rather than a value in `lib/site.ts`
 * because it is per-deployment, not per-site: a fork, a preview build and a
 * local `pnpm dev` should not report into the production container. Leave
 * `NEXT_PUBLIC_GTM_ID` unset and no tag ships at all — no script tag, no
 * `dataLayer`, no third-party request. That is the default everywhere except
 * the deploy workflow.
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''

/** A container id looks like `GTM-XXXXXXX`; anything else is a typo, not a config. */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/

/**
 * Whether to emit the container.
 *
 * Validating the shape here means a mistyped id fails loudly at build time
 * (see the check below) instead of shipping a script tag that 404s on every
 * page view for months without anyone noticing.
 */
export const gtmEnabled = GTM_ID !== ''

if (gtmEnabled && !GTM_ID_PATTERN.test(GTM_ID)) {
  throw new Error(
    `NEXT_PUBLIC_GTM_ID is "${GTM_ID}", which is not a GTM container id (expected GTM-XXXXXXX).`,
  )
}

/** The window fields GTM owns, typed so pushes do not need a cast. */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Push one event onto the data layer.
 *
 * Creates the array if the container script has not finished loading — that is
 * exactly what GTM's own snippet does, and it is what makes an event fired
 * during hydration survive until the tag is ready to consume it.
 */
export function pushEvent(event: Record<string, unknown>) {
  if (!gtmEnabled || typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(event)
}
