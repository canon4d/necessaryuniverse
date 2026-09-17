'use client'

import { useState } from 'react'

const TABS = ['BibTeX', 'APA', 'RIS'] as const
type Tab = (typeof TABS)[number]

export default function CitePanel({
  bibtex,
  apa,
  ris,
}: {
  bibtex: string
  apa: string
  ris: string
}) {
  const [tab, setTab] = useState<Tab>('BibTeX')
  const [copied, setCopied] = useState(false)
  const text = tab === 'BibTeX' ? bibtex : tab === 'APA' ? apa : ris

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="cite-panel" aria-label="Cite this paper">
      <div className="cite-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="cite-body">
        <pre>{text}</pre>
        <button className="cite-copy" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  )
}
