import { localeFrom } from '@/lib/route'
import { HomePage } from '@/components/pages/home'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <HomePage locale={await localeFrom(params)} />
}
