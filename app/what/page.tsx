import type { Metadata } from 'next'
import Reader, { jsonLd } from '@/components/Reader'

export const metadata: Metadata = {
  title: 'The Klein Block',
  description:
    'A classification theorem: exactly one non-orientable smooth S-cubed bundle over the circle satisfies the five postulates.',
  alternates: { canonical: '/what' },
  openGraph: { title: 'The Klein Block', description: 'A classification theorem: exactly one non-orientable smooth S-cubed bundle over the circle satisfies the five postulates.', url: '/what', type: 'article' },
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
