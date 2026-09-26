import { useEffect, useState, type ComponentType } from 'react'

/* ------------------------------------------------------------------ */
/* Cantor's diagonal: click bits to change the table, watch diag move. */

function DiagonalTable() {
  const N = 6
  const [rows, setRows] = useState<boolean[][]>(() =>
    [
      '101100',
      '000000',
      '111111',
      '010101',
      '110011',
      '001110',
    ].map((r) => r.split('').map((c) => c === '1')),
  )
  const diag = rows.map((r, n) => !r[n])
  const flip = (i: number, j: number) =>
    setRows(rows.map((r, a) => (a === i ? r.map((b, c) => (c === j ? !b : b)) : r)))
  const bit = (b: boolean) => (b ? 'true' : 'false')
  return (
    <figure className="fig">
      <table className="bits">
        <thead>
          <tr>
            <th />
            {Array.from({ length: N }, (_, j) => (
              <th key={j}>n={j}</th>
            ))}
            <th>…</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th>table {i}</th>
              {r.map((b, j) => (
                <td key={j} className={i === j ? 'on-diag' : ''}>
                  <button onClick={() => flip(i, j)} aria-label={`Flip table ${i} ${j}`}>
                    {bit(b)}
                  </button>
                </td>
              ))}
              <td className="dots">…</td>
            </tr>
          ))}
          <tr className="dots-row">
            <th>⋮</th>
            <td colSpan={N + 1} />
          </tr>
          <tr className="diag-row">
            <th>diag table</th>
            {diag.map((b, j) => (
              <td key={j}>{bit(b)}</td>
            ))}
            <td className="dots">…</td>
          </tr>
        </tbody>
      </table>
      <figcaption>
        Click any bit to change the table. The highlighted diagonal gets flipped to make <code>diag table</code>,
        which always disagrees with row <code>n</code> at column <code>n</code>.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* The toy machine from Machines.lean: step until state 0.             */

function runTrace(f: (n: number) => number, s: number, fuel: number): number[] {
  const trace = [s]
  for (let k = 0; k < fuel; k++) {
    if (s === 0) break
    s = f(s)
    trace.push(s)
  }
  return trace
}

function ToyMachine() {
  const machines = [
    { name: 'fun n => n - 1', f: (n: number) => Math.max(0, n - 1), start: 3 },
    { name: 'fun n => n', f: (n: number) => n, start: 5 },
    { name: 'fun n => if n % 2 = 0 then n / 2 else 3 * n + 1', f: (n: number) => (n === 1 ? 0 : n % 2 === 0 ? n / 2 : 3 * n + 1), start: 6 },
  ]
  const [m, setM] = useState(0)
  const [fuel, setFuel] = useState(0)
  const mach = machines[m]
  const trace = runTrace(mach.f, mach.start, fuel)
  const last = trace[trace.length - 1]
  return (
    <figure className="fig">
      <div className="fig-controls">
        {machines.map((x, i) => (
          <button
            key={i}
            className={`chip ${i === m ? 'on' : ''}`}
            onClick={() => {
              setM(i)
              setFuel(0)
            }}
          >
            <code>{x.name}</code> from {x.start}
          </button>
        ))}
      </div>
      <div className="fig-controls">
        <label>
          fuel = <strong>{fuel}</strong>{' '}
          <input type="range" min={0} max={12} value={fuel} onChange={(e) => setFuel(Number(e.target.value))} />
        </label>
      </div>
      <div className="trace">
        {trace.map((s, i) => (
          <span key={i} className={`state ${s === 0 ? 'halt' : ''}`}>
            {s}
          </span>
        ))}
      </div>
      <figcaption>
        <code>
          runFor f {fuel} {mach.start} = {last}
        </code>{' '}
        {last === 0 ? '✓ halted (state 0)' : '… not halted yet'}
        {m === 2 && (
          <>
            {' '}
            (This one is a Collatz-style machine, patched so that state 1 steps to 0. Nobody knows whether it halts
            from <em>every</em> start.)
          </>
        )}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Enumerating bit strings, mirroring nthString / indexOf in Lean.     */

function nthString(n: number): boolean[] {
  const out: boolean[] = []
  while (n > 0) {
    const m = n - 1
    out.push(m % 2 === 1)
    n = Math.floor(m / 2)
  }
  return out
}

function indexOf(s: boolean[]): number {
  let n = 0
  for (let i = s.length - 1; i >= 0; i--) n = 2 * n + (s[i] ? 2 : 1)
  return n
}

const showBits = (s: boolean[]) => (s.length ? s.map((b) => (b ? '1' : '0')).join('') : 'ε')

function StringList() {
  const [text, setText] = useState('0110')
  const bits = text.replace(/[^01]/g, '')
  const arr = bits.split('').map((c) => c === '1')
  const idx = indexOf(arr)
  return (
    <figure className="fig">
      <div className="string-grid">
        {Array.from({ length: 15 }, (_, n) => (
          <div key={n} className={`string-cell ${n === idx ? 'on' : ''}`}>
            <span className="n">{n}</span>
            <code>{showBits(nthString(n))}</code>
          </div>
        ))}
      </div>
      <div className="fig-controls">
        <label>
          Type a bit string:{' '}
          <input
            className="bits-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={24}
            spellCheck={false}
          />
        </label>
        <span>
          It's number <strong>{idx}</strong> in the list.{' '}
          {showBits(nthString(idx)) === showBits(arr) ? '✓ nthString agrees' : ''}
        </span>
      </div>
      <figcaption>
        Bit strings written as <code>0</code>/<code>1</code> (for <code>false</code>/<code>true</code>), head of the
        list first, and ε for the empty string. Every string gets a number, and every number a string.
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Halting table: programs × inputs, with the troll's flipped diagonal. */

function HaltingTable() {
  const progs = ['p0', 'p1', 'p2', 'p3', 'p4']
  const table = ['HLHHL', 'LLHLH', 'HHHLL', 'LHLLH', 'HLLHH']
  const [show, setShow] = useState(false)
  return (
    <figure className="fig">
      <table className="bits halting">
        <thead>
          <tr>
            <th>program ↓ input →</th>
            {progs.map((p) => (
              <th key={p}>{p}</th>
            ))}
            <th>…</th>
          </tr>
        </thead>
        <tbody>
          {table.map((r, i) => (
            <tr key={i}>
              <th>{progs[i]}</th>
              {r.split('').map((c, j) => (
                <td key={j} className={`${i === j ? 'on-diag' : ''} ${c === 'H' ? 'h' : 'l'}`}>
                  {c === 'H' ? 'halts' : 'loops'}
                </td>
              ))}
              <td className="dots">…</td>
            </tr>
          ))}
          {show && (
            <tr className="diag-row">
              <th>troll</th>
              {table.map((r, j) => (
                <td key={j}>{r[j] === 'H' ? 'loops' : 'halts'}</td>
              ))}
              <td className="dots">…</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="fig-controls">
        <button className="btn small" onClick={() => setShow(!show)}>
          {show ? 'Hide' : 'Show'} the troll's row
        </button>
      </div>
      <figcaption>
        Every program is a row, and every program is also a column (an input). The troll does the opposite of the
        diagonal, so its row can't be any row of the table... but the troll is a program, so it must be!
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Racing two proof searches.                                          */

function Race() {
  const scenarios = [
    { name: 'S proves “x halts on x”', left: 7, right: null },
    { name: 'S proves “¬ x halts on x”', left: null, right: 11 },
    { name: 'S proves neither', left: null, right: null },
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
      {lane('findHaltProof x', s.left, leftDone)}
      {lane('findLoopProof x', s.right, rightDone)}
      <figcaption>
        Step {t}:{' '}
        {leftDone ? (
          <>
            left search found a proof, so the race <strong>returns true</strong>.
          </>
        ) : rightDone ? (
          <>
            right search found a proof, so the race <strong>returns false</strong>.
          </>
        ) : t >= 16 ? (
          <>… still searching. With no proof either way, the race runs forever.</>
        ) : (
          <>both searches try one more proof each…</>
        )}{' '}
        <button className="linkish" onClick={() => setT(0)}>
          replay
        </button>
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Which theorem needs which hypothesis.                               */

function HypothesisMap() {
  const cols = ['Effective', 'Sound', 'Consistent', 'ProvesHalting / Outputs', 'HasTroll', 'HasRace']
  const rows: [string, string, string[]][] = [
    ['halting_problem', 'ch. 5', ['', '', '', '', '●', '']],
    ['incomplete_via_halting', 'ch. 7', ['●', '●', '', '', '●', '●']],
    ['first_incompleteness_sound', 'ch. 8', ['●', '●', '', '', '', '']],
    ['godel_first', 'ch. 8', ['●', '', '●', '●', '', '']],
    ['rosser', 'ch. 9', ['●', '', '●', '●', '', '●']],
    ['second_incompleteness', 'ch. 10', ['●', '', '●', '●', '', '']],
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
            {rows.map(([name, ch, marks]) => (
              <tr key={name}>
                <th>
                  <code>{name}</code> <span className="muted">{ch}</span>
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
        Which assumptions each theorem uses. (<code>second_incompleteness</code> also assumes
        <code> formalized_first</code>: that S can follow the proof of <code>godel_first</code>.)
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* g(g): a picture of the self-referential search.                      */

function GodelLoop() {
  return (
    <figure className="fig">
      <svg viewBox="0 0 640 234" className="diagram" role="img" aria-label="The Gödel program searches for a proof about itself">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="ink-fill" />
          </marker>
        </defs>
        <rect x="20" y="70" width="170" height="80" rx="12" className="box" />
        <text x="105" y="104" textAnchor="middle" className="dg-title">g(g)</text>
        <text x="105" y="128" textAnchor="middle" className="dg-small">runs the proof search</text>

        <rect x="250" y="20" width="370" height="70" rx="12" className="box accent" />
        <text x="435" y="50" textAnchor="middle" className="dg-small">for each proof p of S:</text>
        <text x="435" y="74" textAnchor="middle" className="dg-code">does p prove “¬ halts(g, g)”?</text>

        <rect x="250" y="140" width="170" height="70" rx="12" className="box" />
        <text x="335" y="170" textAnchor="middle" className="dg-small">found one →</text>
        <text x="335" y="194" textAnchor="middle" className="dg-code">g(g) halts</text>

        <rect x="450" y="140" width="170" height="70" rx="12" className="box" />
        <text x="535" y="170" textAnchor="middle" className="dg-small">never found →</text>
        <text x="535" y="194" textAnchor="middle" className="dg-code">g(g) loops</text>

        <path d="M190 95 C 220 70, 230 60, 248 58" className="edge" markerEnd="url(#arrow)" />
        <path d="M335 90 L 335 138" className="edge" markerEnd="url(#arrow)" />
        <path d="M535 90 L 535 138" className="edge" markerEnd="url(#arrow)" />
        <path d="M250 190 C 170 196, 112 186, 105 152" className="edge dashed" markerEnd="url(#arrow)" />
        <text x="30" y="224" className="dg-small">…which makes that proof wrong!</text>
      </svg>
      <figcaption>
        The statement <code>¬ halts(g, g)</code> is about the very computation doing the searching.
      </figcaption>
    </figure>
  )
}

export const figures: Record<string, ComponentType> = {
  'diagonal-table': DiagonalTable,
  'toy-machine': ToyMachine,
  'string-list': StringList,
  'halting-table': HaltingTable,
  race: Race,
  'hypothesis-map': HypothesisMap,
  'godel-loop': GodelLoop,
}
