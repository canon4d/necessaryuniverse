import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'
import { byId, scholarOther, SITE } from '@/lib/papers'

const paper = byId('why')!

export const metadata: Metadata = {
  title: 'Shape of Reality',
  description:
    'The philosophical argument from identity, no brute facts and physical actualization to five closure-admissible postulates.',
  alternates: { canonical: '/why/' },
  openGraph: {
    title: 'Shape of Reality',
    description:
      'The philosophical argument from identity, no brute facts and physical actualization to five closure-admissible postulates.',
    url: '/why/',
    type: 'article',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shape of Reality',
    description:
      'The philosophical argument from identity, no brute facts and physical actualization to five closure-admissible postulates.',
    images: ['/assets/og-card.png'],
  },
  other: scholarOther(paper),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd('why')) }}
      />
      <Reader id="why" />
    </>
  )
}
