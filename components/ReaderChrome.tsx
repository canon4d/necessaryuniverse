'use client'

import { useEffect, useRef } from 'react'

/**
 * Two small jobs that both want a single document-level listener:
 * the reading progress hairline, and the "Copy TeX" affordance on equations
 * (delegated, so the equations themselves stay server-rendered and JS-free).
 */
export default function ReaderChrome() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    function update() {
      raf = 0
      const doc = document.documentElement
      const span = doc.scrollHeight - window.innerHeight
      const p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0
      bar.current?.style.setProperty('--p', String(p))
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    async function onClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-copy-tex]')
      if (!btn) return
      const tex = btn.getAttribute('data-copy-tex') || ''
      const original = btn.textContent
      try {
        await navigator.clipboard.writeText(tex)
        btn.textContent = 'Copied'
      } catch {
        btn.textContent = 'Press ⌘C'
      }
      window.setTimeout(() => {
        btn.textContent = original
      }, 1400)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return <div className="progress" ref={bar} aria-hidden="true" />
}
