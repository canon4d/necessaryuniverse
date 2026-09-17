import React from 'react'
import type { Block, Preview, Tok } from '@/lib/content'
import { renderMath } from '@/lib/math'

export type RenderCtx = {
  previews: Record<string, Preview>
  /** Anchor prefix so equation/theorem ids stay unique if ever embedded twice. */
  idFor: (anchor: string) => string
}

/* ------------------------------------------------------------------ inline */

export function inline(toks: Tok[] | null | undefined, ctx: RenderCtx): React.ReactNode {
  if (!toks || toks.length === 0) return null
  return toks.map((t, i) => <React.Fragment key={i}>{tok(t, ctx)}</React.Fragment>)
}

function tok(t: Tok, ctx: RenderCtx): React.ReactNode {
  switch (t.t) {
    case 'text':
      return t.v
    case 'math':
      return (
        <span
          className="m"
          // KaTeX output is generated at build time from the papers' own TeX.
          dangerouslySetInnerHTML={{ __html: renderMath(t.v, false) }}
        />
      )
    case 'code':
      return <code>{t.v}</code>
    case 'br':
      return <br />
    case 'em':
      return <em>{inline(t.c, ctx)}</em>
    case 'strong':
      return <strong>{inline(t.c, ctx)}</strong>
    case 'sc':
      return <span style={{ fontVariantCaps: 'small-caps' }}>{inline(t.c, ctx)}</span>
    case 'link':
      return (
        <a href={t.href} target="_blank" rel="noreferrer noopener">
          {inline(t.c, ctx)}
        </a>
      )
    case 'fn':
      return (
        <sup className="fnref">
          <a id={`fnref-${t.n}`} href={`#fn-${t.n}`}>
            {t.n}
          </a>
        </sup>
      )
    case 'cite':
      return (
        <span className="citeref">
          [
          {t.n.map((n, i) => (
            <React.Fragment key={i}>
              {i > 0 && ', '}
              <a href={`#ref-${n}`}>{n}</a>
            </React.Fragment>
          ))}
          ]
        </span>
      )
    case 'ref':
      return crossRef(t, ctx)
    default:
      return null
  }
}

function crossRef(t: Extract<Tok, { t: 'ref' }>, ctx: RenderCtx): React.ReactNode {
  const label = t.eq ? `(${t.n})` : t.n
  if (!t.a) return <span className="citeref">{label}</span>
  const p = ctx.previews[t.a]
  return (
    <span className="xref">
      <a href={`#${ctx.idFor(t.a)}`}>{label}</a>
      {p && (
        <span className="xref-card" role="note">
          <b>
            {p.kind} {p.num}
            {p.title.length > 0 && <>{' \u2014 '}{inline(p.title, ctx)}</>}
          </b>
          {inline(p.text, ctx)}
        </span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ blocks */

export function blocks(bs: Block[], ctx: RenderCtx): React.ReactNode {
  return bs.map((b, i) => <React.Fragment key={i}>{block(b, ctx)}</React.Fragment>)
}

function block(b: Block, ctx: RenderCtx): React.ReactNode {
  switch (b.kind) {
    case 'heading': {
      const id = ctx.idFor(b.anchor)
      if (b.level <= 1) {
        return (
          <h2 id={id}>
            {b.num && <span className="h-n">Section {b.num}</span>}
            <span>{inline(b.c, ctx)}</span>
          </h2>
        )
      }
      if (b.level === 2) {
        return (
          <h3 id={id}>
            {b.num && <span className="h-n h3-n">{b.num}</span>}
            {inline(b.c, ctx)}
          </h3>
        )
      }
      return (
        <h4 id={id}>
          {b.num && <span className="h-n h3-n">{b.num}</span>}
          {inline(b.c, ctx)}
        </h4>
      )
    }

    case 'paragraph':
      return <p>{inline(b.c, ctx)}</p>

    case 'math': {
      const id = b.anchor ? ctx.idFor(b.anchor) : undefined
      return (
        <div className="eq" id={id}>
          <div
            className="eq-body"
            dangerouslySetInnerHTML={{ __html: renderMath(b.tex, true) }}
          />
          <div className="eq-n">{b.num ? `(${b.num})` : ''}</div>
          <button className="eq-copy" type="button" data-copy-tex={b.tex}>
            Copy TeX
          </button>
        </div>
      )
    }

    case 'theorem':
      return (
        <section className="stmt" id={ctx.idFor(b.anchor)} data-env={b.env}>
          <p className="stmt-h">
            {b.name} {b.num}
            {b.title && <span className="t">({inline(b.title, ctx)})</span>}
          </p>
          {blocks(b.blocks, ctx)}
        </section>
      )

    case 'proof':
      return (
        <div className="proof">
          <p className="proof-h">{b.title ? inline(b.title, ctx) : 'Proof'}</p>
          {blocks(b.blocks, ctx)}
        </div>
      )

    case 'box':
      return (
        <aside className="box" data-variant={b.variant}>
          {(b.title || b.variant !== 'key') && (
            <p className="box-h">{b.title ? inline(b.title, ctx) : b.name}</p>
          )}
          {blocks(b.blocks, ctx)}
        </aside>
      )

    case 'list': {
      const items = b.items.map((it, i) => <li key={i}>{blocks(it.blocks, ctx)}</li>)
      return b.ordered ? <ol>{items}</ol> : <ul>{items}</ul>
    }

    case 'table':
      return (
        <figure className="tablewrap" id={ctx.idFor(b.anchor)}>
          {b.caption && (
            <figcaption>
              <b>Table {b.num}</b>
              {inline(b.caption, ctx)}
            </figcaption>
          )}
          <div className="tablescroll">
            <table>
              {b.head && (
                <thead>
                  <tr>
                    {b.head.map((c, i) => (
                      <th key={i}>{inline(c, ctx)}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{inline(c, ctx)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )

    default:
      return null
  }
}
