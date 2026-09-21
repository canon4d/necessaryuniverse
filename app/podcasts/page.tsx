import type { Metadata } from 'next'
import { podcasts } from '@/lib/podcasts'
import { SITE } from '@/lib/papers'
import PodcastPlayer from '@/components/PodcastPlayer'

export const metadata: Metadata = {
  title: 'Listen',
  description:
    'The three papers of the Necessary Universe series, audio deep dive as podcast episodes: Shape of Reality, The Klein Block, and Twisted Dynamics on the Klein Block.',
  alternates: { canonical: '/podcasts' },
  openGraph: {
    title: `Listen — ${SITE.name}`,
    description: 'The three papers of the Necessary Universe series, audio deep dive as podcast episodes.',
    url: '/podcasts',
    type: 'website',
  },
}

const podcastJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  name: `${SITE.name} — the podcast`,
  url: `${SITE.origin}/podcasts`,
  author: { '@type': 'Person', name: SITE.author },
  webFeed: `${SITE.origin}/podcasts`,
  hasPart: podcasts.map((p) => ({
    '@type': 'PodcastEpisode',
    name: p.title,
    url: `${SITE.origin}/podcasts#${p.id}`,
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
          The same three documents, as three conversations — one per paper, in the order they were
          written to be read. Play one, pause whenever, pick up any of the others.
        </p>
      </header>

      <PodcastPlayer />
    </>
  )
}
