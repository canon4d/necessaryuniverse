const katex = require('katex');
const fs = require('fs');

const path = require('path');
const root = path.join(__dirname, '..');
const data = JSON.parse(
  fs.readFileSync(process.argv[2] || path.join(root, 'content', 'papers.json'), 'utf8')
);

// KaTeX macro table derived from the LaTeX \providecommand declarations
const MACROS = {};
for (const pid of Object.keys(data)) {
  for (const [k, v] of Object.entries(data[pid].macros || {})) MACROS[k] = v;
}


let total = 0, bad = 0;
const failures = [];

function tryRender(tex, display, where) {
  total++;
  try {
    katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: false,
      trust: false,
      macros: { ...MACROS },
    });
  } catch (e) {
    bad++;
    failures.push({ where, display, tex, err: String(e.message).slice(0, 180) });
  }
}

function walkTokens(toks, where) {
  if (!Array.isArray(toks)) return;
  for (const t of toks) {
    if (!t || typeof t !== 'object') continue;
    if (t.t === 'math') tryRender(t.v, !!t.d, where + ' [inline]');
    if (t.c) walkTokens(t.c, where);
  }
}

function walkBlocks(blocks, where) {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    if (b.kind === 'math') tryRender(b.tex, true, where + ' [display]');
    if (b.c) walkTokens(b.c, where + ' ' + (b.kind || ''));
    if (b.title) walkTokens(b.title, where + ' title');
    if (b.caption) walkTokens(b.caption, where + ' caption');
    if (b.blocks) walkBlocks(b.blocks, where);
    if (b.items) for (const it of b.items) walkBlocks(it.blocks, where);
    if (b.head) for (const cell of b.head) walkTokens(cell, where + ' th');
    if (b.rows) for (const r of b.rows) for (const cell of r) walkTokens(cell, where + ' td');
  }
}

for (const pid of Object.keys(data)) {
  const p = data[pid];
  walkTokens(p.abstract, pid + ' abstract');
  walkBlocks(p.blocks, pid);
  for (const b of p.bibliography || []) walkTokens(b.c, pid + ' bib');
  for (const f of p.footnotes || []) walkTokens(f, pid + ' footnote');
}

console.log(`math expressions: ${total}   failures: ${bad}`);
if (bad > 0) process.exitCode = 1;
const seen = new Set();
for (const f of failures) {
  const key = f.err.slice(0, 80);
  if (seen.has(key) && seen.size > 30) continue;
  seen.add(key);
  console.log('\n--- ' + f.where + '\n  ERR: ' + f.err + '\n  TEX: ' + f.tex.slice(0, 260).replace(/\n/g, ' '));
}
