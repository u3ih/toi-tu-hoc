/** Injects a JSON-LD graph. `<` is escaped so the payload cannot close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // A JSON-LD payload is data, not JSX, and the escape below is what makes it safe.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: escaped JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
