import { Markdown } from '../components/Blocks'

const sheet = `
# Reading Lean 📋

You never need to *write* Lean in this course. This page is for *reading* the definitions and
statements we show, and for peeking into the folded proofs if you're curious.

## Symbols

| Lean | Read it as | Example |
|---|---|---|
| \`¬ P\` | not P | \`¬ M.Halts p x\`: p doesn't halt on x |
| \`P ∧ Q\` | P and Q | |
| \`P ∨ Q\` | P or Q | \`S.Provable s ∨ S.Provable (S.neg s)\` |
| \`P → Q\` | if P then Q | |
| \`P ↔ Q\` | P if and only if Q | \`M.Halts g g ↔ S.Provable G\` |
| \`∀ x, P x\` | for every x, P x | |
| \`∃ x, P x\` | there is an x with P x | \`∃ fuel, runFor f fuel s = 0\` |
| \`a ≠ b\` | a is not equal to b | |
| \`f x y\` | the function f applied to x and y, like \`f(x, y)\` | \`M.run p x\` |
| \`fun x => e\` | an anonymous function, like \`x => e\` | |

## Reading a definition

\`\`\`lean
def Halts (p x : Code) : Prop := M.run p x ≠ .loops
\`\`\`

"\`Halts\` takes two pieces of code \`p\` and \`x\`, and gives a statement (a \`Prop\`): the
statement that running \`p\` on \`x\` doesn't loop." A \`Prop\` is a statement that may be true or false.

A \`structure\` is like a TypeScript interface: a bundle of named fields. In this course, some
fields are *promises* (statements that must be proved), so a structure like \`HasRace\` means
"a way to build \`race p q\`, **together with** proofs that it behaves as described".

## Reading a theorem

\`\`\`lean
theorem godel_first (E : S.Effective) (hcon : S.Consistent) (hph : S.ProvesHalting) :
    ¬ S.Provable (S.godelSentence E) ∧ ¬ M.Halts (S.godelProgram E) (S.godelProgram E)
\`\`\`

Everything in parentheses before the \`:\` is an **assumption**. Everything after it is the
**conclusion**. So: "Assume S is effective, consistent, and checks computations. Then S doesn't
prove the Gödel sentence, and the Gödel program doesn't halt on itself." Assumption names that start
with \`h\` (like \`hcon\`) are just labels for the assumptions, used inside the proof.

## Inside a folded proof

Proofs are written as a sequence of steps. You can usually follow them from the comments. A few
common words:

| Step | Meaning |
|---|---|
| \`intro h\` | "Suppose ... (call it h)." |
| \`have h : P := ...\` | "We know P, because ..." |
| \`exact ...\` | "This finishes the proof." |
| \`by_cases h : P\` | "Either P holds, or it doesn't. Case 1: ... Case 2: ..." |
| \`constructor\` | "We prove both halves separately." |
| \`obtain ⟨x, hx⟩ := h\` | "Take the x that h says exists." |
| \`h.mp\` / \`h.mpr\` | The two directions of an if-and-only-if \`h\` |
| \`h.1\` / \`h.2\` | The two parts of an "and" \`h\` |
| \`rfl\`, \`decide\`, \`simp\`, \`omega\` | "By computation / simplification." |

## The course's definitions

| Name | Meaning | Chapter |
|---|---|---|
| \`M.run p x\` | What program \`p\` does on input \`x\`: \`.loops\` or \`.returns b\` | 4 |
| \`M.Halts p x\` | \`p\` doesn't loop on \`x\` | 4 |
| \`M.Decides d P\` | \`d\` always halts, answering \`true\` exactly on inputs with property \`P\` | 5 |
| \`M.Recognizes r P\` | \`r\` halts exactly on inputs with property \`P\` | 5 |
| \`HasGuards\`, \`HasRace\`, \`HasSelfRunner\` | The computer can wrap a program in an if-and-loop, race two programs, and run a program on itself | 5–6 |
| \`S.Provable s\` | The formal system \`S\` proves statement \`s\` | 7 |
| \`S.Consistent\` | \`S\` never proves both \`s\` and \`S.neg s\` | 7 |
| \`S.Complete\` | \`S\` always proves \`s\` or \`S.neg s\` | 7 |
| \`S.Sound\` | \`S\` never proves a false halting statement | 7 |
| \`S.ProvesHalting\` | \`S\` checks computations: it proves every true "p halts on x" | 7 |
| \`S.Effective\` | A program can search \`S\`'s proofs of "x loops on x" | 7 |
`

export function Cheatsheet() {
  return (
    <main className="page wide">
      <Markdown src={sheet} />
    </main>
  )
}
