import Link from 'next/link'
import { getContent, readingMinutes } from '@/lib/content'
import {
  apa,
  bibtex,
  byId,
  citationTitle,
  documents,
  neighbours,
  paperHref,
  ris,
  seriesLabel,
  SITE,
  type PaperId,
} from '@/lib/papers'
import { byPodcastId } from '@/lib/podcasts'
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

  const episode = byPodcastId(id)
  const extras = [
    ...(c.bibliography.length ? [{ href: '#references', label: 'References' }] : []),
    { href: '#cite', label: 'Cite this paper' },
    { href: paper.pdf, label: 'Download the PDF' },
    ...(paper.kind === 'study' && episode ? [{ href: `/podcasts/#${paper.id}`, label: 'Listen' }] : []),
  ]

  return (
    <div data-tone={paper.tone}>
      <header className="masthead">
        <div className="masthead-in">
          <p className="masthead-rn">
            {seriesLabel(paper)}
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
              {paper.kind === 'study' && episode && (
                <>
                  <span className="sep" aria-hidden="true" />
                  <a href={`/podcasts/#${paper.id}`}>Listen</a>
                </>
              )}
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

          {paper.kind === 'study' ? (
            <nav className="paper-foot" aria-label="Studies navigation">
              {prev ? (
                <Link className="foot-link" href={paperHref(prev)}>
                  <span className="dir">Studies {prev.numeral}, before this</span>
                  <span className="ttl">{prev.title}</span>
                </Link>
              ) : (
                <Link className="foot-link" href="/studies/">
                  <span className="dir">Studies</span>
                  <span className="ttl">All studies</span>
                </Link>
              )}
              {next ? (
                <Link className="foot-link to-end" href={paperHref(next)}>
                  <span className="dir">Studies {next.numeral}, next</span>
                  <span className="ttl">{next.title}</span>
                </Link>
              ) : (
                <Link className="foot-link to-end" href="/">
                  <span className="dir">The series</span>
                  <span className="ttl">Three papers and their studies</span>
                </Link>
              )}
            </nav>
          ) : (
            <nav className="paper-foot" aria-label="Series navigation">
              {prev ? (
                <Link className="foot-link" href={paperHref(prev)}>
                  <span className="dir">Document {prev.numeral}, before this</span>
                  <span className="ttl">{prev.title}</span>
                </Link>
              ) : (
                <Link className="foot-link" href="/argument/">
                  <span className="dir">Where this starts</span>
                  <span className="ttl">The argument in one page</span>
                </Link>
              )}
              {next ? (
                <Link className="foot-link to-end" href={paperHref(next)}>
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
          )}
        </article>
      </div>
    </div>
  )
}

export function jsonLd(id: PaperId) {
  const p = byId(id)!
  const c = getContent(id)
  const series = {
    '@type': 'CreativeWorkSeries',
    name: SITE.name,
    url: `${SITE.origin}/`,
    hasPart: documents.map((q) => ({
      '@type': 'ScholarlyArticle',
      name: q.title,
      url: `${SITE.origin}${paperHref(q)}`,
      position: q.numeral,
    })),
  }
  const base = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: citationTitle(p),
    name: p.title,
    abstract: p.kind === 'document' ? p.question : `${p.takes} ${p.gives}`,
    inLanguage: 'en',
    datePublished: p.kind === 'study' ? p.published : String(p.year),
    author:
      p.kind === 'study'
        ? {
            '@type': 'Person',
            name: SITE.author,
            sameAs: `https://orcid.org/${p.orcid}`,
            identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: p.orcid },
          }
        : { '@type': 'Person', name: SITE.author },
    publisher: { '@type': 'Organization', name: 'Zenodo' },
    url: `${SITE.origin}${paperHref(p)}`,
    sameAs: p.doiUrl,
    identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi },
    about: p.discipline,
    wordCount: c.stats.words,
    isPartOf: series,
  }
  if (p.kind !== 'study') return base
  return {
    ...base,
    license: p.licenseUrl,
    numberOfPages: p.pages,
    citation: documents.map((q) => ({
      '@type': 'ScholarlyArticle',
      name: citationTitle(q),
      url: q.doiUrl,
      sameAs: `${SITE.origin}${paperHref(q)}`,
    })),
  }
}
