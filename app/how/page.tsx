import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'
import { byId, scholarOther, SITE } from '@/lib/papers'

const paper = byId('how')!

export const metadata: Metadata = {
  title: 'Twisted Dynamics on the Klein Block',
  description:
    'A conditional framework for kinematic descent, nodal defect structure and anomaly constraints on the Klein Block.',
  alternates: { canonical: '/how/' },
  openGraph: {
    title: 'Twisted Dynamics on the Klein Block',
    description:
      'A conditional framework for kinematic descent, nodal defect structure and anomaly constraints on the Klein Block.',
    url: '/how/',
    type: 'article',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twisted Dynamics on the Klein Block',
    description:
      'A conditional framework for kinematic descent, nodal defect structure and anomaly constraints on the Klein Block.',
    images: ['/assets/og-card.png'],
  },
  other: scholarOther(paper),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd('how')) }}
      />
      <Reader id="how" />
    </>
  )
}
