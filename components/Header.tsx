'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { documents, paperHref, studies } from '@/lib/papers'
import SearchPalette from './SearchPalette'

function SeriesGlyph() {
  // Brand mark: rounded badge, orbit ring, and the accent line that cuts across it.
  return (
    <svg className="mark-glyph" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g clipPath="url(#nu-mark-clip)">
        <path
          d="M26 0H6C2.68629 0 0 2.68629 0 6V26C0 29.3137 2.68629 32 6 32H26C29.3137 32 32 29.3137 32 26V6C32 2.68629 29.3137 0 26 0Z"
          fill="#14191E"
        />
        <path
          opacity="0.45"
          d="M16 28C18.7614 28 21 22.6274 21 16C21 9.37258 18.7614 4 16 4C13.2386 4 11 9.37258 11 16C11 22.6274 13.2386 28 16 28Z"
          stroke="#EEEFEA"
          strokeWidth="1.4"
        />
        <path d="M6.80835 12.343L25.3177 19.6477" stroke="#C2717F" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M16 22.4C22.6274 22.4 28 19.5346 28 16C28 12.4654 22.6274 9.60001 16 9.60001C9.37258 9.60001 4 12.4654 4 16C4 19.5346 9.37258 22.4 16 22.4Z"
          stroke="#EEEFEA"
          strokeWidth="1.4"
        />
      </g>
      <defs>
        <clipPath id="nu-mark-clip">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function pathStarts(path: string, href: string) {
  const p = path.endsWith('/') ? path : `${path}/`
  const h = href.endsWith('/') ? href : `${href}/`
  return p === h || p.startsWith(h)
}

function StudiesNav({ path }: { path: string }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<Array<HTMLAnchorElement | null>>([])
  const closeTimer = useRef<number | null>(null)
  const menuId = useId()
  const active = pathStarts(path, '/studies/')
  const entries = [
    ...studies.map((s) => ({ href: paperHref(s), label: s.title })),
    { href: '/studies/', label: 'All studies' },
  ]

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function openNow() {
    clearCloseTimer()
    setOpen(true)
  }

  function closeNow(focusTrigger = false) {
    clearCloseTimer()
    setOpen(false)
    if (focusTrigger) btnRef.current?.focus()
  }

  useEffect(() => () => clearCloseTimer(), [])

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) closeNow(true)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      closeNow(true)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function canHover() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }

  function onWrapEnter() {
    if (!canHover()) return
    openNow()
  }

  function onWrapLeave() {
    if (!canHover()) return
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      setOpen(false)
    }, 250)
  }

  function focusItem(index: number) {
    const items = itemsRef.current.filter((el): el is HTMLAnchorElement => Boolean(el))
    if (items.length === 0) return
    const i = (index + items.length) % items.length
    items[i]?.focus()
  }

  function onButtonKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const index = e.key === 'ArrowDown' ? 0 : entries.length - 1
      openNow()
      requestAnimationFrame(() => focusItem(index))
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      closeNow(true)
    }
  }

  function onMenuKey(e: React.KeyboardEvent) {
    const items = itemsRef.current.filter((el): el is HTMLAnchorElement => Boolean(el))
    const i = items.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusItem(i < 0 ? 0 : i + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusItem(i < 0 ? items.length - 1 : i - 1)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeNow(true)
    } else if (e.key === 'Tab') {
      closeNow(false)
    }
  }

  return (
    <div
      className="nav-dd"
      ref={wrapRef}
      onMouseEnter={onWrapEnter}
      onMouseLeave={onWrapLeave}
    >
      <button
        ref={btnRef}
        className="nav-dd-btn"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          clearCloseTimer()
          setOpen((o) => !o)
        }}
        onKeyDown={onButtonKey}
      >
        Studies
        <span className="nav-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div id={menuId} className="nav-menu" role="group" aria-label="Studies" onKeyDown={onMenuKey}>
          {entries.map((entry, i) => {
            const isAll = entry.href === '/studies/'
            const here = isAll
              ? path === '/studies' || path === '/studies/'
              : pathStarts(path, entry.href)
            return (
              <Link
                key={entry.href}
                href={entry.href}
                ref={(el) => {
                  itemsRef.current[i] = el
                }}
                aria-current={here ? 'page' : undefined}
                className={isAll ? 'nav-menu-all' : undefined}
                onClick={() => closeNow(false)}
              >
                {entry.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
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

  const isActive = (href: string) => {
    const norm = (s: string) => (s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s)
    return norm(path) === norm(href)
  }

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
            {documents.map((p) => (
              <Link
                key={p.id}
                href={paperHref(p)}
                aria-current={isActive(paperHref(p)) ? 'page' : undefined}
              >
                <span className="rn">{p.numeral}</span>
                {p.key}
              </Link>
            ))}
            <StudiesNav path={path} />
            <Link href="/podcasts/" aria-current={isActive('/podcasts/') ? 'page' : undefined}>
              Listen
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
