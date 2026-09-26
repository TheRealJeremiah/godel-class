# Unprovable! v2: outline

**Goal:** explain the *proof*. The mathematics comes first, in plain English. Simple JavaScript
illustrates it, and Lean confirms it: key definitions are shown, proofs are collapsed.

**Reader:** comfortable with code and with basic proofs (contradiction, induction), but new to
Gödel, the halting problem, proofs-as-programs, and computability.

## Conventions for every chapter

- **Theorems** appear in a `Theorem` box in plain English, then get an informal proof in numbered
  steps, then a JavaScript illustration where it helps, then "The Lean version": the key
  definitions are visible, and the proof sits behind a "See the proof in Lean ✓" toggle with a
  short note mapping each Lean step to a step of the argument.
- **Notation:** English first. Light symbols (∀ ∃ ¬ → ↔ ⊢) are introduced once and listed in the
  glossary. No Greek letters in code: `s` for statements, `r` for Rosser's program, and so on.
- **Questions** test the mathematics: predictions, "which assumption is used here?", case
  analysis, boundary cases, patch attempts. At most one per chapter asks "which step of the
  argument does this Lean line carry out?". None are about syntax.
- **Length:** 12 chapters, about 160–170 questions.

## Chapters

### 1. Statements, proofs, and machines that check them (~16 questions)
What Gödel proved, stated informally. Formal systems: statements, axioms (defined here),
rules, and a mechanical checker. True vs provable. Consistent and complete, informally. Lean as
our example checker: a statement is a type and a proof is a value (one small table, no tactic
tour). How to read a Lean proof at a glance: hypotheses and goal. The liar lemma: no statement
is equivalent to its own negation, argued in English, with the Lean proof collapsed. Roadmap.

### 2. Cantor's diagonal (~14)
Infinite lists of infinite bit-streams; the interactive table; flipping the diagonal; why
patching the list fails. Countable vs uncountable, informally. Corollary: since programs can be
listed, some functions are computed by no program.

### 3. One trick, many disguises: Lawvere's fixed-point theorem (~16), *slowed down and expanded*
1. Fixed points from scratch: examples with and without them (`x => x * x` has 0 and 1;
   `b => !b` has none; `x => x + 1` has none).
2. Cantor, rewritten: "if a table contained every row, then flipping would have a fixed point."
3. A **finite** example to play with: 3 rows and 3 columns can't hold all 8 rows of three bits,
   and the diagonal shows you which row is missing (new interactive figure).
4. The general theorem in English: if a square table contains every possible row, then every
   way of transforming entries has a fixed point. The proof in three plain steps.
5. Worked instances, one at a time: Cantor (flip a bit), the liar and the barber (negate a
   statement), Russell's paradox (sets that don't contain themselves), and a harmless instance
   where fixed points exist (no contradiction). Preview: the halting problem and Gödel's
   sentence have the same shape.
6. Lean: statement shown, proof collapsed.

### 4. Programs as data (~13)
The toy machine and fuel; what "halts" means; proving halting by running it vs proving looping
with an invariant (a brief induction refresher); the halting asymmetry. The abstract `Computer`
in English: what we assume about programs, and why `run` can be a mathematical description even
though no program computes it.

### 5. Deciding, recognizing, listing (~16), *new full chapter*
Properties as yes/no questions about inputs. Three abilities, each with JavaScript: **decide**
(always answers), **recognize** (halts on exactly the yes-instances), **list** (prints every
yes-instance). Worked examples: even length, "is a valid proof of something", "halts".
- A decider isn't itself a recognizer, but you can turn one into a recognizer in one line.
- Recognizable = listable, both directions, with a dovetailing animation.
- **Theorem (Post):** a property is decidable exactly when both it and its opposite are
  recognizable, via racing. Proved in Lean (proof collapsed).
- A picture of the landscape: decidable inside recognizable, with "not recognizable" outside it.

### 6. The halting problem (~15)
Self-application; the troll; both cases in English with the halting table; the same shape as
Lawvere (brief reference back); the Lean statement with the proof collapsed; patching fails;
languages where every program halts escape. **New corollary using chapter 5:** halting is
recognizable (just run it), but not decidable, so **looping is not recognizable**. This is the
fact that Gödel's theorem will rest on.

### 7. Formal systems, precisely (~16)
Our model of a formal system: statements, provability, negation, the statement "p halts on x".
What "true" means here: we only need truth for halting statements, where it's the fact about
the program. Consistent, complete, sound. Proving halting by running it (Σ₁-completeness, named
in a footnote). Proofs can be listed, so theorems are recognizable (JavaScript, plus the Lean
statement). Effective systems. A short box introducing Peano arithmetic, ZFC and Lean as
examples.

### 8. Incompleteness, take one (~12)
In English: if S were sound, effective and complete, then "search for a proof that x loops"
would recognize looping, contradicting chapter 6. Lean statement, proof collapsed. What this
proof doesn't give us: which statement is unprovable. Adding axioms doesn't help.

### 9. The sentence that says "I am unprovable" (~17)
True vs provable, informally. The program `g` that searches for a proof that its input loops
on itself; running `g` on itself; the key fact; the sound version; the consistency version (the
real Gödel theorem); what "G is true" means; the missing half (S might still wrongly disprove
G); adding G as an axiom; G looks like Goldbach's conjecture.

### 10. Rosser's trick (~12)
Race a proof against a disproof and do the opposite. Both cases in English first, then
statements about outputs, then Lean with the proof collapsed. Comparison with Gödel's sentence.

### 11. Can a system prove it's consistent? (~12)
Consistency as a halting statement. The first theorem, read as "consistent implies G". If S can
follow that argument, S can't prove it's consistent. Explicit note: in Lean, `Con` is just a
name, and its meaning comes only from the assumption that S can follow the argument. What the
theorem does and doesn't say.

### 12. Gödel, Lean, and you (~13)
Does it apply to Lean? Which assumptions we made, and how full formalizations discharge them.
Natural unprovable statements. Myth-busting quiz. A final recap map of theorems and assumptions.

## Changes to the Lean project

- Rename `φ` to `s` (and similar) throughout.
- **Chapter 5:** abilities to run a program on itself and to "loop unless", plus Post's theorem.
- **Chapter 6:** corollary that looping is not recognizable.
- **Chapter 8:** take-one reproved via that corollary (shorter).
- **Chapter 3:** optional Russell/`Prop` instance of Lawvere.
- Every theorem statement stays visible; proofs are shown collapsed.

## Changes to the app

- New blocks: `::: theorem` (plain-English statement box) and `@proof name` (a collapsed Lean
  proof).
- New figures: the finite Lawvere table, a fixed-point explorer, the decide/recognize/list
  landscape, and a dovetailing (list ↔ recognize) animation.
- The cheat sheet becomes a short "reading Lean" guide.
- Progress is stored under new `v2` keys.
