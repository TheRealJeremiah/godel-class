import { Markdown } from '../components/Blocks'

const glossary = `
# Glossary of translated words 📖

Books on logic have their own vocabulary. This course avoids most of it and uses
developer words instead. Here's the dictionary, in case you meet the originals in the wild.

**Arithmetization**, *n.* Teaching a system that only knows about numbers (like Peano arithmetic)
to talk about programs, by encoding programs and their executions as numbers. Gödel's paper spends
most of its pages doing this. We skip it by giving our formal system a built-in statement
\`S.halts p x\`, which says "program \`p\` halts on input \`x\`". (Chapter 7.)

**Axiom**, *n.* A statement a formal system accepts without proof, as a starting point. (Lean
also has a handful of "axioms" in a different sense: basic logical principles like the law of excluded
middle, which Lean can list for any theorem.)

**Complete**, *adj.* A system is complete if for every statement \`φ\`, it proves \`φ\` or proves \`S.neg φ\`.
In Lean: \`def Complete := ∀ φ, S.Provable φ ∨ S.Provable (S.neg φ)\`. Nothing to do with Gödel's
*completeness* theorem, which is about something else entirely.

**Consistent**, *adj.* Never proves both \`φ\` and \`S.neg φ\`.

**Decidable** (also *recursive*, *computable*), *adj.* A property \`P\` is decidable if some program
is a bug-free tester for it: it always halts, answering \`true\` exactly on the inputs with property \`P\`.
In Lean: \`∃ d, M.Decides d P\`.

**Diagonal lemma** (also *fixed-point lemma*), *n.* The classical way to build a sentence that
talks about itself. We get self-reference more cheaply, by running a program on its own source code:
\`g(g)\`. (Chapter 9.)

**Disprove**, *v.* To prove the negation: S disproves \`s\` when it proves \`S.neg s\`.

**Diverge**, *v.* To loop forever. In Lean: \`M.run p x = .loops\`.

**Effectively axiomatized** (also *recursively axiomatizable*), *adj.* A program can check proofs, so a
program can search through all proofs. In Lean: the structure \`S.Effective\`. (Chapter 7.)

**Dovetailing**, *n.* Running more and more inputs for more and more steps, so that no input that
loops forever can block the others. It turns a recognizer into a lister. (Chapter 5.)

**Fixed point**, *n.* An input a function leaves unchanged: \`f(x) = x\`. Flipping a bit has none, and
that's what powers Cantor's argument. (Chapter 3.)

**Formal system** (also *theory*), *n.* A language of statements, a language of proofs, and a
mechanical checker that says which proofs prove which statements. Lean, Peano arithmetic and ZFC are
all formal systems.

**Lawvere's fixed-point theorem**, *n.* If a table (with matching row and column labels) contains every
possible row, then every function on its entries has a fixed point. Cantor, Russell, the liar and the
halting problem are all instances. (Chapter 3.)

**Gödel numbering**, *n.* Gödel's trick for turning formulas and proofs into numbers so that arithmetic
could talk about them. Nowadays we just use source code strings.

**Independent**, *adj.* A statement is independent of a system if the system can neither prove it nor
disprove it.

**ω-consistent** (*omega-consistent*), *adj.* Gödel's original extra assumption, used to show his
sentence can't be *disproved*. It implies the property we'd need: "never proves that a program halts
when it doesn't". Rosser's trick (chapter 10) removes the need for it.

**Post's theorem**, *n.* A property is decidable exactly when both it and its opposite are
recognizable. (Chapter 5.)

**Property**, *n.* A yes/no question about inputs: for each input \`x\`, a statement \`P(x)\` that is true
or false. In Lean, a function \`Code → Prop\`.

**Recursively enumerable** (also *semi-decidable*, *r.e.*, *c.e.*), *adj.* A property \`P\` is
recursively enumerable if some program halts on exactly the inputs with property \`P\` (it may loop on
the rest). In Lean: \`∃ r, M.Recognizes r P\`. Equivalently, a program can list all its members. We say **recognizable**.

**Σ₁-complete** (*sigma-one complete*), *adj.* Proves every true statement of the form "this search
eventually finds something", which includes every true "program \`p\` halts". In Lean: \`S.ProvesHalting\`.

**Sound**, *adj.* Only proves true things. We only need soundness for halting statements:
\`S.Sound\`.

**Turnstile**, *n.* The symbol ⊢, as in \`S ⊢ φ\`, "S proves φ". We write \`S.Provable φ\`.
And ⊬ means "doesn't prove".

**Universal Turing machine**, *n.* An interpreter.
`

export function Glossary() {
  return (
    <main className="page">
      <Markdown src={glossary} />
    </main>
  )
}
