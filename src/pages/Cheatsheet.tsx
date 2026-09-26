import { Markdown } from '../components/Blocks'

const sheet = `
# Lean cheat sheet 📋

Everything you need to read the proofs in this course.

## Statements and their proofs

| Statement | Read it as | A proof is ... | In code terms |
|---|---|---|---|
| \`P ∧ Q\` | P and Q | \`⟨hp, hq⟩\` | a pair \`[hp, hq]\` |
| \`P ∨ Q\` | P or Q | \`Or.inl hp\` or \`Or.inr hq\` | a tagged union |
| \`P → Q\` | if P then Q | \`fun hp => ...\` | a function from P-proofs to Q-proofs |
| \`¬ P\` | not P | \`fun hp => ...\` producing \`False\` | a function \`P → False\` |
| \`P ↔ Q\` | P iff Q | \`⟨mp, mpr⟩\` | two functions, \`.mp : P → Q\` and \`.mpr : Q → P\` |
| \`∃ x, P x\` | some x has P | \`⟨x, hx⟩\` | an object \`{ witness, evidence }\` |
| \`∀ x, P x\` | every x has P | \`fun x => ...\` | a function from any \`x\` to a proof of \`P x\` |
| \`False\` | contradiction | (none!) | an empty type: \`never\` |

## Using a proof you already have

| You have | You can |
|---|---|
| \`h : P ∧ Q\` | \`h.1 : P\`, \`h.2 : Q\` |
| \`h : P ↔ Q\` | \`h.mp : P → Q\`, \`h.mpr : Q → P\` |
| \`h : P → Q\` and \`hp : P\` | \`h hp : Q\` |
| \`h : ¬ P\` and \`hp : P\` | \`h hp : False\` |
| \`h : P ∨ Q\` and \`hnq : ¬ Q\` | \`h.resolve_right hnq : P\` |
| \`h : ∃ x, P x\` | \`obtain ⟨x, hx⟩ := h\` |
| \`h : f = g\` (functions) | \`congrFun h n : f n = g n\` |

## Tactics used in this course

| Tactic | What it does |
|---|---|
| \`intro h\` | Goal \`P → Q\` (or \`¬ P\`): assume \`h : P\`, now prove \`Q\` (or \`False\`) |
| \`exact e\` | Close the goal with the proof term \`e\` |
| \`have h : P := e\` | Prove a fact \`P\` and remember it as \`h\` |
| \`by_cases h : P\` | Split into two cases, \`h : P\` and \`h : ¬ P\` |
| \`constructor\` | Split a goal \`P ∧ Q\` or \`P ↔ Q\` into its two halves |
| \`refine ⟨a, ?_, ?_⟩\` | Supply part of a proof, leaving the \`?_\` holes as new goals |
| \`obtain ⟨x, hx⟩ := h\` | Unpack an \`∃\` or \`∧\` |
| \`apply f\` | Goal is \`Q\` and \`f : P → Q\`: now prove \`P\` |
| \`rw [h] at h'\` | Rewrite with an equation \`h\`, inside \`h'\` |
| \`contradiction\` | Close the goal if the hypotheses are obviously contradictory |
| \`rfl\` | Close \`a = a\`, computing if needed |
| \`decide\` | Settle a small, checkable claim by computing it |
| \`simp\` | Simplify with a large set of known rewrite rules |
| \`omega\` | Solve linear arithmetic over \`Nat\` and \`Int\` |
| \`induction n with ...\` | Proof by induction |
| \`·\` | Focus on the next goal |

## The course's own definitions

| Name | Meaning |
|---|---|
| \`M.run p x\` | What program \`p\` does on input \`x\`: \`.loops\` or \`.returns b\` |
| \`M.Halts p x\` | \`M.run p x ≠ .loops\` |
| \`M.Decides d P\` | \`d\` always halts, returning \`true\` exactly on inputs with \`P\` |
| \`M.Recognizes r P\` | \`r\` halts exactly on inputs with \`P\` |
| \`S.Provable φ\` | The system \`S\` proves \`φ\` |
| \`S.Consistent\` | Never proves both \`φ\` and \`S.neg φ\` |
| \`S.Complete\` | Always proves \`φ\` or \`S.neg φ\` |
| \`S.Sound\` | Never proves a false halting statement |
| \`S.ProvesHalting\` | Proves every true "p halts on x" |
| \`S.Effective\` | A program can search S's proofs |
`

export function Cheatsheet() {
  return (
    <main className="page wide">
      <Markdown src={sheet} />
    </main>
  )
}
