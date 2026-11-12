import Link from 'next/link'
import type { Metadata } from 'next'
import { getContent, readingMinutes } from '@/lib/content'
import { documents, paperHref, papers, SITE, studies, works, type Paper } from '@/lib/papers'

export const metadata: Metadata = {
  title: `${SITE.name} — a three-paper series and its studies`,
  description: SITE.tagline,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} — a three-paper series and its studies`,
    description: SITE.tagline,
    url: '/',
    type: 'website',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — a three-paper series and its studies`,
    description: SITE.tagline,
    images: ['/assets/og-card.png'],
  },
}

const seriesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWorkSeries',
  name: SITE.name,
  description: SITE.tagline,
  url: `${SITE.origin}/`,
  author: { '@type': 'Person', name: SITE.author },
  hasPart: [
    ...documents.map((p) => ({
      '@type': 'ScholarlyArticle',
      name: p.title,
      url: `${SITE.origin}${paperHref(p)}`,
      position: p.numeral,
    })),
    ...studies.map((p) => ({
      '@type': 'ScholarlyArticle',
      name: p.title,
      url: `${SITE.origin}${paperHref(p)}`,
    })),
  ],
}

function DocCard({ p, stats }: { p: Paper; stats: ReturnType<typeof getContent>['stats'] }) {
  return (
    <Link className="doc" href={paperHref(p)} data-tone={p.tone}>
      <div className="doc-rn">
        {p.numeral}
        <small>{p.kind === 'document' ? p.key : 'Study'}</small>
      </div>
      <div className="doc-main">
        <p className="doc-key">{p.discipline}</p>
        <h2 className="doc-title">{p.title}</h2>
        <p className="doc-sub">{p.subtitle}</p>
        {p.kind === 'document' && <p className="doc-q">{p.question}</p>}
      </div>

      <div className="doc-side">
        <dl className="doc-flow">
          <dt>Takes</dt>
          <dd>{p.takes}</dd>
          <dt>Gives</dt>
          <dd>{p.gives}</dd>
        </dl>

        <p className="doc-figures">
          <span>
            <b>{stats.sections}</b> sections
          </span>
          {stats.theorems > 0 && (
            <span>
              <b>{stats.theorems}</b> statements
            </span>
          )}
          {stats.equations > 0 && (
            <span>
              <b>{stats.equations}</b> equations
            </span>
          )}
          <span>
            <b>{stats.references}</b> references
          </span>
          <span>
            <b>{readingMinutes(stats.words)}</b> min
          </span>
        </p>
      </div>
    </Link>
  )
}

export default function Home() {
  const docStats = papers.map((p) => ({ p, s: getContent(p.id).stats }))
  const studyStats = studies.map((p) => ({ p, s: getContent(p.id).stats }))
  const allStats = works.map((p) => getContent(p.id).stats)
  const totalWords = allStats.reduce((n, s) => n + s.words, 0)
  const totalEq = allStats.reduce((n, s) => n + s.equations, 0)
  const totalThm = allStats.reduce((n, s) => n + s.theorems, 0)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }}
      />

      <section className="hero shell">
        <h1 className="hero-lede">
          Start from <em>A = A</em>. See how little freedom the universe has left.
        </h1>
        <p className="hero-sub">
          A three-paper series and its studies. Read the papers in order: an argument from three
          premises to five postulates, a proof that those postulates admit exactly one four-manifold,
          and an attempt to put physics on it.
        </p>
        <p className="hero-meta">
          <span>{totalWords.toLocaleString()} words</span>
          <span>{totalThm} numbered statements</span>
          <span>{totalEq} numbered equations</span>
          <span>{readingMinutes(totalWords)} minutes end to end</span>
        </p>
        <p className="hero-note">Across the series and its studies.</p>
        <div className="btn-row">
          <Link className="btn btn-solid" href="/argument/">
            The argument in one page
          </Link>
        </div>

      </section>

      <section className="chain shell" aria-label="The three documents">
        {docStats.map(({ p, s }) => (
          <DocCard key={p.id} p={p} stats={s} />
        ))}
      </section>

      <section className="chain shell" aria-label="Studies" style={{ borderTop: 0 }}>
        {studyStats.map(({ p, s }) => (
          <DocCard key={p.id} p={p} stats={s} />
        ))}
      </section>

      <section className="strip shell">
        <h2 className="strip-h">The argument's final shape</h2>
        <div className="grid-2">
          <div className="prose-narrow">
            <p>
              A universe that is finite, has no boundary, is simply connected in space, carries a
              consistent direction of time, and reverses orientation once per circuit. Papers II
              proves that exactly one smooth four-manifold meets all five conditions: the
              non-orientable <strong>S³-bundle over S¹</strong>, called the Klein Block.
            </p>
            <p>
              Uniqueness here is a real theorem, not a slogan. There are exactly two smooth S³-bundles
              over the circle — the product and one orientation-reversing mapping torus — so the
              non-orientability condition picks out one of two, and does so with nothing left over.
            </p>
          </div>
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="claim">
              <h3>Closed time</h3>
              <p>
                The base is a circle, so every transverse timelike flow has a closed orbit. There is
                no global real-valued time function on the block.
              </p>
            </div>
            <div className="claim">
              <h3>No global entropy potential</h3>
              <p>
                A monotone scalar entropy that factors through the temporal base is obstructed. The
                thermodynamic arrow has to be modelled some other way.
              </p>
            </div>
            <div className="claim">
              <h3>Pin structures exist</h3>
              <p>
                The block carries Euclidean Pin⁺ and Pin⁻ structures — but the papers do not select
                between them. That choice is left open on purpose.
              </p>
            </div>
            <div className="claim">
              <h3>Zero total energy</h3>
              <p>
                On compact boundaryless slices the canonical ADM Hamiltonian vanishes weakly. This is
                stated as a conditional result, not a derivation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="strip shell" style={{ borderBottom: 0 }}>
        <h2 className="strip-h">Read it however you prefer</h2>
        <div className="prose-narrow" style={{ maxWidth: '31rem' }}>
          <p>
            Every paper is published here in full: the same sections, the same numbering, the same
            equations as the deposited PDF. The web edition adds contents, cross-reference previews
            and search across the series and its studies. The PDF and the LaTeX source are one click
            away on every paper.
          </p>
        </div>
        <div className="btn-row">
          {works.map((p) => (
            <a className="btn" key={p.id} href={p.pdf}>
              {p.title} (PDF)
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
