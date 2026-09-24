import raw from '@/content/papers.json'
import type { PaperId } from './papers'

/* ------------------------------------------------------------------ inline */

export type Tok =
  | { t: 'text'; v: string }
  | { t: 'math'; v: string; d?: boolean }
  | { t: 'code'; v: string }
  | { t: 'br' }
  | { t: 'fn'; n: number }
  | { t: 'em'; c: Tok[] }
  | { t: 'strong'; c: Tok[] }
  | { t: 'sc'; c: Tok[] }
  | { t: 'link'; href: string; c: Tok[] }
  | { t: 'ref'; k: string; n: string; a?: string; kind?: string; eq?: boolean }
  | { t: 'cite'; k: string[]; n: (number | string)[] }

/* ------------------------------------------------------------------ blocks */

export type Heading = { kind: 'heading'; level: number; num: string | null; anchor: string; c: Tok[]; text: string }
export type Para = { kind: 'paragraph'; c: Tok[] }
export type MathBlk = {
  kind: 'math'; tex: string; num: string | null; anchor?: string | null
  /** Clean TeX for the Copy button when `tex` carries per-row \tag numbering. */
  copy?: string
  /** Row equation numbers when a multi-row align is numbered row by row. */
  nums?: string[]
  rows?: string[]
}
export type Theorem = {
  kind: 'theorem'; env: string; name: string; num: string; anchor: string
  title: Tok[] | null; blocks: Block[]
}
export type Proof = { kind: 'proof'; title: Tok[] | null; blocks: Block[] }
export type Box = { kind: 'box'; variant: string; name: string; title: Tok[] | null; blocks: Block[] }
export type ListBlk = { kind: 'list'; ordered: boolean; items: { label: string | null; blocks: Block[] }[] }
export type TableBlk = {
  kind: 'table'; num: string; anchor: string; cols: number
  head: Tok[][] | null; rows: Tok[][][]; caption: Tok[] | null
}

export type Block = Heading | Para | MathBlk | Theorem | Proof | Box | ListBlk | TableBlk

export type Preview = { kind: string; num: string; title: Tok[]; text: Tok[] }
export type IndexEntry = { p: string; a: string; k: string; n: string; t: string; s: string; x: string }

export type PaperContent = {
  meta: Record<string, string>
  macros: Record<string, string>
  abstract: Tok[]
  blocks: Block[]
  toc: { level: number; num: string | null; anchor: string; text: string }[]
  bibliography: { n: number; key: string; c: Tok[] }[]
  footnotes: Tok[][]
  previews: Record<string, Preview>
  index: IndexEntry[]
  stats: {
    sections: number; equations: number; theorems: number
    tables: number; references: number; words: number
  }
}

const data = raw as unknown as Record<PaperId, PaperContent>

export function getContent(id: PaperId): PaperContent {
  return data[id]
}

export function allMacros(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const id of Object.keys(data) as PaperId[]) Object.assign(out, data[id].macros)
  return out
}

export function searchIndex(): IndexEntry[] {
  return (Object.keys(data) as PaperId[]).flatMap((id) => data[id].index)
}

/** Minutes of reading at a deliberate pace for dense technical prose. */
export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 180))
}
