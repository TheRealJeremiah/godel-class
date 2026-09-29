import { useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Fixed points: which inputs does f leave unchanged?                  */

const fixedPointExamples: { name: string; domain: (number | boolean)[]; f: (x: never) => number | boolean }[] = [
  { name: 'x => x * x', domain: [0, 1, 2, 3, 4], f: ((x: number) => x * x) as never },
  { name: 'x => x + 1', domain: [0, 1, 2, 3, 4], f: ((x: number) => x + 1) as never },
  { name: 'x => 4 - x', domain: [0, 1, 2, 3, 4], f: ((x: number) => 4 - x) as never },
  { name: 'b => b', domain: [false, true], f: ((b: boolean) => b) as never },
  { name: 'b => true', domain: [false, true], f: (() => true) as never },
  { name: 'b => !b', domain: [false, true], f: ((b: boolean) => !b) as never },
]

export function FixedPoints() {
  const [k, setK] = useState(0)
  const ex = fixedPointExamples[k]
  const rows = ex.domain.map((x) => ({ x, y: ex.f(x as never) }))
  const fixed = rows.filter((r) => r.x === r.y)
  return (
    <figure className="fig">
      <div className="fig-controls">
        {fixedPointExamples.map((e, i) => (
          <button key={i} className={`chip ${i === k ? 'on' : ''}`} onClick={() => setK(i)}>
            <code>{e.name}</code>
          </button>
        ))}
      </div>
      <div className="fp-grid">
        {rows.map((r, i) => (
          <div key={i} className={`fp-cell ${r.x === r.y ? 'fixed' : ''}`}>
            <code>{String(r.x)}</code>
            <span className="fp-arrow">↦</span>
            <code>{String(r.y)}</code>
            {r.x === r.y && <span className="fp-mark">fixed!</span>}
          </div>
        ))}
      </div>
      <figcaption>
        {fixed.length === 0 ? (
          <>
            <code>{ex.name}</code> has <strong>no fixed point</strong>: it moves every input.
          </>
        ) : (
          <>
            Fixed points of <code>{ex.name}</code>: <strong>{fixed.map((r) => String(r.x)).join(', ')}</strong>
          </>
        )}
        {ex.domain.length > 2 && ' (shown on the numbers 0 to 4)'}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* A finite Lawvere/Cantor table: 3 rows can't hold all 8 rows.        */

const bits3 = Array.from({ length: 8 }, (_, n) => [(n >> 2) & 1, (n >> 1) & 1, n & 1].map(Boolean))
const key = (r: boolean[]) => r.map((b) => (b ? '1' : '0')).join('')

export function LawvereFinite() {
  const [rows, setRows] = useState<boolean[][]>([
    [true, false, true],
    [false, false, true],
    [true, true, false],
  ])
  const flip = (i: number, j: number) =>
    setRows(rows.map((r, a) => (a === i ? r.map((b, c) => (c === j ? !b : b)) : r)))
  const present = new Set(rows.map(key))
  const diag = rows.map((r, n) => !r[n])
  return (
    <figure className="fig">
      <div className="lf-wrap">
        <div>
          <div className="lf-label">Your table (click to change)</div>
          <table className="bits">
            <thead>
              <tr>
                <th />
                {[0, 1, 2].map((j) => (
                  <th key={j}>col {j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th>row {i}</th>
                  {r.map((b, j) => (
                    <td key={j} className={i === j ? 'on-diag' : ''}>
                      <button onClick={() => flip(i, j)} aria-label={`Flip row ${i} column ${j}`}>
                        {b ? '1' : '0'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="diag-row">
                <th>flipped diagonal</th>
                {diag.map((b, j) => (
                  <td key={j}>{b ? '1' : '0'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="lf-label">All 8 possible rows</div>
          <div className="lf-all">
            {bits3.map((r) => {
              const k = key(r)
              const isDiag = k === key(diag)
              return (
                <span key={k} className={`lf-row ${present.has(k) ? 'in' : 'out'} ${isDiag ? 'diag' : ''}`}>
                  <code>{k}</code> {present.has(k) ? '✓ in table' : isDiag ? '✗ missing (the diagonal!)' : '✗ missing'}
                </span>
              )
            })}
          </div>
        </div>
      </div>
      <figcaption>
        Three rows can hold at most 3 of the 8 possible rows. Whatever you do, the flipped diagonal{' '}
        <code>{key(diag)}</code> is always one of the missing ones: it differs from row <code>n</code> in column{' '}
        <code>n</code>.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* The decidability landscape.                                         */

function LandscapeSvg({ reveal }: { reveal: boolean }) {
  const q = (s: string) => (reveal ? s : '?')
  return (
    <svg viewBox="0 0 640 330" className="diagram" role="img" aria-label="Decidable properties sit where recognizable and co-recognizable overlap">
      <rect x="10" y="10" width="620" height="310" rx="16" className="box" />
      <text x="26" y="36" className="dg-small">all yes/no properties of inputs</text>
      <ellipse cx="250" cy="190" rx="170" ry="100" className="region r1" />
      <ellipse cx="390" cy="190" rx="170" ry="100" className="region r2" />
      <text x="190" y="76" textAnchor="middle" className="dg-small strong">recognizable</text>
      <text x="450" y="76" textAnchor="middle" className="dg-small strong">opposite is recognizable</text>
      <text x="320" y="170" textAnchor="middle" className="dg-small strong">decidable</text>
      <text x="320" y="196" textAnchor="middle" className="dg-code">even length</text>
      <text x="320" y="218" textAnchor="middle" className="dg-code">is a valid proof</text>
      <text x="138" y="196" textAnchor="middle" className="dg-code">{q('halts on itself')}</text>
      <text x="138" y="218" textAnchor="middle" className="dg-code">{reveal ? 'is provable' : ''}</text>
      <text x="502" y="196" textAnchor="middle" className="dg-code">{q('loops on itself')}</text>
      <text x="610" y="308" textAnchor="end" className="dg-small">{reveal ? 'outside both: halts on every input' : ''}</text>
    </svg>
  )
}

export function Landscape() {
  return (
    <figure className="fig">
      <LandscapeSvg reveal={false} />
      <figcaption>
        Post's theorem says the overlap of the two circles is <em>exactly</em> the decidable properties. Where do "halts on
        itself" and its opposite go? That's the next chapter.
      </figcaption>
    </figure>
  )
}

export function LandscapeFull() {
  return (
    <figure className="fig">
      <LandscapeSvg reveal={true} />
      <figcaption>
        Halting is recognizable but not decidable, so it sits in the left circle only, and looping sits in the right circle
        only. Some properties, like "halts on every input", are in neither.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Dovetailing: turning a recognizer into a lister.                    */

const haltTimes: (number | null)[] = [3, null, 1, 5, null, 2, 4, null]

export function Dovetail() {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing || stage >= 8) return
    const id = setTimeout(() => setStage(stage + 1), 700)
    return () => clearTimeout(id)
  }, [playing, stage])
  // At stage k, run each of inputs 0..k-1 for k steps.
  const listed: number[] = []
  for (let k = 1; k <= stage; k++) {
    for (let x = 0; x < k; x++) {
      const t = haltTimes[x]
      if (t !== null && t <= k && !listed.includes(x)) listed.push(x)
    }
  }
  return (
    <figure className="fig">
      <div className="fig-controls">
        <button className="btn small" onClick={() => setStage(Math.min(8, stage + 1))}>
          Next stage
        </button>
        <button className="btn small" onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button className="linkish" onClick={() => { setStage(0); setPlaying(false) }}>
          reset
        </button>
        <span>
          Stage <strong>{stage}</strong>: run inputs 0 to {Math.max(0, stage - 1)} for {stage} steps each
        </span>
      </div>
      <div className="dt-grid">
        {haltTimes.map((t, x) => {
          const started = x < stage
          const steps = started ? stage : 0
          const done = t !== null && started && steps >= t
          return (
            <div key={x} className="dt-row">
              <span className="dt-x">input {x}</span>
              <span className="dt-track">
                {Array.from({ length: 8 }, (_, s) => (
                  <span
                    key={s}
                    className={`tick ${s < Math.min(steps, done ? t! : steps) ? 'tried' : ''} ${done && s === t! - 1 ? 'found' : ''}`}
                  />
                ))}
              </span>
              <span className="dt-status">{done ? `halted after ${t} steps ✓` : started ? 'still running…' : ''}</span>
            </div>
          )
        })}
      </div>
      <div className="dt-out">
        Printed so far: <code>{listed.length ? listed.join(', ') : '(nothing yet)'}</code>
      </div>
      <figcaption>
        The recognizer halts on some inputs (after a hidden number of steps) and loops on others. We never wait on any one
        input: each stage starts a new input and gives every started input one more step. Every input the recognizer
        halts on gets printed eventually; the ones it loops on never do.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* The four outcomes for a statement: which property rules out which.  */

export function FourOutcomes() {
  const cell = (title: string, body: string, tags: [string, string][], tone: string) => (
    <div className={`fo-cell ${tone}`}>
      <div className="fo-title">{title}</div>
      <div className="fo-body">{body}</div>
      <div className="fo-tags">
        {tags.map(([k, t]) => (
          <span key={t} className={`fo-tag ${k}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <figure className="fig">
      <div className="fo-grid">
        <div />
        <div className="fo-head">doesn't prove <code>neg s</code></div>
        <div className="fo-head">proves <code>neg s</code></div>
        <div className="fo-side">doesn't prove <code>s</code></div>
        {cell('Neither', 'A blank: the question is left unanswered.', [['complete', 'ruled out by COMPLETE']], 'gap')}
        {cell('Only neg s', 'Fine, as long as neg s is the true one.', [['sound', 'SOUND: must be true']], 'ok')}
        <div className="fo-side">proves <code>s</code></div>
        {cell('Only s', 'Fine, as long as s is the true one.', [['sound', 'SOUND: must be true']], 'ok')}
        {cell('Both', 'A contradiction: one of them must be false.', [['consistent', 'ruled out by CONSISTENT'], ['sound', 'and by SOUND']], 'bad')}
      </div>
      <figcaption>
        For one statement <code>s</code>, a system lands in exactly one of these four cells. <strong>Consistent</strong> means
        never "both", <strong>complete</strong> means never "neither", and <strong>sound</strong> means that whichever one it
        proves is true.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Racing two recognizers.                                             */

export function Race() {
  const scenarios = [
    { name: 'x has the property', left: 7, right: null },
    { name: 'x lacks the property', left: null, right: 11 },
    { name: 'neither halts (not a real case!)', left: null, right: null },
  ] as const
  const [sc, setSc] = useState(0)
  const [t, setT] = useState(0)
  const s = scenarios[sc]
  const leftDone = s.left !== null && t >= s.left
  const rightDone = s.right !== null && t >= s.right
  const over = leftDone || rightDone
  useEffect(() => {
    if (over || t >= 16) return
    const id = setTimeout(() => setT(t + 1), 350)
    return () => clearTimeout(id)
  }, [t, over])
  const lane = (label: string, target: number | null, done: boolean) => (
    <div className="lane">
      <div className="lane-label">{label}</div>
      <div className="lane-track">
        {Array.from({ length: 16 }, (_, k) => (
          <span
            key={k}
            className={`tick ${k < t ? 'tried' : ''} ${target !== null && k === target - 1 && done ? 'found' : ''}`}
          />
        ))}
      </div>
    </div>
  )
  return (
    <figure className="fig">
      <div className="fig-controls">
        {scenarios.map((x, i) => (
          <button
            key={i}
            className={`chip ${i === sc ? 'on' : ''}`}
            onClick={() => {
              setSc(i)
              setT(0)
            }}
          >
            {x.name}
          </button>
        ))}
      </div>
      {lane('recognizer for yes', s.left, leftDone)}
      {lane('recognizer for no', s.right, rightDone)}
      <figcaption>
        Step {t}:{' '}
        {leftDone ? (
          <>
            the "yes" recognizer halted, so the race <strong>returns true</strong>.
          </>
        ) : rightDone ? (
          <>
            the "no" recognizer halted, so the race <strong>returns false</strong>.
          </>
        ) : t >= 16 ? (
          <>… still going. With two recognizers for a property and its opposite, this can't happen: one of them always halts.</>
        ) : (
          <>each recognizer takes one more step…</>
        )}{' '}
        <button className="linkish" onClick={() => setT(0)}>
          replay
        </button>
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Which theorem needs which assumption.                               */

export function HypothesisMap() {
  const cols = ['Effective', 'Sound', 'Consistent', 'Checks computations', 'Guards', 'Race', 'Self-runner']
  const rows: [string, string, string, string[]][] = [
    ['post', 'ch. 5', 'Decidable ⟺ it and its opposite are recognizable', ['', '', '', '', '●', '●', '']],
    ['halting_problem', 'ch. 6', 'No program decides halting', ['', '', '', '', '●', '', '']],
    ['looping_not_recognizable', 'ch. 6', 'No program recognizes looping', ['', '', '', '', '●', '●', '●']],
    ['incomplete_via_halting', 'ch. 8', 'Sound + effective ⟹ incomplete', ['●', '●', '', '', '●', '●', '●']],
    ['first_incompleteness_sound', 'ch. 9', 'Explicit independent sentence', ['●', '●', '', '', '', '', '']],
    ['godel_first', 'ch. 9', 'G is true and unprovable', ['●', '', '●', '●', '', '', '']],
    ['rosser', 'ch. 10', 'Neither provable nor disprovable', ['●', '', '●', '●', '', '●', '']],
    ['second_incompleteness', 'ch. 11', "Can't prove its own consistency", ['●', '', '●', '●', '', '', '']],
  ]
  return (
    <figure className="fig">
      <div className="table-scroll">
        <table className="hyp">
          <thead>
            <tr>
              <th>theorem</th>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, ch, gist, marks]) => (
              <tr key={name}>
                <th>
                  <div>
                    {gist} <span className="muted">{ch}</span>
                  </div>
                  <code className="muted">{name}</code>
                </th>
                {marks.map((m, i) => (
                  <td key={i}>{m}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>
        The first four columns are assumptions about the formal system S; the last three are abilities of the computer.
        The second theorem also assumes that S can follow the proof of the first.
      </figcaption>
    </figure>
  )
}
