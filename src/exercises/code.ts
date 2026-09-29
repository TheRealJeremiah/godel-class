import type { CodeConfig } from './CodeExercise'

/*
 * Coding exercises. Each test script runs in a Web Worker and defines
 * `function __run(code)`; see PRELUDE in CodeExercise.tsx for the helpers.
 * (Written with String.raw, so they must not contain backticks or "${".)
 */

/* ---------- Chapter 1: the Evens proof checker ---------- */

export const EVENS_CHECKER: CodeConfig = {
  label: 'Your check function',
  starter: String.raw`// A proof is an array of statements, like
//   ["0 is even", "2 is even", "4 is even"]
// Each statement is "<n> is even" or "<n> is not even".
// Return the statement the proof proves (its last line), or null
// if the proof is empty, or if any line is neither an axiom nor
// follows from some EARLIER line by one of the rules:
//   from "n is even"     conclude "n+2 is even"
//   from "n is not even" conclude "n+2 is not even"
const axioms = ["0 is even", "1 is not even"]

function check(proof) {

}
`,
  tests: String.raw`
function __run(code) {
  const f = __load(code, {}, ['check'])
  if (!f) return
  const cases = [
    [['0 is even', '2 is even', '4 is even'], '4 is even', 'a short valid proof'],
    [['1 is not even', '3 is not even', '5 is not even'], '5 is not even', 'a proof that uses the "not even" rule'],
    [['0 is even'], '0 is even', 'a proof that is just an axiom'],
    [['0 is even', '1 is not even', '2 is even', '3 is not even'], '3 is not even', 'a proof whose last step uses a line further back'],
    [['0 is even', '4 is even'], null, 'a proof that skips a step'],
    [['2 is even'], null, 'a proof whose first line is not an axiom'],
    [['0 is even', '2 is not even'], null, 'a proof that switches from "even" to "not even"'],
    [['0 is even', '1 is even'], null, 'a proof that steps by 1 instead of 2'],
    [['0 is even', '2 is even', 'banana'], null, 'a proof containing a line that is not a statement'],
    [[], null, 'the empty proof'],
    [['0 is even', '2 is even', '4 is even', '0 is even'], '0 is even', 'a proof that ends by repeating an axiom'],
  ]
  cases.forEach(([proof, expected, desc], i) => {
    __test(String(i + 1), '', () => {
      const got = f.check(proof.slice())
      const ok = got === expected
      return { ok, msg: ok ? '' : 'For ' + desc + ', ' + JSON.stringify(proof) + ', check returned ' + __show(got, false) + ', but it should return ' + __show(expected, false) + '.' }
    })
  })
}
`,
  success:
    "All tests pass! Your checker never needs to know whether a statement is *true*: it only checks that each step follows the rules. That's what makes a formal system mechanical, and it always finishes.",
}

/* ---------- Chapter 2: a stream missing from any list ---------- */

export const NOT_IN_LIST: CodeConfig = {
  label: 'Your missing function',
  starter: String.raw`// table(i) is row i of an infinite list of bit-streams, and
// table(i)(n) is the bit (true or false) in row i at position n.
// Return a bit-stream (a function from positions n = 0, 1, 2, ...
// to true or false) that is different from EVERY row of the table.

function missing(table) {

}
`,
  tests: String.raw`
function __run(code) {
  const f = __load(code, {}, ['missing'])
  if (!f) return
  const bit = (a, b) => {
    let h = (a * 374761393 + b * 668265263) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) & 1) === 1
  }
  const tables = [
    ['a random table', (i) => (n) => bit(i + 1, n + 7)],
    ['a table whose row 0 is all false', (i) => (n) => (i === 0 ? false : bit(i, n))],
    ['a table whose row 1 is row 0 flipped', (i) => (n) => (i === 1 ? !bit(0, n) : bit(i, n))],
    ['a table where row i is true only at position i', (i) => (n) => n === i],
    ['a table where every row is all true', (i) => (n) => true],
    ['the table "is n a multiple of i + 2?"', (i) => (n) => n % (i + 2) === 0],
  ]
  tables.forEach(([desc, table], t) => {
    __test(String(t + 1), '', () => {
      const s = f.missing(table)
      if (typeof s !== 'function') return { ok: false, msg: 'missing(table) should return a stream (a function from positions to bits), but it returned ' + __show(s, false) + '.' }
      for (let n = 0; n < 400; n++) {
        const b = s(n)
        if (typeof b !== 'boolean') return { ok: false, msg: 'Your stream should give true or false at every position, but at position ' + n + ' it gave ' + __show(b, false) + '.' }
      }
      for (let i = 0; i < 80; i++) {
        let differs = false
        for (let n = 0; n < 400 && !differs; n++) if (s(n) !== table(i)(n)) differs = true
        if (!differs) return { ok: false, msg: 'For ' + desc + ', your stream equals row ' + i + ' at every position we checked (0 to 399). It has to differ from every row somewhere.' }
      }
      return { ok: true }
    })
  })
}
`,
  success:
    'All tests pass! Whatever table you were given, your stream differed from every row. (If you flipped the diagonal, that was Cantor. Flipping `table(n)(n + 1)` works too: any rule that uses a different position for each row does.)',
}

/* ---------- Chapter 4: halting is decidable for finite machines ---------- */

export const FINITE_HALTS: CodeConfig = {
  label: 'Your halts function',
  starter: String.raw`// A machine has states 0 to 99. Each step, state s becomes f(s),
// and f always returns a number from 0 to 99. The machine halts
// when it reaches state 0.
// Return true if the machine halts when started in state s, and
// false if it runs forever. Your function must always halt!

function halts(f, s) {

}
`,
  tests: String.raw`
function __run(code) {
  const f = __load(code, {}, ['halts'])
  if (!f) return
  let seed = Math.floor(Math.random() * 1e9)
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  const truth = (g, s) => { const seen = new Set(); while (s !== 0) { if (seen.has(s)) return false; seen.add(s); s = g(s) } return true }
  const randomMachine = () => { const t = [0]; for (let i = 1; i < 100; i++) t.push(Math.floor(rand() * 100)); return (n) => t[n] }
  const machines = [
    ['that counts down (from 99 it takes 99 steps)', (n) => n - 1, 99],
    ['that stays put', (n) => n, 5],
    ['that starts in state 0', (n) => (n + 1) % 100, 0],
    ['that cycles 1, 2, ..., 99, 1, ...', (n) => (n === 0 ? 0 : (n % 99) + 1), 1],
    ['that slides from 99 down to 50, then cycles 20, 21, ..., 50, 20, ...', (n) => (n > 50 ? n - 1 : n === 50 ? 20 : n === 0 ? 0 : n + 1), 99],
    ['that bounces between 3 and 4', (n) => (n === 3 ? 4 : n === 4 ? 3 : 0), 3],
    ['that jumps straight to 0', (n) => (n === 3 ? 4 : n === 4 ? 3 : 0), 7],
  ]
  for (let i = 0; i < 6; i++) machines.push(['with random steps', randomMachine(), 1 + Math.floor(rand() * 99)])
  machines.forEach(([desc, g, s], i) => {
    const expected = truth(g, s)
    const hang = 'Your code may be waiting for the state to reach 0, but on this machine (one ' + desc + ') it never does. How many different states can the machine visit before one of them repeats?'
    __test(String(i + 1), expected ? '' : hang, () => {
      const got = f.halts(g, s)
      const ok = got === expected
      return { ok, msg: ok ? '' : 'For the machine ' + desc + ', started in state ' + s + ', you returned ' + __show(got, false) + ', but it ' + (expected ? 'halts' : 'runs forever') + '.' }
    })
  })
}
`,
  success:
    "All tests pass! With only 100 states, a run that hasn't halted within 100 steps must have repeated a state, and from then on it cycles forever. So halting **is** decidable for finite machines. The halting problem needs programs with unbounded memory.",
}

/* ---------- Chapter 5: decide by racing ---------- */

export const RACE_DECIDER: CodeConfig = {
  label: 'Your decide function',
  starter: String.raw`// r1(x) returns a run: r1 started on input x, paused.
// run.next() does one step and returns { value, done }:
//   done: false  ->  still running
//   done: true   ->  halted
// (Check .done on what .next() returns, not on the run.)
// r1 halts exactly on the inputs WITH the secret property P.
// r2 is the same, but halts exactly on the inputs WITHOUT it.
//
// To try it out, uncomment these lines and click Run:
// const run = r1(4)
// console.log(run.next())

function decide(r1, r2, x) {
  // Return true if x has the property P, false if it doesn't.
  // Your code must always halt.
}
`,
  tests: String.raw`
function __run(code) {
  const k = 2 + Math.floor(Math.random() * 4)
  const m = Math.floor(Math.random() * k)
  const P = (x) => x % k === m
  const r1 = function* (x) { if (!P(x)) while (true) yield; for (let i = 0; i < x + 3; i++) yield }
  const r2 = function* (x) { if (P(x)) while (true) yield; for (let i = 0; i < 2 * x + 5; i++) yield }
  const f = __load(code, { r1, r2 }, ['decide'])
  if (!f) return
  __info("This run's secret property was x % " + k + ' === ' + m + '.')
  for (const x of [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 250, 1001]) {
    const hang = 'On this input the answer is ' + P(x) + ', so ' + (P(x) ? 'r2' : 'r1') + ' never halts. Did you wait for one recognizer to finish? Or check .done on the run itself? (done is on what .next() returns: run.next().done.)'
    __test('x=' + x, hang, () => {
      const got = f.decide(r1, r2, x)
      const ok = got === P(x)
      return { ok, msg: ok ? '' : 'On input x = ' + x + ' you returned ' + __show(got, false) + ', but the answer is ' + P(x) + '. A decider must halt and be right on every input.' }
    })
  }
}
`,
  success:
    "All tests pass! Racing the two recognizers always halts, because exactly one of them halts on every input. That's the \"if\" direction of Post's theorem.",
}

/* ---------- Chapter 5: dovetailing ---------- */

export const DOVETAIL: CodeConfig = {
  label: 'Your list generator',
  starter: String.raw`// r(x) returns a run of a recognizer on input x, exactly like r1
// in the previous exercise: run.next() does one step and returns
// { value, done }.
// Write a generator that yields every input x = 0, 1, 2, ... on
// which r halts, each exactly once, and never yields an input on
// which r runs forever. (Your generator runs forever: there are
// infinitely many inputs. The grader takes its first 25 values.)

function* list(r) {

}
`,
  tests: String.raw`
function __run(code) {
  const k = 2 + Math.floor(Math.random() * 4)
  const m = Math.floor(Math.random() * k)
  const P = (x) => x % k === m
  const r = function* (x) { if (!P(x)) while (true) yield; for (let i = 0; i < 2 + ((x * 5) % 11); i++) yield }
  const f = __load(code, { r }, ['list'])
  if (!f) return
  __info("This run's secret property was x % " + k + ' === ' + m + '.')
  const firstNo = [0, 1, 2, 3, 4, 5].find((x) => !P(x))
  const hang = 'Your generator got stuck. It may be waiting on an input where r never halts (like x = ' + firstNo + '). Never wait on one input: keep starting new inputs, and give every started run one more step at a time. (And check done on what .next() returns, not on the run.)'
  __test('first 25', hang, () => {
    const gen = f.list(r)
    if (!gen || typeof gen.next !== 'function') return { ok: false, msg: 'list should be a generator function (function* list(r)), so that it can yield values one at a time.' }
    const seen = []
    while (seen.length < 25) {
      const s = gen.next()
      if (s.done) return { ok: false, msg: 'Your generator finished after yielding ' + seen.length + ' values, but there are infinitely many inputs to list.' }
      const x = s.value
      if (typeof x !== 'number' || !P(x)) return { ok: false, msg: 'You yielded ' + __show(x, false) + ', but r never halts on it, so it should never be listed.' }
      if (seen.includes(x)) return { ok: false, msg: 'You yielded ' + x + ' twice. List each input only once.' }
      seen.push(x)
    }
    const missed = []
    for (let x = 0; x < 20; x++) if (P(x) && !seen.includes(x)) missed.push(x)
    if (missed.length) return { ok: false, msg: 'Your first 25 values skipped ' + missed.join(', ') + ', which r halts on (quickly). Every such input must be listed eventually, and these should appear early.' }
    return { ok: true }
  })
}
`,
  success:
    'All tests pass! You turned a recognizer into a lister by **dovetailing**: no input that runs forever can block the others. That\'s why "recognizable" and "listable" are the same thing.',
  timeoutMs: 4000,
}

/* ---------- Chapter 6: troll any halting tester ---------- */

export const TROLL: CodeConfig = {
  label: 'Your troll',
  starter: String.raw`// Programs are generator functions: p(x) starts a run of p on
// input x, and here the input x is itself a program.
// d(p, x) is a would-be halting tester: it claims to say whether
// p halts on input x (true = halts, false = runs forever).
// Write the troll: a program that, run on ITSELF, does the
// opposite of whatever d predicts. The grader tries it against
// several different testers d.
// Every step of a program must yield, so an infinite loop is
//   while (true) yield

function* troll(x) {

}
`,
  tests: String.raw`
function __run(code) {
  const testers = [
    ['a tester that always says "halts"', () => true],
    ['a tester that always says "runs forever"', () => false],
    ['a tester that says "runs forever" when it sees while (true) in the source', (p) => !/while\s*\(\s*true\s*\)/.test(String(p))],
    ['a tester that says "halts" when the source has an even number of characters', (p) => String(p).length % 2 === 0],
    ['a tester that says "halts" when the source mentions d', (p) => /\bd\b/.test(String(p))],
  ]
  for (let t = 0; t < testers.length; t++) {
    const [desc, d] = testers[t]
    const f = __load(code, { d }, ['troll'])
    if (!f) return
    __test(String(t + 1), 'Your troll ran forever without yielding. Every step must yield, so an infinite loop should be written while (true) yield.', () => {
      const run = f.troll(f.troll)
      if (!run || typeof run.next !== 'function') return { ok: false, msg: 'troll should be a generator function (function* troll(x)), so that troll(x) returns a run.' }
      const claim = d(f.troll, f.troll)
      const r = __steps(run, 20000)
      const verdict = r.halted ? 'it halted' : 'it was still running after 20000 steps'
      const trolled = claim !== r.halted
      return { ok: trolled, msg: trolled ? '' : 'Against ' + desc + ': it predicted your troll would ' + (claim ? 'halt' : 'run forever') + ' on itself, and ' + verdict + ', so the tester was right. The troll must do the opposite of what d predicts.' }
    })
  }
}
`,
  success:
    'All tests pass! Every tester was wrong about your troll running on itself, whatever strategy it used. That is the halting problem: **any** tester can be trolled the same way.',
}

/* ---------- Chapter 7: consistent, complete, sound ---------- */

export const CLASSIFY: CodeConfig = {
  label: 'Your consistent, complete and sound functions',
  starter: String.raw`// A toy world with four programs:
//   programs = ["p0", "p1", "p2", "p3"]
//   reallyHalts(p) is true if program p really halts,
//                  and false if it runs forever.
// A formal system is described by the array of statements it
// proves, like ["p0 halts", "p1 loops"]. Every statement is
// either "<p> halts" or "<p> loops" (they are each other's negation).

function consistent(proved) {
  // Never proves both "p halts" and "p loops".
}

function complete(proved) {
  // For every program p, proves "p halts" or "p loops".
}

function sound(proved) {
  // Everything it proves is true.
}
`,
  tests: String.raw`
function __run(code) {
  const programs = ['p0', 'p1', 'p2', 'p3']
  const truth = { p0: true, p1: false, p2: true, p3: false }
  const reallyHalts = (p) => truth[p]
  const f = __load(code, { programs, reallyHalts }, ['consistent', 'complete', 'sound'])
  if (!f) return
  const trueOnes = programs.map((p) => p + (truth[p] ? ' halts' : ' loops'))
  const everything = programs.flatMap((p) => [p + ' halts', p + ' loops'])
  const systems = [
    ['proves exactly the true statements', trueOnes, [true, true, true]],
    ['proves nothing at all', [], [true, false, true]],
    ['proves every statement', everything, [false, true, false]],
    ['answers about every program, but gets p1 wrong', ['p0 halts', 'p1 halts', 'p2 halts', 'p3 loops'], [true, true, false]],
    ['answers only about p0 and p2, correctly', ['p0 halts', 'p2 halts'], [true, false, true]],
    ['proves both "p3 halts" and "p3 loops", and nothing else', ['p3 halts', 'p3 loops'], [false, false, false]],
    ['proves only "p1 halts"', ['p1 halts'], [true, false, false]],
  ]
  const names = ['consistent', 'complete', 'sound']
  const why = {
    consistent: ['it never proves both "p halts" and "p loops"', 'it proves both "p halts" and "p loops" for some p'],
    complete: ['it proves one of the two statements for every program', 'it leaves some program unanswered'],
    sound: ['everything it proves is true', 'it proves something false'],
  }
  systems.forEach(([desc, proved, expected], t) => {
    __test(String(t + 1), '', () => {
      for (let j = 0; j < 3; j++) {
        const name = names[j]
        const got = f[name](proved.slice())
        if (got !== expected[j]) return { ok: false, msg: 'The system that ' + desc + ' (it proves ' + JSON.stringify(proved) + '): ' + name + ' returned ' + __show(got, false) + ', but it should be ' + expected[j] + ', because ' + why[name][expected[j] ? 0 : 1] + '.' }
      }
      return { ok: true }
    })
  })
}
`,
  success:
    'All tests pass! **Consistent:** never both. **Complete:** never neither. **Sound:** never wrong. And notice they really are independent: the tests included systems with every combination you could find.',
}

/* ---------- Chapter 8: a complete system would decide halting ---------- */

export const COMPLETE_DECIDER: CodeConfig = {
  label: 'Your decideHalts function',
  starter: String.raw`// theorems() lists every theorem of a sound, complete formal system,
// one at a time, forever. Some are statements about the programs
// q0 to q9, in the form "q3 halts" or "q3 loops". The rest are about
// other things, like "7 = 7".
// Because the system is complete, for each program it proves one
// of the two statements. (Use it like this:
//   for (const t of theorems()) { ... }  )
// Return true if program p halts, false if it runs forever.
// Your function must always halt.

function decideHalts(p) {

}
`,
  tests: String.raw`
function __run(code) {
  const names = [], truth = {}, pos = {}
  for (let i = 0; i < 10; i++) {
    const p = 'q' + i
    names.push(p)
    truth[p] = Math.random() < 0.5
    pos[p] = 2 + i * i * 57
  }
  function* theorems() {
    for (let n = 0; ; n++) {
      for (const p of names) if (pos[p] === n) yield p + (truth[p] ? ' halts' : ' loops')
      yield n + ' = ' + n
    }
  }
  const f = __load(code, { theorems }, ['decideHalts'])
  if (!f) return
  for (const p of names) {
    const proved = p + (truth[p] ? ' halts' : ' loops')
    __test(p, 'Your search never finished. Did you look for both "' + p + ' halts" and "' + p + ' loops"? This system proves "' + proved + '".', () => {
      const got = f.decideHalts(p)
      const ok = got === truth[p]
      return { ok, msg: ok ? '' : 'For ' + p + ' you returned ' + __show(got, false) + ', but the system proves "' + proved + '".' }
    })
  }
}
`,
  success:
    "All tests pass! With a sound, complete, effective system, halting would be decidable: search the theorems for either answer. Chapter 6 says real halting isn't decidable, so no such system exists for real programs. This fake one only knows about ten.",
}

/* ---------- Chapter 9: Gödel's program ---------- */

export const GODEL_PROGRAM: CodeConfig = {
  label: 'Your g',
  starter: String.raw`// theorems() lists every theorem of a consistent formal system S,
// one at a time, forever. Each theorem is a string, like
//   "7 = 7"   or   "¬ halts(q2, q2)"
// Programs are named by strings: "q1", "q2", ..., and "g" (yours!).
// Write Gödel's program g as a generator: yield once for each
// theorem you look at, and halt (return) as soon as you find
//   "¬ halts(" + x + ", " + x + ")"
// for your input x. If S never proves it, g runs forever.

function* g(x) {

}
`,
  tests: String.raw`
function __run(code) {
  const special = { 5: '¬ halts(q2, q2)', 9: 'halts(q1, q1)', 12: '¬ halts(q3, q4)', 3000: '¬ halts(q7, q7)' }
  function* theorems() {
    for (let n = 0; ; n++) {
      if (special[n]) yield special[n]
      yield n + ' = ' + n
    }
  }
  const f = __load(code, { theorems }, ['g'])
  if (!f) return
  const cases = [
    ['q2', true, 'S proves "¬ halts(q2, q2)", so g should find it and halt.'],
    ['q1', false, 'S only proves "halts(q1, q1)", which is not what g looks for.'],
    ['q3', false, 'S proves "¬ halts(q3, q4)", but g("q3") looks for "¬ halts(q3, q3)".'],
    ['q7', true, 'S proves "¬ halts(q7, q7)", but only far down its list of theorems. Keep searching!'],
    ['g', false, 'S never proves "¬ halts(g, g)".'],
  ]
  for (const [x, shouldHalt, why] of cases) {
    __test('g("' + x + '")', 'g ran forever without yielding. Yield once for each theorem you look at, so the grader can run g one step at a time.', () => {
      const run = f.g(x)
      if (!run || typeof run.next !== 'function') return { ok: false, msg: 'g should be a generator function (function* g(x)), so that g(x) returns a run.' }
      const r = __steps(run, 20000)
      const ok = r.halted === shouldHalt
      return { ok, msg: ok ? '' : 'g("' + x + '") ' + (r.halted ? 'halted' : 'was still running after 20000 steps') + ', but it should ' + (shouldHalt ? 'halt' : 'run forever') + ': ' + why }
    })
  }
}
`,
  success:
    'All tests pass! And look at `g("g")`: it runs forever, because this consistent system never proves "¬ halts(g, g)". So the statement "g doesn\'t halt on g" is **true**, and **not provable** in S. That\'s Gödel\'s sentence, in miniature.',
}

/* ---------- Chapter 10: Rosser's program ---------- */

export const ROSSER_PROGRAM: CodeConfig = {
  label: 'Your rosser function',
  starter: String.raw`// findYes(x) starts a run that halts if S PROVES
//   "x, run on itself, returns true"
// findNo(x) starts a run that halts if S DISPROVES it.
// Both work like r1 in chapter 5: run.next() returns { value, done }.
// On every test input, exactly one of them halts.
// Write rosser(x): race the two searches, and do the OPPOSITE of
// whatever S says first:
//   a disproof is found first  ->  return true
//   a proof is found first     ->  return false

function rosser(x) {

}
`,
  tests: String.raw`
function __run(code) {
  const inputs = ['a', 'b', 'c', 'd', 'e', 'f']
  const which = {}, when = {}
  for (const x of inputs) {
    which[x] = Math.random() < 0.5 ? 'yes' : 'no'
    when[x] = 3 + Math.floor(Math.random() * 40)
  }
  if (inputs.every((x) => which[x] === which.a)) which.b = which.a === 'yes' ? 'no' : 'yes'
  const findYes = function* (x) { if (which[x] !== 'yes') while (true) yield; for (let i = 0; i < when[x]; i++) yield }
  const findNo = function* (x) { if (which[x] !== 'no') while (true) yield; for (let i = 0; i < when[x]; i++) yield }
  const f = __load(code, { findYes, findNo }, ['rosser'])
  if (!f) return
  for (const x of inputs) {
    const expected = which[x] === 'no'
    const halter = which[x] === 'yes' ? 'findYes' : 'findNo'
    __test('"' + x + '"', 'On this input only ' + halter + ' ever halts. Did you wait for one search to finish? Or check .done on the run itself? (done is on what .next() returns: run.next().done.)', () => {
      const got = f.rosser(x)
      const ok = got === expected
      const found = which[x] === 'yes' ? 'a proof that it returns true' : 'a disproof'
      return { ok, msg: ok ? '' : 'On input "' + x + '", S has ' + found + ', and you returned ' + __show(got, false) + ". Rosser's program does the opposite of what S says, so it should return " + expected + '.' }
    })
  }
}
`,
  success:
    "All tests pass! Whichever way S commits, Rosser's program does the opposite. If S is consistent, that means S can neither prove nor disprove \"rosser(rosser) returns true\".",
}
