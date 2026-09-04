import Script from 'next/script'
import { GTM_ID, gtmEnabled } from '@/lib/gtm'

/**
 * The Google Tag Manager container.
 *
 * Renders nothing when `NEXT_PUBLIC_GTM_ID` is unset, so a fork or a local dev
 * server ships no tracker and no third-party request. Both halves of GTM's
 * snippet live here: `next/script` injects the loader itself, so this sits in
 * the body next to the `<noscript>` fallback rather than being split across
 * `<head>` and `<body>` the way a hand-pasted snippet is.
 *
 * `afterInteractive` is deliberate. GTM is measurement, not content — loading
 * it before hydration would put a blocking third-party request in front of the
 * first paint of a site whose whole point is reading.
 */
export function GoogleTagManager() {
  if (!gtmEnabled) return null

  return (
    <>
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* The reader without JavaScript gets counted too, and this is the only
          way GTM offers to do it. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  )
}
