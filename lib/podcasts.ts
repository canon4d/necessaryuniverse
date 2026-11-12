import { works, type Paper } from './papers'

export type Podcast = Paper & {
  file: string
  /** Runtime in seconds. */
  duration: number
  episode: string
  blurb: string
  /** Spoken-episode name when it is longer than the paper title. */
  episodeTitle?: string
}

const meta: Record<
  Paper['id'],
  { file: string; duration: number; episode: string; blurb: string; episodeTitle?: string }
> = {
  why: {
    file: '/podcasts/shape-of-reality.m4a',
    duration: 2682,
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
  'studies-1': {
    file: '/podcasts/klein-block-studies-i.m4a',
    duration: 2951,
    episode: 'Studies I',
    episodeTitle: 'Klein Block Studies I: Topological Necessity of Conformal Nodal Hypersurfaces',
    blurb:
      'A conversation through the nodal hypersurface the topology forces, the free-boundary face condition, and the Pell-tower modes that survive on the block.',
  },
}

export const podcasts: Podcast[] = works.map((p) => ({ ...p, ...meta[p.id] }))

export const documentPodcasts = podcasts.filter((p) => p.kind === 'document')
export const studyPodcasts = podcasts.filter((p) => p.kind === 'study')

export const byPodcastId = (id: string) => podcasts.find((p) => p.id === id)

export function podcastTitle(p: Podcast): string {
  return p.episodeTitle ?? p.title
}

/** "53:22" for under an hour, "1:02:08" past it. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** ISO 8601 duration from the same whole-second value formatDuration uses. */
export function isoDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  let out = 'PT'
  if (h > 0) out += `${h}H`
  if (m > 0 || h > 0) out += `${m}M`
  out += `${sec}S`
  return out
}
