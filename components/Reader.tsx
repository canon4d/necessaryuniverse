import Link from 'next/link'
import { getContent, readingMinutes } from '@/lib/content'
import { apa, bibtex, byId, neighbours, papers, ris, SITE, type PaperId } from '@/lib/papers'
import { blocks as renderBlocks, inline, type RenderCtx } from '@/components/Nodes'
import Contents from '@/components/Contents'
import CitePanel from '@/components/CitePanel'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function Reader({ id }: { id: PaperId }) {
  const paper = byId(id)!
  const c = getContent(id)
  const ctx: RenderCtx = { previews: c.previews, idFor: (a) => a }

  const { prev, next } = neighbours(id)
  const minutes = readingMinutes(c.stats.words)

  const extras = [
    ...(c.bibliography.length ? [{ href: '#references', label: 'References' }] : []),
    { href: '#cite', label: 'Cite this paper' },
    { href: paper.pdf, label: 'Download the PDF' },
  ]

  return (
    <div data-tone={paper.tone}>
      <header className="masthead">
        <div className="masthead-in">
          <p className="masthead-rn">
            Document {paper.numeral}
            <span>{paper.discipline}</span>
          </p>
          <h1>{paper.title}</h1>
          <p className="masthead-sub">{paper.subtitle}</p>

          <dl className="masthead-apparatus">
            <Field label="Author">{SITE.author}</Field>
            <Field label="DOI">
              <a href={paper.doiUrl} target="_blank" rel="noreferrer noopener">
                {paper.doi}
              </a>
            </Field>
            <Field label="Full text">
              <a href={paper.pdf} target="_blank" rel="noreferrer noopener">
                PDF
              </a>
              <span className="sep" aria-hidden="true" />
              <a href={paper.tex} target="_blank" rel="noreferrer noopener">
                LaTeX
              </a>
            </Field>
            <Field label="Extent">
              {c.stats.sections} sections, {minutes} min
            </Field>
            {c.stats.theorems > 0 && (
              <Field label="Statements">{c.stats.theorems} numbered</Field>
            )}
            {c.stats.equations > 0 && (
              <Field label="Equations">{c.stats.equations} numbered</Field>
            )}
          </dl>
        </div>
      </header>

      <div className="reader">
        <Contents items={c.toc} extras={extras} />

        <article className="column">
          <section className="abstract" aria-label="Abstract">
            <p className="abstract-h">Abstract</p>
            <p>{inline(c.abstract, ctx)}</p>
          </section>

          {renderBlocks(c.blocks, ctx)}

          {c.footnotes.length > 0 && (
            <section className="refs" aria-label="Notes">
              <h2>Notes</h2>
              <ol>
                {c.footnotes.map((f, i) => (
                  <li key={i} id={`fn-${i + 1}`}>
                    {inline(f, ctx)}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {c.bibliography.length > 0 && (
            <section className="refs" id="references">
              <h2>References</h2>
              <ol>
                {c.bibliography.map((b) => (
                  <li key={b.key} id={`ref-${b.n}`}>
                    {inline(b.c, ctx)}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section id="cite" style={{ scrollMarginTop: '6rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Cite this paper</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              The record of deposit is the DOI. Please cite the version you read.
            </p>
            <CitePanel bibtex={bibtex(paper)} apa={apa(paper)} ris={ris(paper)} />
          </section>

          <nav className="paper-foot" aria-label="Series navigation">
            {prev ? (
              <Link className="foot-link" href={`/${prev.id}`}>
                <span className="dir">Document {prev.numeral}, before this</span>
                <span className="ttl">{prev.title}</span>
              </Link>
            ) : (
              <Link className="foot-link" href="/argument">
                <span className="dir">Where this starts</span>
                <span className="ttl">The argument in one page</span>
              </Link>
            )}
            {next ? (
              <Link className="foot-link to-end" href={`/${next.id}`}>
                <span className="dir">Document {next.numeral}, next</span>
                <span className="ttl">{next.title}</span>
              </Link>
            ) : (
              <Link className="foot-link to-end" href="/">
                <span className="dir">Back to the start</span>
                <span className="ttl">All three papers</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}

export function jsonLd(id: PaperId) {
  const p = byId(id)!
  const c = getContent(id)
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: `${p.title}: ${p.subtitle}`,
    name: p.title,
    abstract: p.question,
    inLanguage: 'en',
    datePublished: String(p.year),
    author: { '@type': 'Person', name: SITE.author },
    publisher: { '@type': 'Organization', name: 'Zenodo' },
    url: `${SITE.origin}/${p.id}`,
    sameAs: p.doiUrl,
    identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi },
    about: p.discipline,
    wordCount: c.stats.words,
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: SITE.name,
      url: SITE.origin,
      hasPart: papers.map((q) => ({
        '@type': 'ScholarlyArticle',
        name: q.title,
        url: `${SITE.origin}/${q.id}`,
        position: q.numeral,
      })),
    },
  }
}
