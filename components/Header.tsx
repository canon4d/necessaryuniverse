'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { papers } from '@/lib/papers'
import SearchPalette from './SearchPalette'

function SeriesGlyph() {
  // S³ fibres carried once around S¹, returning reversed: the series mark.
  return (
    <svg className="mark-glyph" viewBox="0 0 26 26" aria-hidden="true">
      <ellipse cx="13" cy="13" rx="11.2" ry="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="13" cy="13" rx="4.6" ry="11.2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <path d="M4.2 9.6 L21.8 16.4" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function Header() {
  const path = usePathname() || '/'
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const el = document.documentElement
    setTheme((el.getAttribute('data-theme') as 'light' | 'dark') || 'light')
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('nu-theme', next)
    } catch {
      /* storage may be unavailable; the choice simply won't persist */
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) => path === href || path === `${href}/`

  return (
    <>
      <header className="hdr">
        <div className="hdr-in">
          <Link href="/" className="mark">
            <SeriesGlyph />
            <span className="mark-name">
              Necessary Universe
            </span>
          </Link>

          <nav className="hdr-nav" aria-label="Papers">
            {papers.map((p) => (
              <Link
                key={p.id}
                href={`/${p.id}`}
                aria-current={isActive(`/${p.id}`) ? 'page' : undefined}
              >
                <span className="rn">{p.numeral}</span>
                {p.key}
              </Link>
            ))}
            <Link href="/argument" aria-current={isActive('/argument') ? 'page' : undefined}>
              Argument
            </Link>
          </nav>

          <div className="hdr-tools">
            <button className="search-btn" type="button" onClick={() => setSearchOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="lbl">Search the series</span>
              <kbd>⌘K</kbd>
            </button>

            <button
              className="icon-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.3" />
                  <path
                    d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M13.5 10.2A5.8 5.8 0 0 1 5.8 2.5a5.8 5.8 0 1 0 7.7 7.7Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
  )
}
