import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getDoc, getSlugs } from '@/lib/content'
import { flatNav } from '@/lib/nav'
import { mdxComponents } from '@/components/mdx'
import { Sidebar } from '@/components/sidebar'
import { Toc } from '@/components/toc'
import { Pager } from '@/components/pager'
import { ReadingProgress } from '@/components/progress-bar'

type Props = { params: Promise<{ slug?: string[] }> }

const DEFAULT_SLUG = flatNav[0]?.slug ?? 'gioi-thieu'

export function generateStaticParams() {
  // `/guide/` itself plus one route per MDX file.
  return [{ slug: [] as string[] }, ...getSlugs().map((slug) => ({ slug: [slug] }))]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug?.[0] ?? DEFAULT_SLUG)
  if (!doc) return {}
  return { title: doc.title, description: doc.description }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const doc = getDoc(slug?.[0] ?? DEFAULT_SLUG)
  if (!doc) notFound()

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto flex max-w-[100rem] gap-8 px-4 sm:px-6">
        <Sidebar />

        <main className="min-w-0 flex-1 py-10">
          <article className="mx-auto max-w-3xl">
            <header className="mb-10 border-b pb-8">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {doc.title}
              </h1>
              {doc.description && <p className="mt-3 text-lg muted text-pretty">{doc.description}</p>}
              <p className="mt-4 text-sm muted">⏱ Khoảng {doc.readingTime} phút đọc</p>
            </header>

            <div
              className="prose prose-neutral max-w-none dark:prose-invert
                prose-headings:scroll-mt-24 prose-headings:font-semibold
                prose-h2:mt-12 prose-h2:text-2xl
                prose-h3:mt-8 prose-h3:text-lg
                prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
                dark:prose-a:text-brand-400
                prose-code:rounded prose-code:bg-brand-500/10 prose-code:px-1.5 prose-code:py-0.5
                prose-code:before:content-none prose-code:after:content-none
                prose-blockquote:border-l-brand-500 prose-blockquote:not-italic
                prose-img:rounded-xl prose-hr:border-dashed"
            >
              <MDXRemote
                source={doc.body}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>

            <Pager slug={doc.slug} />
          </article>
        </main>

        <Toc headings={doc.headings} />
      </div>
    </>
  )
}
