import { useEffect, useMemo, useRef, useState } from 'react'
import type { Block } from '../lib/parse'
import type { Answer } from '../lib/progress'
import { renderInline } from '../lib/highlight'
import { sounds } from '../lib/sound'
import { Blocks } from './Blocks'

type QuestionBlock = Extract<Block, { kind: 'question' }>

/** A stable per-question shuffle, so the right answer isn't always in the same place.
 *  Yes/No-style pairs keep their natural order. Answers are stored by original index. */
function displayOrder(q: QuestionBlock, seed: string): number[] {
  const idx = q.options.map((_, i) => i)
  const labels = q.options.map((o) => o.label.trim().toLowerCase())
  if (idx.length === 2 && /^(yes|no)\b/.test(labels[0]) && /^(yes|no)\b/.test(labels[1])) {
    return labels[0].startsWith('yes') ? [0, 1] : [1, 0]
  }
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

interface Props {
  q: QuestionBlock
  seed: string
  answer?: Answer
  done: boolean
  active: boolean
  onAnswer: (a: Answer) => void
  onPass: () => void
}

export function Question({ q, seed, answer, done, active, onAnswer, onPass }: Props) {
  const order = useMemo(() => displayOrder(q, seed), [q, seed])
  const [choice, setChoice] = useState<number | null>(answer?.choice ?? null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  const choose = (i: number) => {
    if (choice !== null || done) return
    const v = q.options[i].verdict
    setChoice(i)
    onAnswer({ choice: i, firstTry: answer ? answer.firstTry : v !== 'wrong' })
    if (v === 'wrong') {
      sounds.wrong()
      requestAnimationFrame(() =>
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      )
    } else {
      sounds.correct()
      onPass()
    }
  }

  // Number keys pick an option on the active question.
  useEffect(() => {
    if (!active || done || choice !== null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const n = Number(e.key)
      if (n >= 1 && n <= q.options.length) choose(order[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const chosen = choice !== null ? q.options[choice] : null
  const correctIdx = q.options.findIndex((o) => o.verdict === 'correct')
  const status = chosen?.verdict

  return (
    <div className="question">
      <Blocks blocks={q.prompt} />
      <div className="options" role="group">
        {order.map((i, pos) => {
          const o = q.options[i]
          const cls = [
            'btn',
            'option',
            choice === i ? `chosen ${o.verdict}` : '',
            choice !== null && choice !== i ? 'faded' : '',
            choice !== null && status === 'wrong' && i === correctIdx ? 'reveal' : '',
          ].join(' ')
          return (
            <button
              key={i}
              className={cls}
              disabled={choice !== null || done}
              onClick={() => choose(i)}
              title={active && choice === null ? `Press ${pos + 1}` : undefined}
            >
              <span dangerouslySetInnerHTML={{ __html: renderInline(o.label) }} />
            </button>
          )
        })}
        {status === 'wrong' && !done && (
          <button
            className="retry"
            onClick={() => setChoice(null)}
            title="Try again"
            aria-label="Try again"
          >
            ↺
          </button>
        )}
      </div>

      {chosen && (
        <div className={`feedback ${status}`} ref={feedbackRef}>
          <div className="verdict">
            {status === 'correct' ? 'Correct!' : status === 'wrong' ? 'Not quite' : 'Noted!'}
          </div>
          <Blocks blocks={chosen.feedback} />
          {status === 'wrong' && correctIdx >= 0 && (
            <div className="the-answer">
              <p>
                The answer:{' '}
                <strong dangerouslySetInnerHTML={{ __html: renderInline(q.options[correctIdx].label) }} />
              </p>
              <Blocks blocks={q.options[correctIdx].feedback} />
            </div>
          )}
          {status === 'wrong' && !done && (
            <div className="feedback-actions">
              <button className="btn" onClick={() => setChoice(null)}>
                Let me try again
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  sounds.pop()
                  onPass()
                }}
              >
                Got it, continue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
