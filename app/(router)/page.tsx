import type { Metadata } from 'next'
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, path } from '@/lib/i18n'
import { alternatesFor, siteUrl } from '@/lib/metadata'
import { getSite } from '@/lib/site'

const home = path(DEFAULT_LOCALE)

/**
 * `/` canonicalises to the default locale's home rather than competing with it,
 * and lists every language so a crawler — and a reader without JavaScript —
 * reaches all of them from here.
 *
 * Deliberately not `noindex`: Google's own guidance is that a noindex on a page
 * carrying a canonical can propagate to the canonical target, which here would
 * mean deindexing the home page. The redirect and the canonical are enough.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl('/')),
  title: getSite(DEFAULT_LOCALE).name,
  description: getSite(DEFAULT_LOCALE).description,
  alternates: { ...alternatesFor(DEFAULT_LOCALE, '/'), canonical: siteUrl(home) },
}

export default function Page() {
  const site = getSite(DEFAULT_LOCALE)

  return (
    <>
      {/* An instant meta refresh is the only redirect a static host can serve,
          and search engines treat it as equivalent to a 301. */}
      <meta httpEquiv="refresh" content={`0; url=${home}`} />

      {/* Before that fires, send the reader to whichever language they actually
          read, remembering the choice for next time. */}
      {/* A static script with no user input, and the only way to redirect before
          paint on a host that cannot serve a 302. */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static redirect script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var known = ${JSON.stringify(LOCALES)};
  var target = null;
  try { var saved = localStorage.getItem('locale'); if (known.indexOf(saved) > -1) target = saved; } catch (e) {}
  if (!target) {
    var wanted = (navigator.languages || [navigator.language || '']).map(function (tag) { return String(tag).toLowerCase().split('-')[0]; });
    for (var i = 0; i < wanted.length && !target; i++) if (known.indexOf(wanted[i]) > -1) target = wanted[i];
  }
  location.replace('/' + (target || ${JSON.stringify(DEFAULT_LOCALE)}) + '/');
})();`,
        }}
      />

      <main className="mx-auto grid min-h-dvh max-w-md place-content-center gap-6 px-6 text-center">
        <h1 className="text-2xl font-semibold">{site.name}</h1>
        <ul className="grid gap-3">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a href={path(locale)} hrefLang={LOCALE_META[locale].htmlLang} className="underline">
                {LOCALE_META[locale].label}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
