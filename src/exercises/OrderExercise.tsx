import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Feedback, md, type Tone } from './Feedback'
import { rng, type WidgetProps } from './types'

/** One step of a proof. Required steps list what they rely on; red herrings say why they're wrong. */
export interface Step {
  id: string
  text: string
  /** Steps that must appear earlier in the proof. */
  deps?: string[]
  /** For required steps: what the argument lacks without this step. */
  missing?: string
  /** For red herrings: why this step doesn't belong. */
  distractor?: string
}

function countOrders(steps: Step[]): number {
  const req = steps.filter((s) => !s.distractor)
  const go = (placed: Set<string>): number => {
    if (placed.size === req.length) return 1
    let n = 0
    for (const s of req) {
      if (!placed.has(s.id) && (s.deps ?? []).every((d) => placed.has(d))) n += go(new Set([...placed, s.id]))
    }
    return n
  }
  return go(new Set())
}

/**
 * Builds a "put the proof in order" exercise. The learner clicks steps into a
 * list; it's graded against the dependencies, so every valid order is accepted.
 * Required steps must be listed in a valid order (it's shown as the solution).
 */
export function orderExercise(steps: Step[], seed: number): ComponentType<WidgetProps> {
  const required = steps.filter((s) => !s.distractor)
  for (const s of required) {
    if (!s.missing) throw new Error(`Proof step ${s.id} needs a "missing" message`)
    const at = required.indexOf(s)
    for (const d of s.deps ?? []) {
      if (required.findIndex((r) => r.id === d) >= at) throw new Error(`Proof step ${s.id}: list its dependency ${d} first`)
    }
  }
  const byId = (id: string) => steps.find((s) => s.id === id)!
  const numOrders = countOrders(steps)

  return function OrderWidget({ state, attempt }: WidgetProps) {
    const pool = useMemo(() => {
      const r = rng(seed)
      const s = [...steps]
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1))
        ;[s[i], s[j]] = [s[j], s[i]]
      }
      return s
    }, [])
    const [chosen, setChosen] = useState<string[]>([])
    const [fb, setFb] = useState<{ tone: Tone; text: ReactNode } | null>(null)

    const check = () => {
      for (let i = 0; i < chosen.length; i++) {
        const s = byId(chosen[i])
        if (s.distractor) {
          attempt(false)
          setFb({ tone: 'bad', text: <>Step {i + 1} doesn't belong. {md(s.distractor)}</> })
          return
        }
        const before = new Set(chosen.slice(0, i))
        const need = (s.deps ?? []).find((d) => !before.has(d))
        if (need) {
          attempt(false)
          setFb({
            tone: 'bad',
            text: (
              <>
                Step {i + 1} ({md(s.text)}) relies on {md('“' + byId(need).text + '”')}, which hasn't been established
                yet.
              </>
            ),
          })
          return
        }
      }
      const missing = required.find((s) => !chosen.includes(s.id))
      if (missing) {
        attempt(false)
        setFb({ tone: 'bad', text: <>Not finished yet. {md(missing.missing!)}</> })
        return
      }
      attempt(true)
      setFb({
        tone: 'good',
        text:
          numOrders > 1
            ? `A valid proof! Some steps don't depend on each other, so there are ${numOrders} valid orders, and any of them is accepted.`
            : 'A valid proof! Every step follows from the ones before it.',
      })
    }

    const move = (i: number, dir: -1 | 1) => {
      const j = i + dir
      if (j < 0 || j >= chosen.length) return
      const c = [...chosen]
      ;[c[i], c[j]] = [c[j], c[i]]
      setChosen(c)
      setFb(null)
    }

    return (
      <div className="ex-widget">
        <div className="order-cols">
          <div>
            <div className="order-label">Available steps (click to add)</div>
            <div className="order-list">
              {pool
                .filter((s) => !chosen.includes(s.id))
                .map((s) => (
                  <button
                    key={s.id}
                    className="order-step"
                    onClick={() => {
                      setChosen([...chosen, s.id])
                      setFb(null)
                    }}
                  >
                    {md(s.text)}
                  </button>
                ))}
              {chosen.length === pool.length && <div className="order-empty">All steps used</div>}
            </div>
          </div>
          <div>
            <div className="order-label">Your proof</div>
            <ol className="order-proof">
              {chosen.map((id, i) => (
                <li key={id} className="order-chosen">
                  <span className="order-text">{md(byId(id).text)}</span>
                  <span className="order-actions">
                    <button onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
                      ↑
                    </button>
                    <button onClick={() => move(i, 1)} aria-label="Move down" disabled={i === chosen.length - 1}>
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        setChosen(chosen.filter((c) => c !== id))
                        setFb(null)
                      }}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
              {chosen.length === 0 && <li className="order-empty">Click steps on the left to build the proof.</li>}
            </ol>
          </div>
        </div>
        <div className="ex-row">
          <button className="btn small primary" onClick={check} disabled={chosen.length === 0}>
            Check my proof
          </button>
          <button
            className="linkish"
            onClick={() => {
              setChosen([])
              setFb(null)
            }}
          >
            start over
          </button>
        </div>
        {fb && <Feedback tone={fb.tone}>{fb.text}</Feedback>}
        {state.solutionShown && (
          <Feedback tone="info">
            One valid proof:
            <ol className="order-solution">
              {required.map((s) => (
                <li key={s.id}>{md(s.text)}</li>
              ))}
            </ol>
          </Feedback>
        )}
      </div>
    )
  }
}
