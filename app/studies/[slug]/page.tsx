import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Reader, { jsonLd } from '@/components/Reader'
import { paperHref, scholarOther, SITE, studies } from '@/lib/papers'

export function generateStaticParams() {
  return studies.map((s) => ({ slug: s.slug }))
}

export const dynamicParams = false

function bySlug(slug: string) {
  return studies.find((s) => s.slug === slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = bySlug(slug)
  if (!p) return {}
  const description = `${p.discipline}. ${p.takes} ${p.gives}`
  return {
    title: p.title,
    description,
    alternates: { canonical: paperHref(p) },
    openGraph: {
      title: p.title,
      description,
      url: paperHref(p),
      type: 'article',
      images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description,
      images: ['/assets/og-card.png'],
    },
    other: scholarOther(p),
  }
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = bySlug(slug)
  if (!p) notFound()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p.id)) }}
      />
      <Reader id={p.id} />
    </>
  )
}
