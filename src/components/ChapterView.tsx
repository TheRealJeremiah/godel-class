import { useEffect, useMemo, useRef } from 'react'
import type { Block, Chapter } from '../lib/parse'
import { chapters } from '../lib/course'
import { resetProgress, setProgress, useProgress, getProgress } from '../lib/progress'
import { sounds } from '../lib/sound'
import { Blocks } from './Blocks'
import { Question } from './Question'
import { TopBar } from './TopBar'

type Gate = Extract<Block, { kind: 'continue' | 'question' }>

interface Segment {
  blocks: Block[]
  gate: Gate | null
}

function segmentsOf(ch: Chapter): Segment[] {
  const segs: Segment[] = []
  let cur: Block[] = []
  for (const b of ch.blocks) {
    if (b.kind === 'continue' || b.kind === 'question') {
      segs.push({ blocks: cur, gate: b })
      cur = []
    } else {
      cur.push(b)
    }
  }
  segs.push({ blocks: cur, gate: null })
  return segs
}

export function ChapterView({ chapter }: { chapter: Chapter }) {
  const progress = useProgress(chapter.id)
  const segs = useMemo(() => segmentsOf(chapter), [chapter])
  const passed = Math.min(progress.passed, chapter.gateCount)
  const finished = passed >= chapter.gateCount
  const lastPassed = useRef(passed)
  const idx = chapters.findIndex((c) => c.id === chapter.id)
  const next = chapters[idx + 1]

  // When a gate is passed, glide down to the newly revealed content.
  useEffect(() => {
    if (passed > lastPassed.current) {
      const el = document.getElementById(`seg-${passed}`)
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      if (passed === chapter.gateCount) sounds.fanfare()
    }
    lastPassed.current = passed
  }, [passed, chapter.gateCount])

  useEffect(() => {
    document.title = `${chapter.title} · Unprovable!`
    window.scrollTo(0, 0)
    lastPassed.current = getProgress(chapter.id).passed
  }, [chapter.id, chapter.title])

  const pass = (gate: number) => {
    const p = getProgress(chapter.id)
    if (gate === p.passed) setProgress(chapter.id, { ...p, passed: p.passed + 1 })
  }

  const visible = segs.slice(0, passed + 1)
  const headings = visible.flatMap((s) =>
    s.blocks.filter((b): b is Extract<Block, { kind: 'heading' }> => b.kind === 'heading'),
  )
  const questions = segs.filter((s) => s.gate?.kind === 'question').map((s) => s.gate!.gate)
  const answered = questions.filter((g) => progress.answers[g])
  const firstTry = answered.filter((g) => progress.answers[g].firstTry).length

  return (
    <>
      <TopBar
        progress={{ done: passed, total: chapter.gateCount }}
        headings={headings.map((h) => ({ text: h.text, slug: h.slug }))}
      />
      <main className="chapter">
        <header className="chapter-header">
          <div className="chapter-kicker">
            Chapter {idx + 1} of {chapters.length}
          </div>
          <h1>
            {chapter.title} <span className="emoji">{chapter.emoji}</span>
          </h1>
          <p className="subtitle">{chapter.subtitle}</p>
        </header>

        {visible.map((seg, i) => (
          <section key={i} id={`seg-${i}`} className={`segment ${i > 0 ? 'revealed' : ''}`}>
            <Blocks blocks={seg.blocks} />
            {seg.gate?.kind === 'continue' && (
              <div className="continue">
                <button
                  className={`btn ${i < passed ? 'used' : 'primary'}`}
                  disabled={i < passed}
                  onClick={() => {
                    sounds.pop()
                    pass(seg.gate!.gate)
                  }}
                >
                  {seg.gate.label}
                </button>
              </div>
            )}
            {seg.gate?.kind === 'question' && (
              <Question
                q={seg.gate}
                seed={`${chapter.id}:${seg.gate.gate}`}
                answer={progress.answers[seg.gate.gate]}
                done={i < passed}
                active={i === passed}
                onAnswer={(a) => {
                  const p = getProgress(chapter.id)
                  setProgress(chapter.id, {
                    ...p,
                    answers: { ...p.answers, [seg.gate!.gate]: a },
                  })
                }}
                onPass={() => pass(seg.gate!.gate)}
              />
            )}
          </section>
        ))}

        {finished && (
          <section className="chapter-end">
            <div className="done-card">
              <div className="done-emoji">🎉</div>
              <h2>Chapter complete!</h2>
              {questions.length > 0 && (
                <p>
                  You got <strong>{firstTry}</strong> of <strong>{questions.length}</strong> questions right
                  on the first try.
                </p>
              )}
              <button
                className="linkish"
                onClick={() => {
                  if (confirm('Reset your progress in this chapter?')) resetProgress(chapter.id)
                }}
              >
                Reset this chapter
              </button>
            </div>
            {next ? (
              <a className="next-card" href={`#/c/${next.id}`}>
                <div className="next-label">Next up · Chapter {idx + 2}</div>
                <div className="next-title">
                  {next.title} {next.emoji}
                </div>
                <div className="next-blurb">{next.blurb}</div>
              </a>
            ) : (
              <a className="next-card" href="#/">
                <div className="next-label">That's the whole course!</div>
                <div className="next-title">Back to the start 🐍</div>
                <div className="next-blurb">
                  Or read the <a href="#/source">complete Lean proof</a> from top to bottom.
                </div>
              </a>
            )}
          </section>
        )}
      </main>
    </>
  )
}
