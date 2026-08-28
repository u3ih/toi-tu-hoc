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
      <section className="relative overflow-hidden border-b">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-float-slow absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            {collection.emoji}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg muted text-pretty">{collection.description}</p>

          {first && (
            <Link
              href={first.href}
              className="mt-8 inline-block rounded-xl bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
            >
              Bắt đầu: {first.title}
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {nav.map(({ section, items }) => (
            <div key={section.title} className="surface rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                {section.emoji && <span aria-hidden>{section.emoji}</span>}
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
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
