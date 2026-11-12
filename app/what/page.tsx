import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'
import { byId, scholarOther, SITE } from '@/lib/papers'

const paper = byId('what')!

export const metadata: Metadata = {
  title: 'The Klein Block',
  description:
    'A classification theorem: exactly one non-orientable smooth S-cubed bundle over the circle satisfies the five postulates.',
  alternates: { canonical: '/what/' },
  openGraph: {
    title: 'The Klein Block',
    description:
      'A classification theorem: exactly one non-orientable smooth S-cubed bundle over the circle satisfies the five postulates.',
    url: '/what/',
    type: 'article',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Klein Block',
    description:
      'A classification theorem: exactly one non-orientable smooth S-cubed bundle over the circle satisfies the five postulates.',
    images: ['/assets/og-card.png'],
  },
  other: scholarOther(paper),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd('what')) }}
      />
      <Reader id="what" />
    </>
  )
}
