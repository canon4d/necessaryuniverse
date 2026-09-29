# Necessary Universe

**A three-document research series arguing, from first principles, that reality is necessarily a non-orientable S³-bundle over S¹ — the "Klein Block" — and testing what physics that topology can support.**

[![Live Site](https://img.shields.io/badge/site-necessaryuniverse.com-black)](https://necessaryuniverse.com)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js%2016-000000?logo=next.js)](https://nextjs.org)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com)

This repository is the source for **[necessaryuniverse.com](https://necessaryuniverse.com)** — a static Next.js site that presents the three papers, renders their math natively in the browser (no PDF viewer required), and cross-links every claim, theorem, and open problem between them.

---

## Table of contents

- [What this is](#what-this-is)
- [The three documents](#the-three-documents)
- [Site features](#site-features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [The content pipeline](#the-content-pipeline)
- [Local development](#local-development)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [Citing this work](#citing-this-work)
- [Honesty notes / scope](#honesty-notes--scope)
- [License](#license)
- [Contact](#contact)

---

## What this is

Necessary Universe is an independent research program, written entirely outside any academic institution, that tries to do three separate jobs and keep them from bleeding into one another:

1. **Argue philosophically** that a small set of declared premises (identity, no brute facts, physical actualization) forces a specific family of closure conditions on any coherent physical reality.
2. **Prove mathematically** that those closure conditions, taken as strict hypotheses, leave exactly one smooth four-manifold standing: a non-orientable S³-bundle over S¹.
3. **Test dynamically** whether that fixed topology can actually host fermions, gauge fields, anomaly cancellation, and a coherent thermodynamic arrow — and name, explicitly, every place where it currently cannot.

Each paper is written to stand on its own, but they are designed to be read as a chain: Document I hands its five postulates to Document II as hypotheses; Document II hands its topological uniqueness result to Document III as fixed background geometry. The website's job is to make that chain of dependency legible — every theorem, postulate, and open problem is a deep link, so a claim in Document III that depends on Document I can be checked in two clicks.

## The three documents

| | Document | Discipline | What it takes | What it gives |
|---|---|---|---|---|
| **I — Why** | [*Shape of Reality*: The Necessity of the Zero-Energy Klein Block](https://necessaryuniverse.com/why) | Philosophy of Physics | Three declared premises | Five closure-admissible postulates |
| **II — What** | [*The Klein Block*: Topological Uniqueness of the Non-Orientable S³-Bundle over S¹](https://necessaryuniverse.com/what) | Differential Topology | The five postulates, as strict hypotheses | Exactly one admissible four-manifold |
| **III — How** | [*Twisted Dynamics on the Klein Block*: A Conditional Framework for Kinematic Descent, Nodal Defect Structure, and Anomaly Constraints](https://necessaryuniverse.com/how) | Mathematical Physics | The fixed topology of Document II | Descent conditions, defect structure, and a ledger of named open problems |

Each is also archived on Zenodo with its own DOI:

| Document | DOI |
|---|---|
| I — Shape of Reality | [10.5281/zenodo.22766109](https://doi.org/10.5281/zenodo.22766109) |
| II — The Klein Block | [10.5281/zenodo.22766247](https://doi.org/10.5281/zenodo.22766247) |
| III — Twisted Dynamics on the Klein Block | [10.5281/zenodo.22766260](https://doi.org/10.5281/zenodo.22766260) |

Current content, measured directly from source (`npm run content`):

| Document | Sections | Theorems/Props | Numbered equations | Tables | References |
|---|---:|---:|---:|---:|---:|
| I — Why | 21 | — | — | 5 | 15 |
| II — What | 14 | 37 | 10 | 2 | 12 |
| III — How | 18 | 32 | 101 | 8 | 22 |

(Document I is prose argument with no numbered theorem environments or display equations; its rigor lives in the premise/postulate structure, not in formal proof.)

## Site features

- **Native math rendering.** Every equation, theorem, and table is parsed out of the `.tex` sources at build time and rendered with [KaTeX](https://katex.org/) — no PDF embed, no MathJax runtime cost, fully indexable text.
- **Cross-paper deep linking.** Theorems, postulates, and open problems (`OP-1` … `OP-25`) are addressable anchors, so `/argument` can jump straight into the exact passage of any of the three documents that a given claim depends on.
- **Full-text search** across all three papers (⌘K / Ctrl+K), built from a flat search index generated alongside the reading content.
- **One-click citation export** — BibTeX, APA, and RIS — generated per document from its DOI metadata.
- **Interactive diagrams** (e.g. the mapping-torus / "twist" visualization) built as plain inline SVG, no charting library.
- **Podcast companion** — a short spoken walkthrough of each document, with its own player and transcript-adjacent stats.
- **Dark/light theme**, chosen before first paint to avoid a flash of the wrong theme.
- **Fully static output** (`next export`) — no server, no database, no API routes. The entire site is HTML/CSS/JS files that can be served from anywhere.

## Tech stack

- **[Next.js 16](https://nextjs.org/)** (App Router, static export — `output: 'export'`)
- **[React 19](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[KaTeX](https://katex.org/)** for math typesetting
- **Python 3** for the custom LaTeX → JSON content pipeline (standard library only, no LaTeX parser dependency)
- **Node.js** for math-rendering validation in CI-style checks
- Deployed on **[Vercel](https://vercel.com/)**; no other backend services

## Project structure

```
.
├── app/                    # Next.js App Router pages (/, /why, /what, /how, /argument, /podcasts)
│   ├── robots.ts           # /robots.txt — explicit search + AI crawler allowlist
│   ├── sitemap.ts          # /sitemap.xml
│   └── llms.txt/route.ts   # /llms.txt — structured summary for AI agents (llmstxt.org)
├── components/             # Reader, search palette, citation panel, SVG diagrams, podcast player
├── content/
│   └── papers.json         # Generated — do not hand-edit. Rebuilt from papers-src/*.tex
├── lib/
│   ├── papers.ts           # Paper metadata: titles, DOIs, per-paper "takes/gives" summary
│   ├── content.ts          # Typed accessors over content/papers.json
│   ├── math.ts             # KaTeX rendering helpers
│   └── podcasts.ts         # Podcast episode metadata
├── papers-src/             # The actual LaTeX source of all three papers (source of truth)
│   ├── shape-of-reality.tex
│   ├── the-klein-block.tex
│   └── twisted-dynamics-on-the-klein-block.tex
├── public/
│   ├── papers/*.pdf        # Compiled PDFs, served for download
│   ├── latex/*.tex         # Raw .tex, served for download
│   ├── podcasts/*.m4a
│   └── search.json         # Generated — flat search index
├── tools/
│   ├── latex-to-json.py    # The content pipeline (see below)
│   └── validate-math.js    # Renders every extracted equation through KaTeX and fails on error
└── vercel.json
```

## The content pipeline

The papers are **not** hand-transcribed into the website. `papers-src/*.tex` is the single source of truth for both the PDFs and the web reader, so the two can never silently drift apart.

```
papers-src/*.tex
      │
      │  tools/latex-to-json.py   (pure-Python LaTeX parser: no external deps)
      ▼
content/papers.json   ── theorems, equations, tables, TOC, bibliography,
      │                  footnotes, cross-reference index, per-paper stats
      │
      ├──▶ tools/validate-math.js   → renders every equation through KaTeX,
      │                               fails the build on any that don't parse
      │
      └──▶ Next.js pages           → typed access via lib/content.ts,
                                      rendered client-side with KaTeX
```

Editing a paper is therefore: edit the `.tex`, re-export the PDF, run `npm run content`, and the entire website — word counts, section numbers, theorem numbers, table of contents, search index, and cross-reference anchors — updates from that one file. This also means section/theorem numbering on the site is never manually maintained; if you renumber a section in the `.tex`, every anchor and cross-link derived from it is regenerated to match.

## Local development

Requires Node.js 20+ and Python 3.

```bash
git clone https://github.com/<your-username>/necessary-universe.git
cd necessary-universe
npm install
npm run content     # parse papers-src/*.tex → content/papers.json + public/search.json
npm run dev         # http://localhost:3000
```

## Available scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Type-check and produce a static export in `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run content` | Re-parse `papers-src/*.tex` into `content/papers.json`, then validate every equation renders in KaTeX |
| `npm run check:math` | Run only the KaTeX validation pass, against the existing `content/papers.json` |
| `npm run preview` | Serve the built `out/` directory locally |

If you edit a `.tex` file, **run `npm run content` before `npm run build`** — the build reads only from `content/papers.json`, not from `papers-src/` directly.

## SEO & AI crawling

Nothing on this site is gated behind JavaScript, a paywall, or a login — the whole point is to be read, indexed, and cited — so the crawling policy is simply *allow everyone*, made explicit rather than left to defaults:

- **`app/robots.ts`** → `/robots.txt` explicitly allows the wildcard `*` group, a named group of general search engines (Googlebot, Bingbot, Applebot, DuckDuckBot, Slurp), and a named group of AI crawlers and assistants (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent, Diffbot, cohere-ai). The wildcard rule alone would already cover all of these — robots.txt parsers fall back to `*` for any user-agent without its own group — but naming them makes the policy auditable instead of implicit.
- **`app/llms.txt/route.ts`** → `/llms.txt`, following the [llms.txt convention](https://llmstxt.org/), gives language models and AI agents a compact, structured summary of the site (what each document claims, what it takes and gives, direct links to the PDF/LaTeX source and the DOI) instead of forcing them to reconstruct that from rendered HTML. It's generated from the same `lib/papers.ts` data that drives page titles and the citation panel, so it can't drift out of sync with the actual pages.
- **`app/sitemap.ts`** → `/sitemap.xml` intentionally omits `lastModified`. A static export rebuilds every page on every deploy regardless of whether its content changed, so stamping every URL with the build timestamp would misrepresent how often the content actually changes — search engines are explicit that an inaccurate `lastmod` is worse than none.
- Structured data (JSON-LD) is already attached per page: `ScholarlyArticle` for each document (with DOI, word count, and series membership), `CreativeWorkSeries` on the homepage, and `PodcastSeries`/`PodcastEpisode` on `/podcasts`.
- No headers, meta tags, or config anywhere in this repo set `noindex`, `noai`, or an `X-Robots-Tag` — there's nothing hidden to audit for.

## Deployment

The site deploys to Vercel (`vercel.json`): every push runs `npm run build` and serves the resulting `out/` directory. There is no server-side runtime — `next.config.ts` sets `output: 'export'`, so the entire site is static files and can equally be served from GitHub Pages, Netlify, Cloudflare Pages, S3, or any static host. To deploy under a subpath (e.g. a GitHub Pages project site), set the `BASE_PATH` build environment variable.

## Citing this work

Each paper page includes a **Cite** panel with ready-to-copy BibTeX, APA, and RIS. The BibTeX keys are `CanonWhy`, `CanonWhat`, and `CanonHow`. Example (Document I — Why):

```bibtex
@misc{CanonWhy,
  author       = {Canon},
  title        = {Shape of Reality: The Necessity of the Zero-Energy Klein Block},
  year         = {2026},
  howpublished = {Zenodo},
  doi          = {10.5281/zenodo.22766109},
  url          = {https://doi.org/10.5281/zenodo.22766109},
  note         = {Document I of the Necessary Universe series}
}
```

## Honesty notes / scope

To be direct about what this project is and isn't:

- This is **independent research**, conducted without institutional affiliation, external funding, or peer review. The papers are self-archived on Zenodo, not published in a peer-reviewed journal.
- The author used AI language models as computational co-auditors for symbolic verification, mathematical stress-testing, and document preparation, as disclosed in each paper's acknowledgments. The framework, arguments, and final claims are the author's own.
- Document III is explicit and extensive about what it has **not** shown: it separates proved results from conditional theorems, proposed mechanisms, and open problems (tracked as `OP-1` through `OP-25`), and states plainly where the mixed-anomaly, baryogenesis, and quotient-QFT programs remain unsolved.
- The site's own claims about itself are limited to what's true of the *code*: it's a static export, the math is parsed and validated at build time, and content numbers (word counts, theorem counts, etc.) are computed from the `.tex` sources, not asserted by hand.

If you're evaluating the physics or philosophy, read the papers' own "Not Claimed" and "Results Ledger" sections first — they're written to make the argument easy to attack at its actual load-bearing points, not to oversell what's been established.

## License

No license file is currently included in this repository, which means the source code is **all rights reserved** by default — you're welcome to read it, but reuse, redistribution, or derivative works are not licensed. If you'd like to use any part of the site's code, open an issue and ask.

The papers themselves are archived on Zenodo under the DOIs above; see each Zenodo record for its specific licensing terms.

## Contact

Questions, corrections, or a load-bearing objection to one of the papers: **canon@necessaryuniverse.com**
