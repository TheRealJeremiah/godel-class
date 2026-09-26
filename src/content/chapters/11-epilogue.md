---
id: epilogue
title: Gödel, Lean, and you
subtitle: What it all means, and what it doesn't
emoji: 🧭
blurb: Does Gödel's theorem apply to Lean itself? Was our abstract Computer a cheat? And which popular claims about incompleteness are simply wrong? We finish with a tour of the real-world consequences and a myth-busting quiz.
---

We've proved Gödel's first incompleteness theorem, Rosser's strengthening, and the second incompleteness theorem, in Lean, from scratch. In this final chapter, let's step back and ask what we've really shown, and what it means for the tool we've been using all along.

[[Let's step back]]

## Recap: one trick, four theorems 🧵

Every result in this course came from the same move: **feed something to itself, and let it disagree with what it sees.**

| Chapter | Self-application | The disagreement |
|---|---|---|
| 3 | row `n` at column `n` | `diag` flips the diagonal |
| 5 | `troll(troll)` | loops iff the tester says it halts |
| 8 | `g(g)` | halts iff it finds a proof that it loops |
| 9 | `rosser(rosser)` | does the opposite of the first proof or disproof it finds |

::: question
What role does `no_liar : ¬ (P ↔ ¬ P)` play in all this?
- [x] It's the final contradiction: each construction produces something equivalent to its own negation
  Right. Cantor gets `b = !b`, Turing gets "halts ↔ doesn't halt". Gödel's version is subtler: it gets "halts ↔ provably loops", which becomes a contradiction only once we add soundness or consistency.
- [ ] None: it was just a warm-up exercise
  It was much more than a warm-up! It's the logical core of every diagonal argument.
:::

## Does Gödel apply to Lean? 🧪

Our theorems hold for any formal system satisfying the hypotheses. Let's check them for Lean:

* **Effective?** Yes. Lean's kernel is a program that checks proofs, and it always halts.
* **Can talk about programs, and check halting runs?** Yes. You can write an interpreter in Lean (we wrote a tiny one in chapter 4), and prove that a run halts with `⟨fuel, rfl⟩`.
* **Consistent?** Everyone believes so. Lean's logic is known to be consistent *if* a certain strong version of set theory is (ZFC plus some large cardinals). That's a relative result, and the second theorem says it has to be.

::: question
So, assuming Lean is consistent, which of these is true?
- [ ] Lean can prove every true statement about programs
  That's exactly what `godel_first` rules out.
- [x] There's a program `g` such that "g doesn't halt on g" is true, but Lean can't prove it
  Right. Lean's own Gödel program searches through Lean proofs for a proof that it loops, and never finds one. And Lean can't prove its own consistency either, by the second theorem.
- [ ] Lean is inconsistent, because it's incomplete
  Incompleteness is what we get *because* Lean is (presumably) consistent! Consistent and incomplete go together.
:::

::: question
Our Lean proof used a Lean-internal model of "formal system". When we apply the theorem to Lean itself, we reason about Lean *in* Lean. Is that circular?
- [ ] Yes, so the result is meaningless
  Reasoning about a system from inside itself isn't circular, it's just self-reference, which we now know is legitimate (it's how Gödel's sentence works!).
- [x] No: it's the same self-reference Gödel uses. And the theorem's hypotheses make clear exactly what's being assumed
  Right. The result is conditional: *if* Lean is consistent, then its Gödel sentence is unprovable. Lean can prove that conditional statement, but it can't discharge the condition, which is the second theorem.
:::

## Was the `Computer` a cheat? 🎩

We never implemented a real programming language. We assumed abilities like `HasTroll` and `HasRace`, and assumed S is `Effective`. Is that honest?

::: question
What would it take to remove the assumptions and prove everything for a real model of computation?
- [x] Define a real language with an interpreter, and prove that trolls, races and proof searches can be written in it
  Right. That's a big but routine job, like writing and verifying a compiler. Mathlib, Lean's main math library, has already done much of it for partial recursive functions (`Nat.Partrec.Code`), including its own proof of the halting problem, `ComputablePred.halting_problem`.
- [ ] It's impossible: real programs are too messy for Lean
  People have formalized real languages, interpreters, and even whole C compilers in proof assistants. It's hard work, but not impossible.
:::

For the curious, here is Mathlib's version of the theorem from chapter 5, from its documentation. It says no computable predicate on codes decides whether code `c` halts on input `n`:

```lean
theorem ComputablePred.halting_problem (n : ℕ) :
    ¬ ComputablePred fun (c : Nat.Partrec.Code) => (c.eval n).Dom
```

And people have formalized the whole of Gödel's theorems for real arithmetic, not just our abstract version: Natarajan Shankar in the 1980s, Russell O'Connor in Coq in 2005, Lawrence Paulson in Isabelle in 2014 (both theorems), and the [FormalizedFormalLogic/Foundation](https://github.com/FormalizedFormalLogic/Foundation) project in Lean 4, which proves both theorems for arithmetic. Those developments are thousands of lines long, because they do the arithmetization and derivability conditions that we assumed.

::: question
Which assumption does most of the work that we skipped?
- [ ] `HasTroll`
  Trolls are easy to write in any real language. That one's a genuinely small assumption.
- [x] That S can state halting claims (`S.halts`) and prove the true ones (`ProvesHalting`), plus, for the second theorem, `formalized_first`
  Right. For Peano arithmetic, making `S.halts` mean anything requires arithmetization, and `formalized_first` requires the derivability conditions. That's where the formal proofs get long. We isolated those parts behind clearly-named assumptions, so the core argument stays visible.
- [ ] `Sound`
  Our main theorems (`godel_first`, `rosser`, `second_incompleteness`) don't even assume soundness.
:::

## Real mathematics, really unprovable 📐

Gödel sentences are self-referential and a bit artificial. Are there *natural* statements that standard systems can't settle? Yes:

* **The continuum hypothesis** (is there an infinity strictly between the whole numbers and the real numbers?) is independent of ZFC set theory, by Gödel (1940) and Paul Cohen (1963).
* **Goodstein's theorem**, about a sequence of numbers that grows unimaginably large and then shrinks back to zero, is true but unprovable in Peano arithmetic (Kirby and Paris, 1982).
* **Busy beavers!** There's an explicit Turing machine with fewer than 750 states whose halting ZFC can neither prove nor disprove (assuming ZFC is consistent). Like our `findContradiction`, it essentially searches for a contradiction in ZFC.

::: question
The busy beaver number `BB(n)` is the longest any halting `n`-state Turing machine can run. Given the last bullet, what follows about `BB(750)`?
- [x] ZFC can't determine its value
  Right. If ZFC could compute `BB(750)`, it could run that ZFC-contradiction-searching machine for `BB(750)` steps, see that it doesn't halt by then, and conclude that it never halts, proving ZFC's own consistency. The second theorem says that can't happen.
- [ ] It's infinite
  Every `BB(n)` is a finite number, since there are finitely many `n`-state machines. It's just that ZFC can't pin this one down.
- [ ] It's undefined
  It's perfectly well defined: finitely many machines, take the longest-running halter. ZFC just can't prove what it is.
:::

## Myth busters 👻

Gödel's theorem is one of the most misquoted results in history. Let's finish by checking which popular claims survive what you now know.

::: question
Myth: "Gödel proved that some truths can never be known."
- [ ] True: that's the theorem
  Look at the theorem's statement: it's about one *particular* system S.
- [x] False: each unprovable sentence is unprovable *in a particular system*. A stronger system can prove it
  Right. For example, `S + Con(S)` proves S's Gödel sentence. Incompleteness is about the limits of each fixed, mechanical system, not about absolute knowledge.
:::

::: question
Myth: "Gödel showed that mathematics is inconsistent."
- [ ] True
  No such thing was shown!
- [x] False: the theorems *assume* consistency. They say consistent systems are incomplete and can't prove their own consistency
  Right. Consistency is the hypothesis, not the conclusion under attack.
:::

::: question
Myth: "Since a computer is a formal system, and human mathematicians can 'see' that Gödel sentences are true, human minds can't be computers."
- [ ] True: we proved the Gödel sentence true ourselves in chapter 8
  Look at what we actually proved in chapter 8: "*if* S is consistent, then G is true".
- [x] Unsupported: we only ever "see" G is true by *assuming* S is consistent, which S could assume too
  Right. This argument (made famous by John Lucas and Roger Penrose) is widely rejected by logicians. We never proved G outright, only that consistency implies G, which S itself can prove (that's the `formalized_first` assumption from chapter 10!).
- [ ] True, because Lean is a computer and can't prove its own Gödel sentence
  Lean can't, but neither can we without an extra assumption about Lean's consistency.
:::

::: question
Myth: "Incompleteness applies to every logical system."
- [x] False: it needs an effective system that's strong enough to talk about programs (or arithmetic)
  Right. Some weaker theories are complete. For example, the first-order theory of real numbers with `+`, `×` and `<` is complete and decidable (Tarski), and so is arithmetic with `+` but no `×` (Presburger arithmetic). They just can't express halting. And "all true statements" is complete, but not effective.
- [ ] True: it's a fundamental law of logic
  Look at our hypotheses: `Effective`, `ProvesHalting`, and statements about programs. Systems that lack them can escape.
:::

::: question
Myth: "Incompleteness means formal proofs, and proof assistants like Lean, are useless."
- [ ] True: if Lean can't prove everything, why bother?
  Almost all of the mathematics people actually do is well within reach of Lean's axioms.
- [x] False: incompleteness is about rare statements at the edge; everyday mathematics is unaffected
  Right. Mathlib contains a huge amount of formalized mathematics, and incompleteness has never blocked any of it. It's also a fact *about* formal systems that we just proved *with* a formal system. Rather a good advertisement for them!
:::

## The whole proof on one page 🗺️

@figure hypothesis-map

::: question
Last question! In one sentence, why is every consistent, effective formal system that can check computations incomplete?
- [x] Because a program can search its proofs, and so a program can ask about itself: "does anyone prove that I never halt?" Neither answer can be proved without breaking consistency
  That's it: Gödel's theorem in one sentence. Self-reference through self-application, plus the fact that proofs can be searched. Congratulations: you've understood, and checked in Lean, one of the deepest results in mathematics. 🎉
- [ ] Because formal systems are too weak to express interesting mathematics
  They express plenty of interesting mathematics! The problem is that they can express enough to talk about their own proof searches.
- [ ] Because Gödel found a bug in logic
  There's no bug. Logic works perfectly well; it just has limits, and incompleteness describes them precisely.
:::

## Where to go next 🚀

* Read the [complete Lean proof](#/source) from top to bottom. You can now read every line!
* Install Lean and run `lake build` in the `lean/` folder to check it yourself.
* Try extending it: prove **Tarski's theorem** ("truth is not definable") in the same abstract style, or prove that `HasRace` follows from a step-by-step interpreter.
* Read Scott Aaronson's [Rosser's theorem via Turing machines](https://scottaaronson.blog/?p=710), and Kirst and Peters' [Gödel's Theorem Without Tears](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CSL.2023.30), which proves this style of incompleteness in Coq.
* Play the [Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/nng4) to get fluent in Lean tactics.
* Try [Busy Beavers!](https://busy-beavers.tigyog.app/), the interactive computability course that inspired this one.

[[Finish the course! 🐍]]
