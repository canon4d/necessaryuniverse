import Link from 'next/link'
import type { Metadata } from 'next'
import { getContent, readingMinutes } from '@/lib/content'
import { papers, SITE } from '@/lib/papers'

export const metadata: Metadata = {
  title: `${SITE.name} — a three-paper series`,
  description: SITE.tagline,
  alternates: { canonical: '/' },
}

const seriesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWorkSeries',
  name: SITE.name,
  description: SITE.tagline,
  url: SITE.origin,
  author: { '@type': 'Person', name: SITE.author },
  hasPart: papers.map((p) => ({
    '@type': 'ScholarlyArticle',
    name: p.title,
    url: `${SITE.origin}/${p.id}`,
    position: p.numeral,
  })),
}

export default function Home() {
  const stats = papers.map((p) => ({ p, s: getContent(p.id).stats }))
  const totalWords = stats.reduce((n, x) => n + x.s.words, 0)
  const totalEq = stats.reduce((n, x) => n + x.s.equations, 0)
  const totalThm = stats.reduce((n, x) => n + x.s.theorems, 0)

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
          Three papers, read in order: an argument from three premises to five postulates, a proof
          that those postulates admit exactly one four-manifold, and an attempt to put physics on it.
        </p>
        <p className="hero-meta">
          <span>{totalWords.toLocaleString()} words</span>
          <span>{totalThm} numbered statements</span>
          <span>{totalEq} numbered equations</span>
          <span>{readingMinutes(totalWords)} minutes end to end</span>
        </p>

      </section>

      <section className="chain shell" aria-label="The three documents">
        {stats.map(({ p, s }) => (
          <Link className="doc" href={`/${p.id}`} key={p.id} data-tone={p.tone}>
            <div className="doc-rn">
              {p.numeral}
              <small>{p.key}</small>
            </div>
            <div className="doc-main">
              <p className="doc-key">{p.discipline}</p>
              <h2 className="doc-title">{p.title}</h2>
              <p className="doc-sub">{p.subtitle}</p>
              <p className="doc-q">{p.question}</p>
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
                  <b>{s.sections}</b> sections
                </span>
                {s.theorems > 0 && (
                  <span>
                    <b>{s.theorems}</b> statements
                  </span>
                )}
                {s.equations > 0 && (
                  <span>
                    <b>{s.equations}</b> equations
                  </span>
                )}
                <span>
                  <b>{s.references}</b> references
                </span>
                <span>
                  <b>{readingMinutes(s.words)}</b> min
                </span>
              </p>
            </div>
          </Link>
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
            and search across all three documents. The PDF and the LaTeX source are one click away on
            every paper.
          </p>
        </div>
        <div className="btn-row">
          {papers.map((p) => (
            <a className="btn" key={p.id} href={p.pdf}>
              {p.title} (PDF)
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
