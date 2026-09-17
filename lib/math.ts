import katex from 'katex'
import { allMacros } from './content'

/**
 * Every \providecommand from the three LaTeX preambles is handed to KaTeX, so
 * \Klein, \Sthree, \Diff and friends typeset on the web exactly as they do in
 * the PDFs. Rendering happens at build time; the browser ships no math JS.
 */
const MACROS = allMacros()

const cache = new Map<string, string>()

export function renderMath(tex: string, display = false): string {
  const key = (display ? 'd\u0000' : 'i\u0000') + tex
  const hit = cache.get(key)
  if (hit !== undefined) return hit

  let html: string
  try {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      errorColor: '#8A3B4A',
      strict: false,
      trust: false,
      output: 'htmlAndMathml',
      macros: { ...MACROS },
    })
  } catch {
    html = `<span class="math-fallback">${escapeHtml(tex)}</span>`
  }
  cache.set(key, html)
  return html
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
