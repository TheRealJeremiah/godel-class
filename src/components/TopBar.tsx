import { useEffect, useState } from 'react'
import { chapters } from '../lib/course'
import { getProgress, usePref, useProgress } from '../lib/progress'
import { setSoundEnabled } from '../lib/sound'
import { renderInline } from '../lib/highlight'

interface Props {
  progress?: { done: number; total: number }
  headings?: { text: string; slug: string }[]
}

function ChapterLink({ i }: { i: number }) {
  const c = chapters[i]
  const p = useProgress(c.id)
  const done = Math.min(p.passed, c.gateCount)
  const current = location.hash === `#/c/${c.id}`
  return (
    <a href={`#/c/${c.id}`} className={`drawer-chapter ${current ? 'current' : ''}`}>
      <span className="num">{i + 1}</span>
      <span className="t">
        {c.title} {c.emoji}
      </span>
      <span className={`count ${done === c.gateCount ? 'complete' : ''}`}>
        {done === c.gateCount ? '✓' : `${done}/${c.gateCount}`}
      </span>
    </a>
  )
}

export function TopBar({ progress, headings }: Props) {
  const [drawer, setDrawer] = useState(false)
  const [toc, setToc] = useState(false)
  const [sound, setSound] = usePref<'on' | 'off'>('sound', 'on')
  const [theme, setTheme] = usePref<'auto' | 'light' | 'dark'>('theme', 'auto')

  useEffect(() => setSoundEnabled(sound === 'on'), [sound])
  useEffect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => {
    const close = () => {
      setDrawer(false)
      setToc(false)
    }
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const pct = progress && progress.total ? (progress.done / progress.total) * 100 : 0
  const nextTheme = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto'

  return (
    <>
      <div className="topbar">
        <button className="menu-btn" onClick={() => setDrawer(true)} aria-label="Open course menu">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        {progress ? (
          <div className="progress-pill">
            <div className="progress-fill" style={{ width: `max(${pct}%, 22px)` }} />
            <span className="progress-count">
              {progress.done}/{progress.total}
            </span>
            {headings && headings.length > 0 && (
              <button className="toc-btn" onClick={() => setToc(!toc)} aria-label="Sections in this chapter">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                  <path
                    d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            {toc && headings && (
              <div className="toc-pop" onMouseLeave={() => setToc(false)}>
                {headings.map((h) => (
                  <button
                    key={h.slug}
                    onClick={() => {
                      document.getElementById(h.slug)?.scrollIntoView({ behavior: 'smooth' })
                      setToc(false)
                    }}
                    dangerouslySetInnerHTML={{ __html: renderInline(h.text) }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <a className="brand" href="#/">
            Unprovable!
          </a>
        )}

        <div className="top-actions">
          <button
            className="icon-btn"
            onClick={() => setSound(sound === 'on' ? 'off' : 'on')}
            aria-label={sound === 'on' ? 'Mute sounds' : 'Unmute sounds'}
            title={sound === 'on' ? 'Sounds on' : 'Sounds off'}
          >
            {sound === 'on' ? '🔊' : '🔇'}
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Theme: ${theme}. Switch to ${nextTheme}`}
            title={`Theme: ${theme}`}
          >
            {theme === 'auto' ? '🌗' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
          <nav className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Course menu">
            <div className="drawer-head">
              <a href="#/" className="drawer-title">
                Unprovable! 🐍
              </a>
              <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                ✕
              </button>
            </div>
            <div className="drawer-section">Chapters</div>
            {chapters.map((_, i) => (
              <ChapterLink key={i} i={i} />
            ))}
            <div className="drawer-section">Reference</div>
            <a className="drawer-link" href="#/cheatsheet">
              Lean cheat sheet 📋
            </a>
            <a className="drawer-link" href="#/glossary">
              Glossary of translated words 📖
            </a>
            <a className="drawer-link" href="#/source">
              The complete Lean proof ✓
            </a>
            <div className="drawer-foot">
              {chapters.reduce((n, c) => n + Math.min(getProgress(c.id).passed, c.gateCount), 0)} of{' '}
              {chapters.reduce((n, c) => n + c.gateCount, 0)} steps done
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
