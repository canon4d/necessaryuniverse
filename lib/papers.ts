export type DocumentId = 'why' | 'what' | 'how'
export type StudyId = 'studies-1'
export type PaperId = DocumentId | StudyId

export type Tone = 'oxblood' | 'steel' | 'brass' | 'pine'

type WorkBase = {
  id: PaperId
  kind: 'document' | 'study'
  /** Path segment. Documents use their id; studies use a stable URL slug. */
  slug: string
  title: string
  subtitle: string
  discipline: string
  takes: string
  gives: string
  doi: string
  doiUrl: string
  pdf: string
  tex: string
  tone: Tone
  year: number
  /** Documents only. Present on the union so existing readers can touch it. */
  question?: string
  /**
   * Deposit date of the Zenodo record named by `doi`.
   * Documents: publication_date on the record already cited here.
   * Studies I: 2026-11-11.
   */
  published: string
}

export type DocumentPaper = WorkBase & {
  kind: 'document'
  id: DocumentId
  /** Roman numeral used in the papers themselves ("Document I"). */
  numeral: 'I' | 'II' | 'III'
  /** The question the paper answers. Also the historical route key. */
  key: 'Why' | 'What' | 'How'
  question: string
}

export type StudyPaper = WorkBase & {
  kind: 'study'
  id: StudyId
  /** "I" in "Studies I". Not a document numeral. */
  numeral: 'I'
  /** Zenodo record title, plain S3/S1. Used for BibTeX, APA, RIS, and Scholar. */
  citationTitle: string
  bibKey: string
  conceptDoi: string
  zenodoUrl: string
  pages: number
  license: string
  licenseUrl: string
  orcid: string
}

export type Paper = DocumentPaper | StudyPaper

export const SITE = {
  name: 'Necessary Universe',
  origin: 'https://necessaryuniverse.com',
  author: 'Canon',
  orcid: '0009-0001-9037-6209',
  tagline:
    'A three-paper series and its studies, deriving the shape of the universe from the law of identity.',
  version: 'Version 1',
  year: 2026,
}

/** A related site. The label is that site's paper title. */
export const RELATED = {
  href: 'https://ai.necessaryuniverse.com/',
  title:
    'The Dialectical Cage and the Glass-Box Governor: A Practice-Based Ethics, Safety Constitution, and Reference-Monitor Architecture for AI Agents',
  note: 'An AI safety paper built on the Necessary Universe framework.',
}

export const documents: DocumentPaper[] = [
  {
    id: 'why',
    kind: 'document',
    slug: 'why',
    numeral: 'I',
    key: 'Why',
    title: 'Shape of Reality',
    subtitle: 'The Necessity of the Zero-Energy Klein Block',
    discipline: 'Philosophy of Physics',
    takes: 'Three premises: identity, no brute facts, physical actualization.',
    gives: 'Five closure-admissible postulates.',
    question:
      'What must reality be like if existence is determinate, physically actual, and free of unexplained brute facts?',
    doi: '10.5281/zenodo.22766109',
    doiUrl: 'https://doi.org/10.5281/zenodo.22766109',
    pdf: '/papers/shape-of-reality.pdf',
    tex: '/latex/shape-of-reality.tex',
    tone: 'oxblood',
    year: 2026,
    published: '2026-09-15',
  },
  {
    id: 'what',
    kind: 'document',
    slug: 'what',
    numeral: 'II',
    key: 'What',
    title: 'The Klein Block',
    subtitle: 'Topological Uniqueness of the Non-Orientable S³-Bundle over S¹',
    discipline: 'Differential Topology',
    takes: 'The five postulates, as strict mathematical hypotheses.',
    gives: 'Exactly one admissible four-manifold.',
    question:
      'Which four-dimensional topology is selected by the closure-admissible postulates?',
    doi: '10.5281/zenodo.22766247',
    doiUrl: 'https://doi.org/10.5281/zenodo.22766247',
    pdf: '/papers/the-klein-block.pdf',
    tex: '/latex/the-klein-block.tex',
    tone: 'steel',
    year: 2026,
    published: '2026-09-15',
  },
  {
    id: 'how',
    kind: 'document',
    slug: 'how',
    numeral: 'III',
    key: 'How',
    title: 'Twisted Dynamics on the Klein Block',
    subtitle:
      'A Conditional Framework for Kinematic Descent, Nodal Defect Structure, and Anomaly Constraints',
    discipline: 'Mathematical Physics',
    takes: 'The fixed topology of Document II.',
    gives: 'Descent conditions, defect structure, and named open problems.',
    question:
      'How can fields, fermions, defects, and anomalies be formulated consistently on that topology?',
    doi: '10.5281/zenodo.22766260',
    doiUrl: 'https://doi.org/10.5281/zenodo.22766260',
    pdf: '/papers/twisted-dynamics-on-the-klein-block.pdf',
    tex: '/latex/twisted-dynamics-on-the-klein-block.tex',
    tone: 'brass',
    year: 2026,
    published: '2026-09-15',
  },
]

export const studies: StudyPaper[] = [
  {
    id: 'studies-1',
    kind: 'study',
    slug: 'klein-block-studies-i',
    numeral: 'I',
    title: 'Klein Block Studies I',
    subtitle:
      'Topological Necessity of Conformal Nodal Hypersurfaces on the Non-Orientable S³-Bundle over S¹ and the Free-Boundary Variational Selection of Conformally Regular Solutions',
    citationTitle:
      'Klein Block Studies I: Topological Necessity of Conformal Nodal Hypersurfaces on the Non-Orientable S3-Bundle over S1 and the Free-Boundary Variational Selection of Conformally Regular Solutions',
    bibKey: 'CanonStudiesI',
    discipline: 'Mathematical Cosmology',
    takes: 'The fixed topology of Document II and the free-boundary action principle.',
    gives:
      'A forced nodal hypersurface, a variational face condition, conditional smooth descent, and an exact Pell-tower mode classification.',
    doi: '10.5281/zenodo.24143287',
    doiUrl: 'https://doi.org/10.5281/zenodo.24143287',
    conceptDoi: '10.5281/zenodo.24143286',
    zenodoUrl: 'https://zenodo.org/records/24143287',
    pdf: '/papers/klein-block-studies-i.pdf',
    tex: '/latex/klein-block-studies-i.tex',
    tone: 'pine',
    year: 2026,
    published: '2026-11-11',
    pages: 51,
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    orcid: '0009-0001-9037-6209',
  },
]

/** The closed I → II → III chain. Studies are not members of this list. */
export const papers: DocumentPaper[] = documents

/** Documents, then studies. Adding a study is one entry in `studies`. */
export const works: Paper[] = [...documents, ...studies]

export const byId = (id: string) => works.find((p) => p.id === id)

export function paperHref(p: Pick<Paper, 'kind' | 'slug'>): string {
  return p.kind === 'study' ? `/studies/${p.slug}/` : `/${p.slug}/`
}

export function seriesLabel(p: Paper): string {
  return p.kind === 'document' ? `Document ${p.numeral}` : `Studies ${p.numeral}`
}

/** Title string used by citations. Documents stay `title: subtitle`. */
export function citationTitle(p: Paper): string {
  return p.kind === 'study' ? p.citationTitle : `${p.title}: ${p.subtitle}`
}

export function scholarDate(published: string): string {
  return published.replaceAll('-', '/')
}

/** Google Scholar meta tags. Dates and DOIs come from each paper's own record. */
export function scholarOther(p: Paper): Record<string, string> {
  return {
    citation_title: citationTitle(p),
    citation_author: SITE.author,
    citation_publication_date: scholarDate(p.published),
    citation_doi: p.doi,
    citation_pdf_url: `${SITE.origin}${p.pdf}`,
    citation_publisher: 'Zenodo',
  }
}

export const neighbours = (id: PaperId) => {
  const list: Paper[] = documents.some((p) => p.id === id)
    ? documents
    : studies.some((p) => p.id === id)
      ? studies
      : []
  const i = list.findIndex((p) => p.id === id)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? list[i - 1] : null,
    next: i < list.length - 1 ? list[i + 1] : null,
  }
}

const SERIES_NOTE_DOCUMENT = (numeral: string) =>
  `Document ${numeral} of the Necessary Universe series`

function seriesNote(p: Paper): string {
  return p.kind === 'study' ? `${p.title}, Necessary Universe series` : SERIES_NOTE_DOCUMENT(p.numeral)
}

export function bibtex(p: Paper) {
  if (p.kind === 'study') {
    return [
      `@misc{${p.bibKey},`,
      `  author       = {Canon},`,
      `  title        = {${p.citationTitle}},`,
      `  year         = {${p.year}},`,
      `  howpublished = {Zenodo},`,
      `  doi          = {${p.doi}},`,
      `  url          = {${p.doiUrl}},`,
      `  note         = {${seriesNote(p)}}`,
      `}`,
    ].join('\n')
  }
  const key = `Canon${p.key}`
  return [
    `@misc{${key},`,
    `  author       = {Canon},`,
    `  title        = {${p.title}: ${p.subtitle}},`,
    `  year         = {${p.year}},`,
    `  howpublished = {Zenodo},`,
    `  doi          = {${p.doi}},`,
    `  url          = {${p.doiUrl}},`,
    `  note         = {Document ${p.numeral} of the Necessary Universe series}`,
    `}`,
  ].join('\n')
}

export function apa(p: Paper) {
  if (p.kind === 'study') {
    return `Canon. (${p.year}). ${p.citationTitle} (${seriesNote(p)}). Zenodo. ${p.doiUrl}`
  }
  return `Canon. (${p.year}). ${p.title}: ${p.subtitle} (Document ${p.numeral} of the Necessary Universe series). Zenodo. ${p.doiUrl}`
}

export function ris(p: Paper) {
  const lines = [
    'TY  - GEN',
    'AU  - Canon',
    `TI  - ${citationTitle(p)}`,
    `PY  - ${p.year}`,
    'PB  - Zenodo',
    `DO  - ${p.doi}`,
    `UR  - ${p.doiUrl}`,
  ]
  if (p.kind === 'study') lines.push(`N1  - ${seriesNote(p)}`)
  lines.push('ER  - ')
  return lines.join('\n')
}
