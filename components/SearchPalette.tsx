'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Entry = { p: string; a: string; k: string; n: string; t: string; s: string; x: string }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const KEY_LABEL: Record<string, string> = { why: 'Why', what: 'What', how: 'How' }

function score(e: Entry, q: string): number {
  const t = e.t.toLowerCase()
  const s = e.s.toLowerCase()
  const x = e.x.toLowerCase()
  const n = (e.k + ' ' + e.n).toLowerCase()
  if (n === q || t === q) return 0
  if (n.startsWith(q)) return 1
  if (t.startsWith(q)) return 2
  if (t.includes(q)) return 3
  if (n.includes(q)) return 4
  if (s.includes(q)) return 5
  if (x.includes(q)) return 6
  return Infinity
}

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    let live = true
    fetch(`${BASE}/search.json`)
      .then((r) => r.json())
      .then((d: Entry[]) => live && setEntries(d))
      .catch(() => live && setEntries([]))
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const results = useMemo(() => {
    if (!entries) return []
    const query = q.trim().toLowerCase()
    if (!query) {
      return entries.filter((e) => e.k === 'Section').slice(0, 40)
    }
    return entries
      .map((e) => ({ e, s: score(e, query) }))
      .filter((r) => r.s !== Infinity)
      .sort((a, b) => a.s - b.s)
      .slice(0, 60)
      .map((r) => r.e)
  }, [entries, q])

  useEffect(() => setCursor(0), [q])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-on="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor, results])

  function go(e: Entry) {
    onClose()
    router.push(`/${e.p}#${e.a}`)
  }

  function onKey(ev: React.KeyboardEvent) {
    if (ev.key === 'Escape') return onClose()
    if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    }
    if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    }
    if (ev.key === 'Enter' && results[cursor]) {
      ev.preventDefault()
      go(results[cursor])
    }
  }

  return (
    <div
      className="palette-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Search the series"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="palette" onKeyDown={onKey}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a section, theorem, postulate, table or equation"
          aria-label="Search the series"
        />

        <div className="palette-list" ref={listRef}>
          {entries === null && <p className="palette-empty">Loading the index…</p>}

          {entries !== null && results.length === 0 && (
            <p className="palette-empty">
              Nothing matches “{q}”. Try a theorem number, or a word from a section title.
            </p>
          )}

          {results.map((e, i) => (
            <button
              key={`${e.p}-${e.a}-${i}`}
              type="button"
              className="palette-item"
              data-on={i === cursor}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(e)}
            >
              <span className="kind">
                {e.k === 'Section' ? KEY_LABEL[e.p] : `${e.k === 'Equation' ? 'Eq.' : e.k} ${e.n}`}
              </span>
              <span>
                <span className="ttl">{e.t}</span>
                <span className="sub">
                  {KEY_LABEL[e.p]}
                  {e.s ? ` · ${e.s}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑↓</kbd>Move
          </span>
          <span>
            <kbd>↵</kbd>Open
          </span>
          <span>
            <kbd>esc</kbd>Close
          </span>
        </div>
      </div>
    </div>
  )
}
