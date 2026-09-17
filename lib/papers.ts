export type PaperId = 'why' | 'what' | 'how'

export type Paper = {
  id: PaperId
  /** Roman numeral used in the papers themselves ("Document I"). */
  numeral: 'I' | 'II' | 'III'
  /** The question the paper answers. Also the route. */
  key: 'Why' | 'What' | 'How'
  title: string
  subtitle: string
  discipline: string
  /** One-line statement of what the paper takes in and what it hands on. */
  takes: string
  gives: string
  question: string
  doi: string
  doiUrl: string
  pdf: string
  tex: string
  /** CSS custom-property suffix; drives the per-paper accent. */
  tone: 'oxblood' | 'steel' | 'brass'
  year: number
}

export const SITE = {
  name: 'Necessary Universe',
  origin: 'https://necessaryuniverse.com',
  author: 'Canon',
  tagline:
    'A three-paper series deriving the shape of the universe from the law of identity.',
  version: 'Version 1',
  year: 2026,
}

export const papers: Paper[] = [
  {
    id: 'why',
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
  },
  {
    id: 'what',
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
  },
  {
    id: 'how',
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
  },
]

export const byId = (id: string) => papers.find((p) => p.id === id)

export const neighbours = (id: PaperId) => {
  const i = papers.findIndex((p) => p.id === id)
  return { prev: i > 0 ? papers[i - 1] : null, next: i < papers.length - 1 ? papers[i + 1] : null }
}

export function bibtex(p: Paper) {
  const key = `Canon${p.numeral}`
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
  return `Canon. (${p.year}). ${p.title}: ${p.subtitle} (Document ${p.numeral} of the Necessary Universe series). Zenodo. ${p.doiUrl}`
}

export function ris(p: Paper) {
  return [
    'TY  - GEN',
    'AU  - Canon',
    `TI  - ${p.title}: ${p.subtitle}`,
    `PY  - ${p.year}`,
    'PB  - Zenodo',
    `DO  - ${p.doi}`,
    `UR  - ${p.doiUrl}`,
    'ER  - ',
  ].join('\n')
}