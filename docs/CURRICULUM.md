# Unprovable! Research notes and curriculum design

This document records the research behind the course: what it teaches, why it's in
this order, which variant of Gödel's theorem it proves, and how the questions are designed.

## 1. The reference: Busy Beavers!

[Busy Beavers!](https://busy-beavers.tigyog.app/) (Jim Fisher, built on TigYog) is the style model.
What we took from it:

| Feature | Busy Beavers! | This course |
|---|---|---|
| Format | One long page per chapter, revealed step by step | Same: content is split at "gates" (questions and continue buttons) |
| Questions | Multiple choice; wrong answers explain, then "Okay" | Same, plus the correct answer's explanation and a retry button |
| Voice | First person, jokey, code-first ("less γs, more gs") | Same; Lean and JavaScript instead of math notation |
| Concepts | "🔐 Unlocked" boxes summarize each key idea | Same |
| Asides | Collapsible "Wait, why ...?" | Same |
| Progress | `n/N` progress pill; chapter list with counts | Same, saved in `localStorage` |
| Look | IBM Plex Sans/Mono, warm off-white, pastel code blocks | Same palette, plus dark mode |
| Sounds | "Pops and dings" | Synthesized with WebAudio, mutable |
| Length | 4 published chapters, 24–33 questions each (~114 total) | 11 chapters, 126 questions, 149 steps |

Its chapter 5 proves incompleteness *informally* from the halting problem, using `lean` as an
example formal system. This course goes further: the proof itself is done **in Lean**.

## 2. Which variant of Gödel's theorem?

We prove the **computational** form of the incompleteness theorems, in the tradition of
Turing (1936), Kleene (1943), and more recently Scott Aaronson
([Rosser's theorem via Turing machines](https://scottaaronson.blog/?p=710)) and
Kirst & Peters ([Gödel's Theorem Without Tears](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CSL.2023.30), CSL 2023,
which does this in Coq under a synthetic Church's thesis). As in Popescu & Traytel's abstract
formalization in Isabelle, the model of computation and the formal system are abstract structures
with explicitly named hypotheses.

Why this variant:

* **It's short enough to read in full.** The whole development is under 700 lines of Lean 4 (comments included) with no
  dependencies, and every line is shown in the course. Arithmetization-based formalizations
  (Shankar 1986; O'Connor, Coq, 2005; Paulson, Isabelle, 2014;
  [FormalizedFormalLogic/Foundation](https://github.com/FormalizedFormalLogic/Foundation), Lean 4)
  run to thousands of lines.
* **It matches the audience.** Programmers already know interpreters, strings and infinite loops.
  Self-reference comes from running a program on its own source (`g(g)`), not from the diagonal
  lemma over Gödel numbers.
* **The hard, unilluminating parts are isolated as named hypotheses**, so the logical skeleton
  is fully visible: `S.halts` (arithmetization), `ProvesHalting` (Σ₁-completeness), `Effective`
  (recursive axiomatizability), and `formalized_first` (Hilbert–Bernays–Löb derivability).

### The theorems (all in `lean/GodelCourse/`)

| Theorem | Hypotheses on S | Computer abilities | Axioms used |
|---|---|---|---|
| `Diagonal.cantor`, `Diagonal.lawvere` | none | none | `propext` / none |
| `Computer.halting_problem` | none | `HasTroll` | classical |
| `Computer.halting_problem'` (via `no_liar`) | none | `HasTroll` | **none** |
| `Enumerate.search_finds_proof` | a proof checker | none | classical |
| `FormalSystem.incomplete_via_halting` | effective, sound | `HasTroll`, `HasRace` | classical |
| `FormalSystem.first_incompleteness_sound` | effective, sound | none | **none** |
| `FormalSystem.godel_first` | effective, consistent, proves halting | none | **none** |
| `RosserSystem.rosser` | effective, consistent, proves outputs | `HasRace` | **none** |
| `LogicalSystem.second_incompleteness` | as `godel_first` + `formalized_first` | none | **none** |

(Checked with `#print axioms`.) The Gödel sentence is `¬ halts(g, g)` where
`g = findLoopProof`, the program that halts on `x` iff S proves "x doesn't halt on x".
The key lemma `godel_key` is literally the recognizer's specification instantiated at `x := g`,
which is the diagonal step.

## 3. What must be taught (and in what order)

Prerequisite analysis, working backwards from `godel_first` and `rosser`:

1. **Reading Lean** (ch. 1–2): `Prop` vs `Bool`; `theorem name : stmt := proof`; `rfl`/`decide`;
   Curry–Howard table (∧ pair, ∨ union, → function, ¬ = `→ False`, ∃ witness pair, ↔ `.mp/.mpr`);
   tactics `intro`, `exact`, `have`, `by_cases`, `obtain`, `refine`, `constructor`, `omega`, `simp`.
   Capstone: `no_liar : ¬ (P ↔ ¬ P)`, the logical core of every diagonal argument.
2. **Diagonalization** (ch. 3): Cantor in Lean, "patching doesn't help", countability ⇒
   uncomputable functions exist, Lawvere's fixed-point theorem as the general template.
3. **Programs as data** (ch. 4): fuel-indexed execution; halting is witnessed by running
   (`⟨3, rfl⟩`) but looping needs an invariant and induction (the **halting asymmetry**, which
   later explains why the Gödel sentence is a *non-halting* claim); the abstract `Computer`;
   `Decides` vs `Recognizes` (common confusion: a decider does *not* recognize its property);
   racing two recognizers.
4. **Halting problem** (ch. 5): self-application, the troll, both cases, Lean proof, the
   liar hiding inside it, why patching fails, why total languages escape (so `HasTroll` is a
   real hypothesis), classical vs constructive proof.
5. **Formal systems** (ch. 6): statements vs facts (`S.halts` vs `M.Halts`), consistency,
   completeness, explosion, soundness vs consistency (a consistent system can be unsound),
   Σ₁-completeness, enumerating all strings (Gödel numbering in miniature, proved in Lean),
   proof search is a recognizer not a decider, effectiveness.
6. **Incompleteness via halting** (ch. 7): racing proof searches; sound + effective + complete
   ⇒ halting decidable; non-constructive (no explicit sentence); patching by adding axioms
   fails; "true arithmetic" is complete but not effective.
7. **The Gödel sentence** (ch. 8): informal "I am unprovable" argument; the program `g`;
   `godel_key` as the diagonal step; sound version; "did we out-prove S?" (no: we assumed
   soundness); consistency version via Σ₁-completeness; why it can't show unrefutability
   (consistent-but-unsound extensions); constructivity; Gödel sentences have the same form as
   Goldbach's conjecture.
8. **Rosser** (ch. 9): racing a proof against a disproof; outputs; both cases in Lean; where
   consistency is used; inconsistent case; Aaronson's consistent-guessing view.
9. **Second theorem** (ch. 10): `Con` is a non-halting statement; `godel_first` *is*
   "Con → G"; formalized inside S gives the result; what it does and doesn't say (outside
   consistency proofs, Gentzen, no evidence of inconsistency); derivability conditions.
10. **Epilogue** (ch. 11): applying it to Lean; is the abstract `Computer` a cheat (Mathlib's
    `ComputablePred.halting_problem`); natural independent statements (CH, Goodstein,
    busy beavers); myth-busting.

## 4. Question design

Research on misconceptions (Franzén, *Gödel's Theorem: An Incomplete Guide to Its Use and
Abuse*; the SEP entry on the incompleteness theorems) and on the computational proofs suggested
these question types:

* **Predict the machine**: "What does `runFor (fun n => n - 1) 2 5` return?", "What is
  `nthString 2`?". Grounds abstractions in concrete evaluation.
* **Will Lean accept it?**: `rfl` on a false equation, `⟨2, rfl⟩` vs `⟨100, rfl⟩`.
  Builds the "proof = checkable program" intuition.
* **Goal-state questions**: "After `intro hp`, what's the goal?". Teaches reading tactic proofs.
* **Which hypothesis is used here?**: soundness vs completeness vs consistency at each proof step.
  This is the main tool for making sure the *method* is understood rather than memorized.
* **Case analysis of self-reference**: "Suppose `t` halts on `t`. What does `d` return? What does
  `t` then do?". Each diagonal argument is walked through case by case.
* **Patch attempts**: patched lists, patched halting testers, adding the Gödel sentence as an
  axiom. All three fail for the same reason.
* **Boundary questions**: total languages (no trolls), inconsistent systems (race promises
  nothing), weak complete theories (Presburger, real closed fields), "true arithmetic"
  (complete but not effective). They show why each hypothesis is needed.
* **Myth-busting**: "Gödel shows some truths are unknowable", "math is inconsistent",
  Lucas–Penrose, "incompleteness applies to every logic", "proof assistants are useless".

Every wrong option has its own explanation, and after a wrong answer the correct option's
explanation is shown too. Options are shuffled per question with a stable seed (Yes/No pairs
keep their natural order), because authored answer positions were heavily skewed.
