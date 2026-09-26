import { papers, type Paper } from './papers'

export type Podcast = Paper & {
  file: string
  /** Runtime in seconds. */
  duration: number
  episode: string
  blurb: string
}

const meta: Record<Paper['id'], { file: string; duration: number; episode: string; blurb: string }> = {
  why: {
    file: '/podcasts/shape-of-reality.m4a',
    duration: 2903,
    episode: 'Episode I',
    blurb:
      'A conversation through the three premises and what they force — identity, no brute facts, and the five postulates that follow.',
  },
  what: {
    file: '/podcasts/the-klein-block.m4a',
    duration: 2807,
    episode: 'Episode II',
    blurb:
      'Walking the classification theorem that leaves exactly one four-manifold standing, and what that topology costs.',
  },
  how: {
    file: '/podcasts/twisted-dynamics-on-the-klein-block.m4a',
    duration: 2552,
    episode: 'Episode III',
    blurb:
      'Putting fields, fermions and anomalies on the block, and naming the calculations that are still left open.',
  },
}

export const podcasts: Podcast[] = papers.map((p) => ({ ...p, ...meta[p.id] }))

export const byPodcastId = (id: string) => podcasts.find((p) => p.id === id)

/** "53:22" for under an hour, "1:02:08" past it. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
