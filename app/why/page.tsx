import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'

export const metadata: Metadata = {
  title: 'Shape of Reality',
  description:
    'The philosophical argument from identity, no brute facts and physical actualization to five closure-admissible postulates.',
  alternates: { canonical: '/why' },
  openGraph: { title: 'Shape of Reality', description: 'The philosophical argument from identity, no brute facts and physical actualization to five closure-admissible postulates.', url: '/why', type: 'article' },
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
