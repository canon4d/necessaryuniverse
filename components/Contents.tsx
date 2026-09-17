'use client'

import { useEffect, useRef, useState } from 'react'

type Item = { level: number; num: string | null; anchor: string; text: string }

export default function Contents({
  items,
  extras,
}: {
  items: Item[]
  extras: { href: string; label: string }[]
}) {
  const [active, setActive] = useState<string>(items[0]?.anchor ?? '')
  const [open, setOpen] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.anchor))
      .filter((el): el is HTMLElement => Boolean(el))
    if (targets.length === 0) return

    function update() {
      ticking.current = false
      const line = window.scrollY + window.innerHeight * 0.28
      let current = targets[0]
      for (const el of targets) {
        if (el.offsetTop <= line) current = el
        else break
      }
      setActive(current.id)
    }

    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  const activeItem = items.find((i) => i.anchor === active)

  return (
    <nav className="toc" aria-label="Contents" data-open={open}>
      <button
        className="toc-toggle"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{open ? 'Contents' : activeItem ? activeItem.text : 'Contents'}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d={open ? 'M3 10l5-5 5 5' : 'M3 6l5 5 5-5'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <p className="toc-h">Contents</p>
      <ol>
        {items.map((i) => (
          <li key={i.anchor}>
            <a
              href={`#${i.anchor}`}
              className={`${i.level === 2 ? 'lv2' : 'lv1'}${active === i.anchor ? ' on' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="n">{i.num ?? ''}</span>
              <span>{i.text}</span>
            </a>
          </li>
        ))}
      </ol>

      {extras.length > 0 && (
        <div className="toc-jump">
          {extras.map((e) => (
            <a key={e.href} href={e.href} onClick={() => setOpen(false)}>
              {e.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
