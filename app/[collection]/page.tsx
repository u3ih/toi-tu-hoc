import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCollection, getCollections, getFlatNav, getNav } from '@/lib/content'

type Props = { params: Promise<{ collection: string }> }

export function generateStaticParams() {
  return getCollections({ includeHidden: true }).map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params
  const collection = getCollection(slug)
  if (!collection) return {}
  return { title: collection.title, description: collection.description }
}

export default async function CollectionHome({ params }: Props) {
  const { collection: slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const nav = getNav(slug)
  const first = getFlatNav(slug)[0]

  return (
    <main>
      <section className="relative overflow-hidden border-b-2">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="retro-rays animate-float-slow absolute -top-72 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span
            className="retro-shadow mx-auto grid h-16 w-16 place-items-center rounded-retro border-2 border-brand-900 bg-accent-400 text-3xl"
            aria-hidden
          >
            {collection.emoji}
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] text-balance sm:text-5xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg muted text-pretty">{collection.description}</p>

          {first && (
            <Link
              href={first.href}
              className="retro-lift retro-shadow mt-9 inline-block rounded-retro border-2 bg-brand-600 px-6 py-3 font-semibold text-white"
            >
              Bắt đầu: {first.title} →
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {nav.map(({ section, items }) => (
            <div key={section.title} className="surface p-6">
              <h2 className="flex items-center gap-2 border-b-2 pb-3 font-display text-base">
                {section.emoji && <span aria-hidden>{section.emoji}</span>}
                {section.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="font-medium decoration-2 underline-offset-4 transition-colors hover:text-brand-600 hover:underline dark:hover:text-accent-400"
                    >
                      {item.title}
                    </Link>
                    {item.description && (
                      <p className="line-clamp-1 text-xs muted">{item.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
