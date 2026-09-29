import { useContext, useState } from 'react'
import type { Block } from '../lib/parse'
import { emptyExercise, updateExercise, useProgress, type ExerciseState } from '../lib/progress'
import { ChapterContext } from '../lib/chapterContext'
import { exercises } from '../exercises'
import { kindLabel } from '../exercises/types'
import { sounds } from '../lib/sound'
import { Blocks } from './Blocks'

type ExerciseBlock = Extract<Block, { kind: 'exercise' }>

export function Exercise({ b }: { b: ExerciseBlock }) {
  const ctx = useContext(ChapterContext)
  const progress = useProgress(ctx?.chapterId ?? '')
  const [confirmSolution, setConfirmSolution] = useState(false)
  const def = exercises[b.id]
  if (!ctx || !def) return <div className="error">Missing exercise “{b.id}”</div>

  const state: ExerciseState = progress.exercises?.[b.id] ?? emptyExercise
  const update = (patch: Partial<ExerciseState>) => updateExercise(ctx.chapterId, b.id, patch)
  const attempt = (correct: boolean) => {
    if (correct) sounds.correct()
    else sounds.wrong()
    update({ attempts: state.attempts + 1, solved: state.solved || correct })
  }
  const { Widget } = def

  return (
    <section className={`exercise ${state.solved ? 'solved' : ''}`} id={`exercise-${b.id}`}>
      <header className="ex-head">
        <span className="ex-num">
          Exercise {ctx.chapterNum}.{b.num}
        </span>
        <span className="ex-kind">{kindLabel[def.kind]}</span>
        {state.solved && <span className="ex-solved">✓ Solved</span>}
      </header>
      <h3 className="ex-title">{b.title}</h3>
      <Blocks blocks={b.prompt} />

      <Widget state={state} update={update} attempt={attempt} />

      <div className="ex-help">
        {b.hints.slice(0, state.hintsShown).map((h, i) => (
          <div key={i} className="ex-hint">
            <div className="ex-hint-label">Hint {i + 1}</div>
            <Blocks blocks={h} />
          </div>
        ))}
        <div className="ex-help-buttons">
          {state.hintsShown < b.hints.length && (
            <button className="btn small" onClick={() => update({ hintsShown: state.hintsShown + 1 })}>
              💡 Show a hint ({state.hintsShown + 1} of {b.hints.length})
            </button>
          )}
          {!state.solutionShown && (
            <button
              className="btn small"
              onClick={() => {
                if (state.solved || state.attempts >= 2 || confirmSolution) update({ solutionShown: true })
                else setConfirmSolution(true)
              }}
            >
              {confirmSolution ? 'Sure? Click again to show it' : '📖 Show the solution'}
            </button>
          )}
        </div>
        {state.solutionShown && (
          <div className="ex-solution">
            <div className="ex-hint-label">Solution</div>
            <Blocks blocks={b.solution} />
          </div>
        )}
      </div>
      {state.attempts > 0 && (
        <div className="ex-meta">
          {state.attempts} {state.attempts === 1 ? 'attempt' : 'attempts'}
        </div>
      )}
    </section>
  )
}
