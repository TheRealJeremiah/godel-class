import type { Step } from './OrderExercise'

/*
 * "Order the proof" exercises. Required steps are listed in one valid order;
 * `deps` are the steps each one relies on. Red herrings have a `distractor`
 * message explaining why they don't belong.
 */

/* ---------- Chapter 1: the liar lemma ---------- */

export const LIAR: Step[] = [
  { id: 'A', text: 'Suppose, for contradiction, that `P ↔ ¬P`.', missing: 'The proof never states what it assumes: `P ↔ ¬P`.' },
  { id: 'B', text: 'Suppose `P` is true.', deps: ['A'], missing: 'The proof never tries out the case where `P` is true.' },
  { id: 'C', text: 'Then `¬P` is true too, by the equivalence.', deps: ['B'], missing: 'The proof never uses the equivalence to get from `P` to `¬P`.' },
  { id: 'D', text: 'That\'s a contradiction, so `P` must be false: we have `¬P`.', deps: ['C'], missing: 'The proof never concludes that `P` is false.' },
  { id: 'E', text: 'Then, by the equivalence, `P` is true.', deps: ['D'], missing: 'The proof never uses the equivalence to get from `¬P` back to `P`.' },
  { id: 'F', text: 'But we showed `P` is false. Contradiction: so `P ↔ ¬P` is impossible.', deps: ['E'], missing: 'The proof never reaches its conclusion.' },
  {
    id: 'X',
    text: 'Since `P ↔ ¬P`, `P` must be true.',
    distractor: "The equivalence alone doesn't say which side is true. We have to try a case and see it fail.",
  },
  {
    id: 'Y',
    text: 'Compute `P` to find out whether it is true.',
    distractor: '`P` is an arbitrary statement, not something you can compute. The proof has to work for every `P`.',
  },
]

/* ---------- Chapter 2: Cantor's theorem ---------- */

export const CANTOR: Step[] = [
  { id: 'A', text: 'Let `table` be any infinite list of bit-streams.', missing: 'The proof never introduces the list it is about.' },
  { id: 'B', text: 'Define a new stream: `diag(n) = !table(n)(n)`.', deps: ['A'], missing: 'The proof never builds the stream `diag`.' },
  { id: 'C', text: 'Suppose, for contradiction, that `diag` is row `k` of the list.', deps: ['B'], missing: 'The proof never supposes that `diag` is in the list.' },
  { id: 'D', text: 'Since `diag` is row `k`, at position `k`: `diag(k) = table(k)(k)`.', deps: ['C'], missing: 'The proof never uses the assumption that `diag` is row `k`.' },
  { id: 'E', text: 'By the definition of `diag`: `diag(k) = !table(k)(k)`.', deps: ['C'], missing: 'The proof never uses the definition of `diag` at position `k`.' },
  {
    id: 'F',
    text: 'So the bit `table(k)(k)` equals its own flip, which is impossible. So `diag` is not in the list.',
    deps: ['D', 'E'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Since the list is infinite, `diag` must appear in it somewhere.',
    distractor: 'Infinite doesn\'t mean "contains everything". That\'s exactly the claim this proof refutes.',
  },
  {
    id: 'Y',
    text: 'Compare `diag` with every row at position 0.',
    distractor: "`diag` only disagrees with row 0 at position 0. Row 7 might match it there; `diag` is built to disagree with row `n` at position `n`.",
  },
]

/* ---------- Chapter 3: Lawvere's theorem ---------- */

export const LAWVERE: Step[] = [
  { id: 'A', text: 'Suppose the table `e` has every row.', missing: 'The argument never states its assumption: that the table has every row.' },
  {
    id: 'B',
    text: 'Define a new row `d` by applying `f` along the diagonal: `d(x) = f(e(x)(x))`.',
    missing: 'The argument never builds the special row `d`.',
  },
  {
    id: 'C',
    text: 'Because the table has every row, `d` is row `a` for some label `a`.',
    deps: ['A', 'B'],
    missing: 'The argument never uses the assumption to find `d` in the table.',
  },
  {
    id: 'D',
    text: 'Look at the diagonal entry of row `a`: `e(a)(a) = d(a)`, because row `a` is `d`.',
    deps: ['C'],
    missing: 'The argument never looks at the diagonal entry `e(a)(a)`.',
  },
  {
    id: 'E',
    text: 'By the definition of `d`, `d(a) = f(e(a)(a))`.',
    deps: ['B'],
    missing: 'The argument never unfolds the definition of `d` at the label `a`.',
  },
  {
    id: 'F',
    text: 'So `f(e(a)(a)) = e(a)(a)`: the entry `e(a)(a)` is a fixed point of `f`.',
    deps: ['D', 'E'],
    missing: 'The argument never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Look at column 0 of row `a`: `e(a)(0) = d(0)`.',
    distractor:
      'Column 0 only gives `e(a)(0) = f(e(0)(0))`, which relates two *different* entries. Only the diagonal entry of row `a` puts the same entry on both sides.',
  },
  {
    id: 'Y',
    text: 'Since `f` has no fixed point, `d` is not a row of the table.',
    distractor:
      "That's Cantor's *contrapositive* use of the theorem. Here we're proving a fixed point exists, so we can't assume `f` has none.",
  },
]

/* ---------- Chapter 3: Russell's paradox ---------- */

export const RUSSELL: Step[] = [
  {
    id: 'A',
    text: 'Suppose every property defines a set: for any property `P`, some set contains exactly the sets with property `P`.',
    missing: 'The proof never states the assumption it refutes: that every property defines a set.',
  },
  { id: 'B', text: 'Consider the property "`x` is not a member of itself".', missing: 'The proof never picks the flipped-diagonal property.' },
  {
    id: 'C',
    text: 'By the assumption, some set `R` contains exactly the sets that are not members of themselves.',
    deps: ['A', 'B'],
    missing: 'The proof never uses the assumption to get the set `R`.',
  },
  {
    id: 'D',
    text: 'Ask whether `R` is a member of `R`: by the definition of `R`, `R ∈ R` exactly when `R ∉ R`.',
    deps: ['C'],
    missing: 'The proof never asks about the diagonal entry: is `R` a member of itself?',
  },
  {
    id: 'E',
    text: "That's a statement equivalent to its own negation, which the liar lemma rules out. So not every property defines a set.",
    deps: ['D'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Consider the property "`x` is a member of itself".',
    distractor:
      "That's the diagonal itself, not flipped. A set of all sets that contain themselves leads to no contradiction; the trick needs the *negation*.",
  },
  {
    id: 'Y',
    text: '`R` is a member of itself, because it contains every set.',
    distractor: "`R` doesn't contain every set, only those that aren't members of themselves. Whether `R` is one of them is the whole question.",
  },
]

/* ---------- Chapter 4: an invariant proof ---------- */

export const INVARIANT: Step[] = [
  {
    id: 'A',
    text: 'Claim: for every number of steps `k`, the state of `n => n + 1`, started at 5, is at least 5 after `k` steps.',
    missing: 'The proof never states the invariant it will prove.',
  },
  { id: 'B', text: 'Base case: after 0 steps the state is 5, which is at least 5.', deps: ['A'], missing: 'The proof never checks the base case.' },
  {
    id: 'C',
    text: 'Inductive step: if the state after `k` steps is some `n ≥ 5`, then the next state is `n + 1 ≥ 5`.',
    deps: ['A'],
    missing: 'The proof never checks the inductive step.',
  },
  { id: 'D', text: 'So, by induction, the claim holds for every `k`.', deps: ['B', 'C'], missing: 'The proof never applies induction.' },
  {
    id: 'E',
    text: 'A state that is at least 5 is never 0, so no amount of fuel reaches state 0: the machine never halts.',
    deps: ['D'],
    missing: 'The proof never connects the invariant to halting.',
  },
  {
    id: 'X',
    text: 'Run the machine for a million steps: it never reaches 0.',
    distractor: "Running only shows it hasn't halted *yet*. Maybe it halts at step million-and-one! That's why we need induction.",
  },
  {
    id: 'Y',
    text: 'Claim: the state is always exactly 5.',
    distractor: "That invariant is false: after one step the state is 6. An invariant has to survive every step.",
  },
]

/* ---------- Chapter 5: Post's theorem ---------- */

export const POST: Step[] = [
  { id: 'A', text: 'Suppose `r1` recognizes `P`, and `r2` recognizes "not `P`".', missing: 'The proof never states its assumption: the two recognizers.' },
  {
    id: 'B',
    text: 'Define `decide(x)`: race `r1` and `r2` on `x`, one step each in turn; answer `true` if `r1` halts first, `false` if `r2` does.',
    deps: ['A'],
    missing: 'The proof never builds the decider.',
  },
  { id: 'C', text: 'Take any input `x`.', deps: ['B'], missing: 'The proof never considers an arbitrary input.' },
  {
    id: 'D',
    text: 'If `x` has property `P`: `r1` halts on `x` and `r2` runs forever, so the race answers `true`.',
    deps: ['C'],
    missing: 'The proof never handles the case where `x` has the property.',
  },
  {
    id: 'E',
    text: "If `x` doesn't have property `P`: `r2` halts and `r1` runs forever, so the race answers `false`.",
    deps: ['C'],
    missing: "The proof never handles the case where `x` doesn't have the property.",
  },
  {
    id: 'F',
    text: 'Either way the race halts with the right answer, so `decide` decides `P`.',
    deps: ['D', 'E'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Run `r1` on `x`: if it halts, answer `true`; otherwise answer `false`.',
    distractor: '"Otherwise" never arrives: if `r1` runs forever, you wait forever. That\'s why we race.',
  },
  {
    id: 'Y',
    text: 'Both `r1` and `r2` halt on `x`, so answer according to whichever is faster.',
    distractor: "They can't both halt: `x` either has the property or it doesn't, and each recognizer halts on only one of those.",
  },
]

/* ---------- Chapter 6: the halting problem ---------- */

export const HALTING: Step[] = [
  {
    id: 'A',
    text: 'Suppose some program `d` decides, for every program `x`, whether `x` halts on its own source.',
    missing: 'The proof never states the assumption it refutes.',
  },
  {
    id: 'B',
    text: 'Build the troll `t`: on input `x`, if `d` says `x` halts on `x`, loop forever; otherwise halt.',
    deps: ['A'],
    missing: 'The proof never builds the troll.',
  },
  { id: 'C', text: 'Run the troll on its own source: does `t` halt on `t`?', deps: ['B'], missing: 'The proof never runs the troll on itself.' },
  {
    id: 'D',
    text: 'If `t` halts on `t`, then `d` says so, and the troll loops forever: contradiction.',
    deps: ['C'],
    missing: 'The proof never handles the case where `t` halts on itself.',
  },
  {
    id: 'E',
    text: "If `t` doesn't halt on `t`, then `d` says so, and the troll halts: contradiction.",
    deps: ['C'],
    missing: "The proof never handles the case where `t` doesn't halt on itself.",
  },
  {
    id: 'F',
    text: 'Either way we reach a contradiction, so no such `d` exists.',
    deps: ['D', 'E'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Run `t` on `t` and wait to see whether it halts.',
    distractor: "Waiting can't settle it: if `t` runs forever, you wait forever. The proof reasons about both cases instead.",
  },
  {
    id: 'Y',
    text: 'Patch `d` so that it gives the right answer on `t`.',
    distractor: 'A patched `d` is a new program, with its own troll. The proof must work for every `d`.',
  },
]

/* ---------- Chapter 7: sound implies consistent ---------- */

export const SOUND_CONSISTENT: Step[] = [
  { id: 'A', text: 'Suppose `S` is sound: every halting statement it proves is true.', missing: 'The proof never states its assumption: soundness.' },
  {
    id: 'B',
    text: 'Suppose, for contradiction, that `S` proves both "`p` halts on `x`" and "`p` doesn\'t halt on `x`".',
    deps: ['A'],
    missing: 'The proof never supposes that `S` proves a statement and its negation.',
  },
  {
    id: 'C',
    text: 'By soundness, since `S` proves "`p` halts on `x`", `p` really halts on `x`.',
    deps: ['B'],
    missing: 'The proof never applies soundness to "`p` halts on `x`".',
  },
  {
    id: 'D',
    text: 'By soundness, since `S` proves "`p` doesn\'t halt on `x`", `p` really doesn\'t halt on `x`.',
    deps: ['B'],
    missing: 'The proof never applies soundness to "`p` doesn\'t halt on `x`".',
  },
  {
    id: 'E',
    text: "`p` can't both halt and not halt. So `S` never proves both: it's consistent (for halting statements).",
    deps: ['C', 'D'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'By completeness, `S` proves one of the two statements.',
    distractor: "Completeness isn't assumed, and isn't needed: the proof is about what happens when `S` proves *both*.",
  },
  {
    id: 'Y',
    text: 'Since `S` is consistent, it is sound.',
    distractor: 'Wrong direction: consistent systems can be unsound. And consistency is what we are trying to prove.',
  },
]

/* ---------- Chapter 8: incompleteness via halting ---------- */

export const TAKE_ONE: Step[] = [
  { id: 'A', text: 'Suppose `S` is sound, effective and complete.', missing: 'The proof never states the assumption it refutes.' },
  {
    id: 'B',
    text: 'By effectiveness, `findLoopProof` is a program that halts on `x` exactly when `S` proves "`x` loops on `x`".',
    deps: ['A'],
    missing: 'The proof never uses effectiveness to get the program `findLoopProof`.',
  },
  {
    id: 'C',
    text: 'If `S` proves "`x` loops on `x`", then `x` really loops on `x`, by soundness.',
    deps: ['A'],
    missing: 'The proof never shows that what `S` proves about looping is true.',
  },
  {
    id: 'D',
    text: 'If `x` loops on `x`: `S` can\'t prove "`x` halts on `x`" (soundness), so it proves "`x` loops on `x`" (completeness).',
    deps: ['A'],
    missing: 'The proof never shows that `S` proves every true "`x` loops on `x`".',
  },
  {
    id: 'E',
    text: 'So `findLoopProof` halts on `x` exactly when `x` loops on `x`: it recognizes looping.',
    deps: ['B', 'C', 'D'],
    missing: 'The proof never concludes that `findLoopProof` recognizes looping.',
  },
  {
    id: 'F',
    text: 'But no program recognizes looping (chapter 6). So `S` can\'t be sound, effective and complete.',
    deps: ['E'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Since `S` proves "`x` halts on `x`" whenever `x` halts, `S` is complete.',
    distractor: 'Proving every true *halting* statement says nothing about *looping* statements, so it isn\'t completeness.',
  },
  {
    id: 'Y',
    text: 'Run `x` on `x` and see whether it halts.',
    distractor: "If `x` loops, you'd wait forever. The proof never runs `x`; it reasons about what `S` can prove.",
  },
]

/* ---------- Chapter 9: Gödel's first theorem ---------- */

export const GODEL: Step[] = [
  {
    id: 'A',
    text: 'Let `g` search for proofs of "`x` doesn\'t halt on `x`", and let G be the sentence "`g` doesn\'t halt on `g`".',
    missing: 'The proof never defines the Gödel program and sentence.',
  },
  { id: 'B', text: 'Key fact: `g` halts on `g` exactly when `S` proves G.', deps: ['A'], missing: 'The proof never states the key fact.' },
  { id: 'C', text: 'Suppose, for contradiction, that `S` proves G.', deps: ['B'], missing: 'The proof never supposes that `S` proves G.' },
  { id: 'D', text: 'Then, by the key fact, `g` halts on `g`.', deps: ['C'], missing: 'The proof never uses the key fact to conclude that `g` halts on `g`.' },
  {
    id: 'E',
    text: 'Since `S` checks computations, `S` proves "`g` halts on `g`".',
    deps: ['D'],
    missing: 'The proof never uses the assumption that `S` checks computations.',
  },
  {
    id: 'F',
    text: 'So `S` proves both G and its negation, contradicting consistency. So `S` doesn\'t prove G.',
    deps: ['E'],
    missing: 'The proof never uses consistency to conclude that G is unprovable.',
  },
  {
    id: 'G',
    text: 'Then, by the key fact, `g` doesn\'t halt on `g`: G is true.',
    deps: ['F'],
    missing: 'The proof never shows that G is true.',
  },
  {
    id: 'X',
    text: 'Since `S` is sound, G is true.',
    distractor: 'This version only assumes consistency, not soundness. G\'s truth follows from the key fact instead.',
  },
  {
    id: 'Y',
    text: '`S` proves G, because `g` loops on `g`.',
    distractor: "That's backwards: G being true doesn't make it provable. The whole point is that G is true but unprovable.",
  },
]

/* ---------- Chapter 10: Rosser's theorem ---------- */

export const ROSSER: Step[] = [
  {
    id: 'A',
    text: 'Let `rosser` race a disproof of "`rosser(rosser)` returns true" against a proof of it, and do the opposite of whichever it finds first.',
    missing: "The proof never defines Rosser's program.",
  },
  { id: 'B', text: 'Suppose `S` proves the sentence. By consistency, there is no disproof.', deps: ['A'], missing: 'The proof never handles the case where `S` proves the sentence.' },
  {
    id: 'C',
    text: 'So `rosser(rosser)` finds the proof and returns `false`. `S` checks that run and disproves the sentence: contradiction.',
    deps: ['B'],
    missing: 'The proof never finishes the case where `S` proves the sentence.',
  },
  { id: 'D', text: 'Suppose `S` disproves the sentence. By consistency, there is no proof.', deps: ['A'], missing: 'The proof never handles the case where `S` disproves the sentence.' },
  {
    id: 'E',
    text: 'So `rosser(rosser)` finds the disproof and returns `true`. `S` checks that run and proves the sentence: contradiction.',
    deps: ['D'],
    missing: 'The proof never finishes the case where `S` disproves the sentence.',
  },
  {
    id: 'F',
    text: 'So `S` neither proves nor disproves the sentence: `S` is incomplete.',
    deps: ['C', 'E'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Since `S` is sound, the sentence is false.',
    distractor: "Rosser's theorem doesn't assume soundness. That's its whole advantage over Gödel's.",
  },
  {
    id: 'Y',
    text: '`rosser(rosser)` loops forever, so `S` proves that it loops.',
    distractor: "Nothing says `S` can prove that programs loop. Only finished runs can be checked.",
  },
]

/* ---------- Chapter 11: the second theorem ---------- */

export const SECOND: Step[] = [
  {
    id: 'A',
    text: 'Suppose `S` is consistent, effective, checks computations, and proves "`Con` implies G".',
    missing: 'The proof never states its assumptions.',
  },
  { id: 'B', text: 'Suppose, for contradiction, that `S` proves `Con`.', deps: ['A'], missing: 'The proof never supposes that `S` proves `Con`.' },
  { id: 'C', text: 'By modus ponens, `S` proves G.', deps: ['B'], missing: 'The proof never applies modus ponens.' },
  {
    id: 'D',
    text: "But the first incompleteness theorem says a consistent `S` doesn't prove G: contradiction.",
    deps: ['C'],
    missing: 'The proof never uses the first incompleteness theorem.',
  },
  { id: 'E', text: "So `S` doesn't prove `Con`.", deps: ['D'], missing: 'The proof never reaches its conclusion.' },
  {
    id: 'X',
    text: 'Since `S` proves `Con`, `S` is consistent.',
    distractor: 'Proving `Con` doesn\'t make a system consistent. An inconsistent system proves everything, `Con` included!',
  },
  {
    id: 'Y',
    text: '`Con` is false, so `S` can\'t prove it.',
    distractor: 'If `S` is consistent, `Con` is *true*. It\'s unprovable, not false.',
  },
]

/* ---------- Chapter 11: a consistent but unsound system ---------- */

export const NOT_CON: Step[] = [
  { id: 'A', text: 'Suppose `S` is consistent (and meets the second theorem\'s other assumptions).', missing: 'The proof never states its assumption.' },
  { id: 'B', text: 'By the second theorem, `S` doesn\'t prove `Con`.', deps: ['A'], missing: 'The proof never uses the second incompleteness theorem.' },
  {
    id: 'C',
    text: 'Adding an axiom `A` to `S` causes a contradiction only if `S` already disproves `A`.',
    missing: 'The proof never says when adding an axiom creates a contradiction.',
  },
  {
    id: 'D',
    text: 'Here `A` is `¬Con`, and disproving `¬Con` means proving `Con`, which `S` can\'t do.',
    deps: ['B', 'C'],
    missing: 'The proof never applies that fact to the axiom `¬Con`.',
  },
  {
    id: 'E',
    text: 'So `S + ¬Con` is consistent, even though `¬Con` is false: it is consistent but unsound.',
    deps: ['D'],
    missing: 'The proof never reaches its conclusion.',
  },
  {
    id: 'X',
    text: '`¬Con` is false, so adding it makes the system inconsistent.',
    distractor: 'False is not the same as contradictory. A false axiom only causes a contradiction if the system can refute it.',
  },
  {
    id: 'Y',
    text: '`S + ¬Con` proves its own consistency.',
    distractor: "It doesn't: it proves the *opposite*, `¬Con`, since that's its new axiom.",
  },
]

/* ---------- Chapter 12: the whole course ---------- */

export const BIG_PICTURE: Step[] = [
  { id: 'A', text: 'No program decides halting: the troll, a diagonal argument (Turing).', missing: 'The argument never uses the halting problem.' },
  { id: 'B', text: 'Halting is recognizable: just run the program.', missing: 'The argument never notes that halting is recognizable.' },
  {
    id: 'C',
    text: 'If looping were recognizable too, Post\'s theorem would make halting decidable.',
    deps: ['B'],
    missing: "The argument never uses Post's theorem.",
  },
  { id: 'D', text: 'So looping is not recognizable.', deps: ['A', 'C'], missing: 'The argument never concludes that looping is not recognizable.' },
  {
    id: 'E',
    text: 'In an effective system, a program can search for proofs of "`x` loops".',
    missing: 'The argument never uses the fact that proofs can be searched.',
  },
  {
    id: 'F',
    text: 'So if the system proved every true "`x` loops" and nothing false, that search would recognize looping.',
    deps: ['E'],
    missing: 'The argument never connects proof search to recognizing looping.',
  },
  {
    id: 'G',
    text: 'So every sound, effective system misses some true statement about looping: it is incomplete.',
    deps: ['D', 'F'],
    missing: 'The argument never reaches its conclusion.',
  },
  {
    id: 'X',
    text: 'Gödel found a contradiction in arithmetic.',
    distractor: 'Nothing here finds a contradiction. The theorems *assume* consistency and conclude incompleteness.',
  },
  {
    id: 'Y',
    text: 'Some statements about programs are neither true nor false.',
    distractor: 'Every program either halts or it doesn\'t. The unprovable statements are true or false; the system just can\'t prove which.',
  },
]
