import Link from 'next/link'
import type { Metadata } from 'next'
import { getContent } from '@/lib/content'
import { byId, SITE, type PaperId } from '@/lib/papers'
import { inline, type RenderCtx } from '@/components/Nodes'

export const metadata: Metadata = {
  title: 'The argument in one page',
  description:
    'The deductive chain of the Necessary Universe series, from three premises to five postulates to a unique four-manifold and the dynamics proposed on it.',
  alternates: { canonical: '/argument' },
}

type Step = { paper: PaperId; anchor: string; label?: string; note?: string }

type Stage = {
  paper: PaperId
  kicker: string
  title: string
  blurb: string
  steps: Step[]
}

const STAGES: Stage[] = [
  {
    paper: 'why',
    kicker: 'Document I',
    title: 'Three premises',
    blurb:
      'Everything downstream rests on these. Reject one and the chain stops here — which is the intended way to argue with the series.',
    steps: [
      { paper: 'why', anchor: '1-1-premise-1-identity-and-non-contradiction', label: '1.1' },
      { paper: 'why', anchor: '1-2-premise-2-no-brute-facts', label: '1.2' },
      { paper: 'why', anchor: '1-3-premise-3-physical-actualization', label: '1.3' },
    ],
  },
  {
    paper: 'why',
    kicker: 'Document I',
    title: 'What the premises force',
    blurb:
      'Each property is argued for separately, then assembled. This is philosophy, not derivation: the claims are defended by argument and offered for audit.',
    steps: [
      { paper: 'why', anchor: '3-the-topological-razor', label: '§3' },
      { paper: 'why', anchor: '4-the-read-head', label: '§4' },
      { paper: 'why', anchor: '5-finiteness', label: '§5' },
      { paper: 'why', anchor: '6-time-is-a-circle', label: '§6' },
      { paper: 'why', anchor: '7-space-is-a-3-sphere', label: '§7' },
      { paper: 'why', anchor: '8-the-twist', label: '§8' },
      { paper: 'why', anchor: '9-zero-energy', label: '§9' },
    ],
  },
  {
    paper: 'what',
    kicker: 'Document II',
    title: 'Five postulates, restated precisely',
    blurb:
      'Paper II imports the postulates rather than deriving them, and says so. They become hypotheses of a theorem.',
    steps: [
      { paper: 'what', anchor: 'postulate-2-1' },
      { paper: 'what', anchor: 'postulate-2-2' },
      { paper: 'what', anchor: 'postulate-2-3' },
      { paper: 'what', anchor: 'postulate-2-4' },
      { paper: 'what', anchor: 'postulate-2-5' },
    ],
  },
  {
    paper: 'what',
    kicker: 'Document II',
    title: 'Exactly one manifold survives',
    blurb:
      'The classification is the mathematical core of the series, and the part that stands or falls independently of the philosophy.',
    steps: [
      { paper: 'what', anchor: 'theorem-3-1' },
      { paper: 'what', anchor: 'lemma-3-2' },
      { paper: 'what', anchor: 'theorem-3-3' },
      { paper: 'what', anchor: 'corollary-3-4' },
      { paper: 'what', anchor: 'definition-3-5' },
    ],
  },
  {
    paper: 'what',
    kicker: 'Document II',
    title: 'What that topology costs you',
    blurb:
      'Consequences of the block, proved on the block. Two of them are things most cosmologies would rather not give up.',
    steps: [
      { paper: 'what', anchor: 'theorem-4-1' },
      { paper: 'what', anchor: 'theorem-4-6' },
      { paper: 'what', anchor: 'corollary-4-7' },
      { paper: 'what', anchor: '4-1-the-entropy-no-go-theorem', label: '§4.1' },
      { paper: 'what', anchor: '5-canonical-hamiltonian-on-compact-boundaryless-sl', label: '§5' },
      { paper: 'what', anchor: '6-3-existence-and-multiplicity-of-euclidean-pin-stru', label: '§6.3' },
    ],
  },
  {
    paper: 'how',
    kicker: 'Document III',
    title: 'Putting physics on it',
    blurb:
      'Conditional throughout. Paper III separates what follows, what would follow, what is proposed, and what is still an open calculation.',
    steps: [
      { paper: 'how', anchor: '2-kinematic-descent-conditions-and-temporal-period', label: '§2' },
      { paper: 'how', anchor: '3-free-fermion-kinematic-descent-and-generalized-s', label: '§3' },
      { paper: 'how', anchor: '4-conditional-nodal-defect-structure-and-formal-mo', label: '§4' },
      { paper: 'how', anchor: '5-smith-map-anomaly-framework-and-the-pure-gravita', label: '§5' },
    ],
  },
  {
    paper: 'how',
    kicker: 'Document III',
    title: 'What is still open',
    blurb:
      'The series treats its own gaps as the deliverable. These are the calculations that would decide it either way.',
    steps: [
      { paper: 'how', anchor: 'results-ledger' },
      { paper: 'how', anchor: '6-epistemic-firewall-and-open-problems', label: '§6' },
      { paper: 'how', anchor: 'core-open-problems' },
      { paper: 'how', anchor: '7-open-research-programme-what-the-framework-gain', label: '§7' },
    ],
  },
]

export default function ArgumentPage() {
  const content: Record<string, ReturnType<typeof getContent>> = {
    why: getContent('why'),
    what: getContent('what'),
    how: getContent('how'),
  }

  return (
    <>
      <header className="arg-head shell">
        <h1>One argument, split across three papers.</h1>
        <p>
          Every line below links straight into the passage that carries it. Read top to bottom for the
          chain, or jump in wherever you want to check a step.
        </p>
      </header>

      <div className="shell">
        {STAGES.map((stage, si) => {
          const paper = byId(stage.paper)!
          return (
            <section className="stage" key={si} data-tone={paper.tone}>
              <div className="stage-side">
                <p className="stage-doc">
                  {stage.kicker}, {paper.title}
                </p>
                <h2>{stage.title}</h2>
                <p>{stage.blurb}</p>
              </div>

              <div className="arg-items">
                {stage.steps.map((step) => {
                  const c = content[step.paper]
                  const ctx: RenderCtx = { previews: c.previews, idFor: (a) => a }
                  const p = c.previews[step.anchor]
                  const label =
                    step.label ?? (p ? `${abbrev(p.kind)} ${p.num}`.trim() : '')
                  const title = p ? inline(p.title, ctx) : step.anchor
                  const excerpt = p && p.text.length > 0 ? inline(p.text, ctx) : null
                  return (
                    <Link
                      className="arg-item"
                      key={step.anchor}
                      href={`/${step.paper}#${step.anchor}`}
                    >
                      <p className="arg-t">{title}</p>
                      <span className="arg-lab">{label}</span>
                      {excerpt && <p className="arg-x">{excerpt}</p>}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <section className="strip shell" style={{ borderTop: '1px solid var(--rule)', borderBottom: 0 }}>
        <h2 className="strip-h">Where to push</h2>
        <div className="prose-narrow">
          <p>
            The classification theorem in Document II is the most load-bearing and the most
            checkable: it is ordinary differential topology and stands on Hatcher and
            Poincaré–Perelman. The step from premises to postulates in Document I is argument, and the
            paper presents it as such. Document III labels its own status claim by claim.
          </p>
          <p>
            If you want to disagree productively, the three premises and the move from a hump-shaped
            entropy profile to non-orientability are where the series is most exposed — and the papers
            name those exposures themselves.
          </p>
        </div>
        <div className="btn-row">
          <Link className="btn btn-solid" href="/why">
            Read Document I
          </Link>
          <Link className="btn" href="/">
            Back to {SITE.name}
          </Link>
        </div>
      </section>
    </>
  )
}

function abbrev(kind: string) {
  const map: Record<string, string> = {
    'Physical Postulate': 'Post.',
    Theorem: 'Thm.',
    Lemma: 'Lem.',
    Corollary: 'Cor.',
    Definition: 'Def.',
    Remark: 'Rem.',
    Proposition: 'Prop.',
    'Conditional Physical Proposition': 'Prop.',
    'Structural Claim': 'Claim',
    Section: '§',
    Table: 'Tab.',
  }
  return map[kind] ?? kind
}
