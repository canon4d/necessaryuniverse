import type { Metadata } from 'next'
import { isoDuration, podcasts, podcastTitle } from '@/lib/podcasts'
import { SITE } from '@/lib/papers'
import PodcastPlayer from '@/components/PodcastPlayer'

const description =
  'Audio conversations for the Necessary Universe series and its studies: Shape of Reality, The Klein Block, Twisted Dynamics on the Klein Block, and Klein Block Studies I.'

export const metadata: Metadata = {
  title: 'Listen',
  description,
  alternates: { canonical: '/podcasts/' },
  openGraph: {
    title: `Listen — ${SITE.name}`,
    description,
    url: '/podcasts/',
    type: 'website',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Listen — ${SITE.name}`,
    description,
    images: ['/assets/og-card.png'],
  },
}

const podcastJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  name: `${SITE.name} — the podcast`,
  url: `${SITE.origin}/podcasts/`,
  author: { '@type': 'Person', name: SITE.author },
  webFeed: `${SITE.origin}/podcasts/`,
  hasPart: podcasts.map((p) => ({
    '@type': 'PodcastEpisode',
    name: podcastTitle(p),
    description: p.blurb,
    duration: isoDuration(p.duration),
    url: `${SITE.origin}/podcasts/#${p.id}`,
    contentUrl: `${SITE.origin}${p.file}`,
    associatedMedia: { '@type': 'MediaObject', contentUrl: `${SITE.origin}${p.file}` },
    partOfSeries: { '@type': 'PodcastSeries', name: SITE.name },
  })),
}

export default function PodcastsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
      />

      <header className="pp-head shell">
        <p className="pp-head-kicker">The series, audio deep dive</p>
        <h1>Listen to Necessary Universe.</h1>
        <p>
          The three documents, as three conversations, and the studies beside them — one episode each,
          in the order they were written to be read. Play one, pause whenever, pick up any of the others.
          This podcast style audio deep dive is generated with Google NotebookLM.
        </p>
      </header>

      <PodcastPlayer />
    </>
  )
}
