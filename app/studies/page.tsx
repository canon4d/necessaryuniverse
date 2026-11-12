import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent, readingMinutes } from '@/lib/content'
import { paperHref, SITE, studies } from '@/lib/papers'

const description =
  'Klein Block Studies: papers that take the three-paper series as given and carry one consequence further. Studies I forces a conformal nodal hypersurface on the Klein Block.'

export const metadata: Metadata = {
  title: 'Studies',
  description,
  alternates: { canonical: '/studies/' },
  openGraph: {
    title: `Studies — ${SITE.name}`,
    description,
    url: '/studies/',
    type: 'website',
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Studies — ${SITE.name}`,
    description,
    images: ['/assets/og-card.png'],
  },
}

export default function StudiesIndex() {
  return (
    <>
      <header className="arg-head shell">
        <p className="pp-head-kicker">Studies</p>
        <h1>Klein Block Studies.</h1>
        <p>
          The three papers are a closed architecture. A study takes that architecture as given and
          carries one consequence further. Each one stands on its own hypotheses.
        </p>
      </header>

      <section className="chain shell" aria-label="Studies">
        {studies.map((p) => {
          const s = getContent(p.id).stats
          return (
            <Link className="doc" href={paperHref(p)} key={p.id} data-tone={p.tone}>
              <div className="doc-rn">
                {p.numeral}
                <small>Study</small>
              </div>
              <div className="doc-main">
                <p className="doc-key">{p.discipline}</p>
                <h2 className="doc-title">{p.title}</h2>
                <p className="doc-sub">{p.subtitle}</p>
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
          )
        })}
      </section>
    </>
  )
}
