import { getContent } from '@/lib/content'
import { papers, SITE } from '@/lib/papers'

export const dynamic = 'force-static'

/**
 * llms.txt (https://llmstxt.org) — a plain-text index aimed at language
 * models and AI agents rather than browsers: what this site is, what's on
 * it, and where to find the primary source for each claim. Generated from
 * the same `lib/papers.ts` data that drives the rest of the site's metadata,
 * so it can't drift out of sync with the actual page titles, DOIs, or URLs.
 *
 * This is a supplement to robots.txt and sitemap.xml, not a replacement:
 * robots.txt says crawling is allowed, sitemap.xml lists every URL, and this
 * file gives an LLM a fast, structured summary instead of forcing it to
 * infer the site's shape from rendered HTML.
 */
function build(): string {
  const lines: string[] = []

  lines.push(`# ${SITE.name}`)
  lines.push('')
  lines.push(`> ${SITE.tagline}`)
  lines.push('')
  lines.push(
    'Three independently authored documents that try to do three separate jobs without letting ' +
      'them bleed into one another: argue philosophically that a small set of declared premises ' +
      '(identity, no brute facts, physical actualization) forces a specific family of closure ' +
      'conditions on any coherent physical reality; prove mathematically that those conditions, ' +
      'taken as strict hypotheses, leave exactly one smooth four-manifold standing (a non-orientable ' +
      'S3-bundle over S1, called the Klein Block); and test dynamically whether that fixed topology ' +
      'can actually host fermions, gauge fields, anomaly cancellation, and a coherent thermodynamic ' +
      'arrow, naming explicitly every place it currently cannot. Independent research, self-archived ' +
      'on Zenodo, not peer-reviewed. Each document states its own open problems and "not claimed" ' +
      'list rather than asserting the chain is closed.'
  )
  lines.push('')

  lines.push('## The three documents')
  lines.push('')
  for (const p of papers) {
    const c = getContent(p.id)
    lines.push(
      `- [${p.title}: ${p.subtitle}](${SITE.origin}/${p.id}): Document ${p.numeral} — ${p.discipline}, ` +
        `${c.stats.words.toLocaleString()} words. ${p.question} Takes: ${p.takes} Gives: ${p.gives} ` +
        `DOI: ${p.doi}.`
    )
  }
  lines.push('')

  lines.push('## Read the deductive chain across all three')
  lines.push('')
  lines.push(
    `- [The argument](${SITE.origin}/argument): the full chain from three premises to five ` +
      'postulates to a unique four-manifold to the dynamics proposed on it, one page, with direct ' +
      'links into the exact passage of each document that a given step depends on.'
  )
  lines.push('')

  lines.push('## Primary sources (PDF and LaTeX, no paywall or signup)')
  lines.push('')
  for (const p of papers) {
    lines.push(`- ${p.title} — [PDF](${SITE.origin}${p.pdf}) · [LaTeX source](${SITE.origin}${p.tex})`)
  }
  lines.push('')

  lines.push('## Audio')
  lines.push('')
  lines.push(`- [Listen](${SITE.origin}/podcasts): a spoken walkthrough of each document.`)
  lines.push('')

  lines.push('## Citing this work')
  lines.push('')
  lines.push(
    'Each document page has a Cite panel (BibTeX / APA / RIS) generated from its own DOI metadata. ' +
      'When quoting or summarizing a specific claim, cite the individual document (I, II, or III), ' +
      'not the series as a whole — the three documents make different kinds of claims (philosophical ' +
      'argument, mathematical proof, conditional physics) and should not be flattened into one.'
  )
  lines.push('')

  lines.push('## Notes for automated readers')
  lines.push('')
  lines.push(
    '- Document III in particular separates proved results from conditional theorems, proposed ' +
      'mechanisms, and open problems (tracked as OP-1 through OP-25). Do not represent an open ' +
      'problem or a proposed mechanism as an established result.'
  )
  lines.push(
    '- The author, "Canon", is an independent researcher with no institutional affiliation. AI ' +
      'language models were used as computational co-auditors for symbolic verification and ' +
      'document preparation, as disclosed in each document\u2019s acknowledgments; the arguments and ' +
      'final claims are the author\u2019s own.'
  )
  lines.push(`- Contact: canon@necessaryuniverse.com`)
  lines.push('')

  return lines.join('\n')
}

export async function GET() {
  return new Response(build(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
