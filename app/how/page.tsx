import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'

export const metadata: Metadata = {
  title: 'Twisted Dynamics on the Klein Block',
  description:
    'A conditional framework for kinematic descent, nodal defect structure and anomaly constraints on the Klein Block.',
  alternates: { canonical: '/how' },
  openGraph: { title: 'Twisted Dynamics on the Klein Block', description: 'A conditional framework for kinematic descent, nodal defect structure and anomaly constraints on the Klein Block.', url: '/how', type: 'article' },
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
