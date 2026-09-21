'use client'

import { useEffect, useRef, useState } from 'react'
import { podcasts, formatDuration, type Podcast } from '@/lib/podcasts'

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75]
const PROGRESS_KEY = 'nu-podcast-progress'

type Progress = Record<string, number>

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    return {}
  }
}

function saveProgress(id: string, seconds: number) {
  try {
    const p = loadProgress()
    p[id] = seconds
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  } catch {
    /* storage may be unavailable; playback still works, it just won't resume */
  }
}

function EqBars({ animate }: { animate: boolean }) {
  return (
    <span className={`eq${animate ? ' is-on' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.6a.8.8 0 0 1 1.22-.68l8.4 5.4a.8.8 0 0 1 0 1.36l-8.4 5.4A.8.8 0 0 1 4 13.4V2.6Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="3.2" y="2.4" width="3.4" height="11.2" rx="0.8" />
      <rect x="9.4" y="2.4" width="3.4" height="11.2" rx="0.8" />
    </svg>
  )
}

function SkipIcon({ dir }: { dir: 'back' | 'fwd' }) {
  const arc = dir === 'back' ? 'M10 3a7 7 0 1 0 6.1 10.5' : 'M10 3a7 7 0 1 1 -6.1 10.5'
  const head = dir === 'back' ? 'M10 3 13 3.6 11.8 6.4' : 'M10 3 7 3.6 8.2 6.4'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={arc} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d={head} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="10" y="13.6" textAnchor="middle" fontSize="6.2" fontFamily="var(--sans)" fill="currentColor" stroke="none">
        15
      </text>
    </svg>
  )
}

function TrackIcon({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={dir === 'prev' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M3.4 2.6a.75.75 0 0 1 1.14-.64l7.9 4.9a.75.75 0 0 1 0 1.28l-7.9 4.9a.75.75 0 0 1-1.14-.64V2.6Z" />
      <rect x="11.6" y="2.2" width="1.3" height="11.6" rx="0.4" />
    </svg>
  )
}

function VolumeIcon({ level }: { level: number }) {
  const muted = level <= 0
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.2h2.3L8 3.4v9.2L4.3 9.8H2Z" fill="currentColor" stroke="none" />
      {!muted && (
        <path
          d={level < 0.55 ? 'M10.4 6.2a2.7 2.7 0 0 1 0 3.6' : 'M10.4 5a4.6 4.6 0 0 1 0 6M12.3 3.3a7.3 7.3 0 0 1 0 9.4'}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {muted && (
        <path d="M10.6 6.4 13.6 9.6M13.6 6.4l-3 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      )}
    </svg>
  )
}

export default function PodcastPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const saveTimer = useRef<number | null>(null)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [prevVolume, setPrevVolume] = useState(1)

  const track: Podcast = podcasts[index]
  const shownDuration = duration ?? track.duration

  // Load last-played track + volume once, client-side only.
  useEffect(() => {
    try {
      const lastId = localStorage.getItem('nu-podcast-last')
      const i = podcasts.findIndex((p) => p.id === lastId)
      if (i >= 0) setIndex(i)
      const v = localStorage.getItem('nu-podcast-volume')
      if (v !== null) {
        const n = parseFloat(v)
        if (!Number.isNaN(n)) {
          setVolume(n)
          setPrevVolume(n || 1)
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply volume + rate to the element whenever they change.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    try {
      localStorage.setItem('nu-podcast-volume', String(volume))
    } catch {
      /* ignore */
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate, index])

  // When the track changes: load it, resume saved position, remember choice.
  useEffect(() => {
    setReady(false)
    setDuration(null)
    const el = audioRef.current
    if (!el) return
    const saved = loadProgress()[track.id] ?? 0
    setCurrentTime(saved)
    try {
      localStorage.setItem('nu-podcast-last', track.id)
    } catch {
      /* ignore */
    }
    const onLoaded = () => {
      setReady(true)
      setDuration(el.duration && Number.isFinite(el.duration) ? el.duration : track.duration)
      if (saved > 1 && saved < (el.duration || track.duration) - 3) {
        el.currentTime = saved
      }
      if (playing) el.play().catch(() => setPlaying(false))
    }
    el.addEventListener('loadedmetadata', onLoaded)
    return () => el.removeEventListener('loadedmetadata', onLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function selectTrack(i: number, autoplay = true) {
    if (i === index) {
      togglePlay()
      return
    }
    setIndex(i)
    setPlaying(autoplay)
  }

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play().catch(() => {})
      setPlaying(true)
    }
  }

  function skip(delta: number) {
    const el = audioRef.current
    if (!el) return
    el.currentTime = Math.min(Math.max(0, el.currentTime + delta), shownDuration)
  }

  function goRelative(delta: number) {
    const next = (index + delta + podcasts.length) % podcasts.length
    setIndex(next)
    setPlaying(true)
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value)
    setCurrentTime(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  function cycleRate() {
    const i = RATES.indexOf(rate)
    setRate(RATES[(i + 1) % RATES.length])
  }

  function toggleMute() {
    if (volume > 0) {
      setPrevVolume(volume)
      setVolume(0)
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 1)
    }
  }

  // Persist scrub position periodically while playing, and on pause/unmount.
  useEffect(() => {
    if (!playing) return
    saveTimer.current = window.setInterval(() => {
      if (audioRef.current) saveProgress(track.id, audioRef.current.currentTime)
    }, 4000)
    return () => {
      if (saveTimer.current) window.clearInterval(saveTimer.current)
    }
  }, [playing, track.id])

  useEffect(() => {
    return () => {
      if (audioRef.current) saveProgress(track.id, audioRef.current.currentTime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id])

  const pct = shownDuration > 0 ? (currentTime / shownDuration) * 100 : 0

  return (
    <div className="podcast" data-tone={track.tone}>
      <audio
        ref={audioRef}
        src={track.file}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          saveProgress(track.id, 0)
          if (index < podcasts.length - 1) {
            setIndex(index + 1)
            setPlaying(true)
          } else {
            setPlaying(false)
          }
        }}
      />

      <section className="pp-now shell" aria-label="Now playing">
        <div className="pp-now-in">
          <div className="pp-art" aria-hidden="true">
            <span>{track.numeral}</span>
          </div>

          <div className="pp-meta">
            <p className="pp-kicker">
              {track.episode} · {track.discipline}
            </p>
            <h1 className="pp-title">{track.title}</h1>
            <p className="pp-sub">{track.subtitle}</p>
          </div>
        </div>

        <div className="pp-seek">
          <input
            type="range"
            className="pp-range"
            min={0}
            max={Math.max(shownDuration, 1)}
            step={1}
            value={Math.min(currentTime, shownDuration)}
            onChange={onSeek}
            style={{ ['--pct' as string]: `${pct}%` }}
            aria-label="Seek"
            disabled={!ready}
          />
          <div className="pp-times">
            <span>{formatDuration(currentTime)}</span>
            <span>{ready ? `-${formatDuration(Math.max(shownDuration - currentTime, 0))}` : formatDuration(track.duration)}</span>
          </div>
        </div>

        <div className="pp-controls">
          <button className="pp-rate" type="button" onClick={cycleRate} aria-label="Playback speed">
            {rate}×
          </button>

          <div className="pp-transport">
            <button className="pp-icon" type="button" onClick={() => goRelative(-1)} aria-label="Previous episode">
              <TrackIcon dir="prev" />
            </button>
            <button className="pp-icon" type="button" onClick={() => skip(-15)} aria-label="Back 15 seconds">
              <SkipIcon dir="back" />
            </button>
            <button className="pp-play" type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="pp-icon" type="button" onClick={() => skip(15)} aria-label="Forward 15 seconds">
              <SkipIcon dir="fwd" />
            </button>
            <button className="pp-icon" type="button" onClick={() => goRelative(1)} aria-label="Next episode">
              <TrackIcon dir="next" />
            </button>
          </div>

          <div className="pp-volume">
            <button className="pp-icon" type="button" onClick={toggleMute} aria-label={volume > 0 ? 'Mute' : 'Unmute'}>
              <VolumeIcon level={volume} />
            </button>
            <input
              type="range"
              className="pp-range pp-range-vol"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ ['--pct' as string]: `${volume * 100}%` }}
              aria-label="Volume"
            />
          </div>
        </div>
      </section>

      <section className="pp-list shell" aria-label="Episodes">
        {podcasts.map((p, i) => {
          const isActive = i === index
          return (
            <button
              key={p.id}
              type="button"
              className={`pp-row${isActive ? ' is-active' : ''}`}
              data-tone={p.tone}
              onClick={() => selectTrack(i)}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="pp-row-num">
                {isActive ? <EqBars animate={playing} /> : p.numeral}
              </span>
              <span className="pp-row-main">
                <span className="pp-row-title">{p.title}</span>
                <span className="pp-row-blurb">{p.blurb}</span>
              </span>
              <span className="pp-row-dur">{formatDuration(p.duration)}</span>
              <span className="pp-row-play" aria-hidden="true">
                {isActive && playing ? <PauseIcon /> : <PlayIcon />}
              </span>
            </button>
          )
        })}
      </section>
    </div>
  )
}
