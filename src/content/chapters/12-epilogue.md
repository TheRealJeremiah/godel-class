---
id: epilogue
title: Gödel, Lean, and you
subtitle: What it all means, and what it doesn't
emoji: 🧭
blurb: Does Gödel's theorem apply to Lean itself? What did we assume, and how do full formalizations remove those assumptions? Which famous claims about incompleteness are simply wrong? We finish with real-world consequences and a myth-busting quiz.
---

We've proved the halting problem, Gödel's first incompleteness theorem, Rosser's strengthening, and the second incompleteness theorem, with every step checked by Lean. In this final chapter, let's step back and ask what we've really shown, and what it means for mathematics and for the tool we've been using.

[[Let's step back]]

## One trick, many theorems 🧵

Every major result came from the same move, the one Lawvere made precise in chapter 3: **feed something to itself, and have it disagree with what it sees.**

| Chapter | Self-application | The disagreement |
|---|---|---|
| 2 | row `n` at column `n` | `diag` flips the diagonal |
| 3 | "`x` is a member of `x`" | Russell: the set of sets not in themselves |
| 6 | `troll(troll)` | it loops exactly when it's predicted to halt |
| 9 | `g(g)` | it halts exactly when it finds a proof that it loops |
| 10 | `rosser(rosser)` | it contradicts the first proof or disproof it finds |

::: question
What role does the liar lemma, "no statement is equivalent to its own negation", play in all this?
- [x] It's the final step: each construction produces something that would be equivalent to its own negation
  Right. Cantor gets a bit equal to its own flip, Turing gets "halts ↔ doesn't halt". Gödel's version is subtler, "halts ↔ provably loops", which becomes a contradiction once we add soundness or consistency.
- [ ] None: it was just a warm-up
  It was much more than a warm-up. It's the logical core of every diagonal argument.
:::

::: question
And what role did Post's theorem play?
- [x] It turned "halting is undecidable" into "looping isn't even recognizable", which is what formal systems run into
  Right. A formal system's theorems can always be searched, so they're recognizable. That's why "looping", which isn't recognizable, is where every effective system must fall short.
- [ ] None: it was a side topic
  It was the bridge between chapter 6 and chapter 8: "no program recognizes looping" is the fact the first incompleteness proof collides with.
:::

## Does Gödel apply to Lean? 🧪

Our theorems hold for every formal system that meets their assumptions. Let's check them for Lean itself:

* **Effective?** Yes. Lean's proof checker is a program, and it always finishes.
* **Can state halting claims, and checks computations?** Yes. You can write an interpreter in Lean (we wrote a tiny one in chapter 4), and prove that a run halts by giving the fuel.
* **Consistent?** Everyone believes so. Lean's logic is known to be consistent *if* a certain strong version of set theory is (ZFC plus some large-infinity axioms). That's a relative result, and the second theorem says it has to be.

::: question
So, assuming Lean is consistent, which of these is true?
- [ ] Lean can prove every true statement about programs
  That's exactly what Gödel's first theorem rules out.
- [x] There's a program `g` such that "`g` doesn't halt on `g`" is true, but Lean can't prove it
  Right. Lean's own Gödel program searches Lean proofs for a proof that it loops, and never finds one. And by the second theorem, Lean can't prove its own consistency either.
- [ ] Lean is inconsistent, because it's incomplete
  Incompleteness is what you get *because* a system is consistent. They go together.
:::

::: question
Our proofs model "any formal system" inside Lean. When we apply them to Lean itself, we're reasoning about Lean in Lean. Is that circular?
- [ ] Yes, so the result is meaningless
  Reasoning about a system from inside itself isn't circular. It's just self-reference, which we now know is perfectly legitimate.
- [x] No: the result is conditional ("*if* Lean is consistent, then ..."), and the assumptions are stated explicitly
  Right. Lean can prove the conditional statement. What it can't do is discharge the condition, and that's the second theorem.
:::

## What did we assume? 🎩

We never implemented a real programming language, or a real formal system like Peano arithmetic. Instead, we named exactly what we needed:

* **Computer abilities:** guards (`haltIfYes` / `haltIfNo`), racing, and running a program on itself.
* **Formal system assumptions:** it can state halting claims, it's effective, it checks computations, and (for the second theorem) it can follow the proof of the first.

::: question
Which of those assumptions hides the most work, if you wanted to prove everything for Peano arithmetic from scratch?
- [ ] The guards ability
  Guards are an `if` and a loop. Every real language has them trivially.
- [x] That the system can state and check halting claims, and (for the second theorem) follow the first theorem's proof
  Right. For Peano arithmetic, the first requires arithmetization (encoding programs as numbers), and the second requires the derivability conditions. That's where full formal proofs get long. We isolated those parts behind named assumptions so the core argument stays visible.
- [ ] Soundness
  Our main theorems (Gödel's first, Rosser's, and the second theorem) don't even assume soundness.
:::

Others have done that full work. For example, Lean's main mathematics library, Mathlib, has its own proof of the halting problem for a real model of computation ("partial recursive functions"). Here's its statement, from Mathlib's documentation:

```lean
theorem ComputablePred.halting_problem (n : ℕ) :
    ¬ ComputablePred fun (c : Nat.Partrec.Code) => (c.eval n).Dom
```

And the incompleteness theorems have been fully formalized for real arithmetic: by Natarajan Shankar in the 1980s, Russell O'Connor in Coq in 2005, Lawrence Paulson in Isabelle in 2014 (both theorems), and the [FormalizedFormalLogic/Foundation](https://github.com/FormalizedFormalLogic/Foundation) project in Lean 4. Those developments are thousands of lines long, because they do the arithmetization and derivability conditions that we assumed.

## Real mathematics, really unprovable 📐

Gödel sentences are self-referential and a bit artificial. Are there *natural* questions that standard systems can't settle? Yes:

* **The continuum hypothesis** ("is there an infinity strictly between the whole numbers and the real numbers?") is independent of ZFC, by Gödel (1940) and Paul Cohen (1963).
* **Goodstein's theorem**, about a sequence of numbers that grows unimaginably large and then shrinks back to zero, is true but unprovable in Peano arithmetic (Kirby and Paris, 1982).
* **Busy beavers.** There's an explicit Turing machine with fewer than 750 states whose halting ZFC can neither prove nor disprove (assuming ZFC is consistent). Like our `findContradiction`, it essentially searches for a contradiction in ZFC.

::: question
The busy beaver number `BB(n)` is the longest any halting `n`-state Turing machine runs before stopping. Given the last bullet, what follows about `BB(750)`?
- [x] ZFC can't determine its value
  Right. If ZFC could prove `BB(750) = N`, it could run that contradiction-searching machine for `N` steps, see that it hasn't halted, and conclude it never halts. That would prove ZFC's own consistency, which the second theorem forbids.
- [ ] It's infinite
  Every `BB(n)` is a finite number, since there are finitely many `n`-state machines. ZFC just can't pin this one down.
- [ ] It's undefined
  It's perfectly well defined: finitely many machines, take the longest-running one that halts.
:::

## Myth busters 👻

Gödel's theorem is one of the most misquoted results in history. Let's finish by checking some popular claims against what you now know.

::: question
Myth: "Gödel proved that some truths can never be known."
- [ ] True: that's the theorem
  Look at the theorem again: it's about one *particular* formal system.
- [x] False: each unprovable sentence is unprovable *in a particular system*. A stronger system can prove it
  Right. For example, `S` plus the axiom "`S` is consistent" proves `S`'s Gödel sentence. Incompleteness is about the limits of each fixed, mechanical system, not about absolute knowledge.
:::

::: question
Myth: "Gödel showed that mathematics is inconsistent."
- [ ] True
  Nothing of the sort was shown.
- [x] False: the theorems *assume* consistency, and conclude that consistent systems are incomplete and can't prove their own consistency
  Right. Consistency is the hypothesis, not the thing under attack.
:::

::: question
Myth: "Computers are formal systems, but human mathematicians can 'see' that Gödel sentences are true. So human minds can't be computers."
- [ ] True: we proved the Gödel sentence ourselves in chapter 9
  Look at what we actually proved in chapter 9: "*if* `S` is consistent, then `G` is true".
- [x] Unsupported: we only ever "see" that `G` is true by *assuming* `S` is consistent, and `S` could make the same assumption
  Right. This argument, made famous by John Lucas and Roger Penrose, is widely rejected by logicians. We never proved `G` outright, only "consistent implies `G`", which `S` itself can prove.
:::

::: question
Myth: "Incompleteness applies to every logical system."
- [x] False: it needs an effective system that's strong enough to talk about programs (or arithmetic)
  Right. Evens from chapter 1 is complete! So is the theory of real numbers with `+`, `×` and `<` (Tarski), and arithmetic with `+` but no `×` (Presburger). They just can't express halting. And "all true statements" is complete, but not effective.
- [ ] True: it's a fundamental law of logic
  Look at our assumptions: effective, checks computations, can state halting claims. Systems without them can escape.
:::

::: question
Myth: "Incompleteness means formal proofs, and proof assistants like Lean, are pointless."
- [ ] True: if Lean can't prove everything, why bother?
  Almost all the mathematics people actually do is well within reach of Lean's axioms.
- [x] False: incompleteness is about rare statements at the edge; everyday mathematics is unaffected
  Right. Mathlib contains a vast amount of formalized mathematics, and incompleteness has never blocked any of it. And we just used a formal system to prove a theorem *about* formal systems. Rather a good advertisement!
:::

## The whole proof on one page 🗺️

@figure hypothesis-map

::: question
Last question! In one sentence, why is every consistent, effective formal system that checks computations incomplete?
- [x] Because a program can search its proofs, so a program can ask about itself: "does anyone prove that I never halt?", and neither answer can be proved without breaking consistency
  That's it: Gödel's theorem in one sentence. Self-reference through self-application, plus the fact that proofs can be searched. Congratulations: you've understood one of the deepest results in mathematics, and seen it checked by a computer. 🎉
- [ ] Because formal systems are too weak to express interesting mathematics
  They express plenty! The problem is that they're strong enough to talk about their own proof searches.
- [ ] Because Gödel found a bug in logic
  There's no bug. Logic works perfectly well; it just has limits, and incompleteness describes them exactly.
:::

## Where to go next 🚀

* Read the [complete Lean proof](#/source) from top to bottom.
* Install Lean and run `lake build` in the `lean/` folder to check it yourself.
* Try extending it: prove **Tarski's theorem** ("truth can't be defined inside the system") in the same style.
* Read Scott Aaronson's [Rosser's theorem via Turing machines](https://scottaaronson.blog/?p=710), and Kirst and Peters' [Gödel's Theorem Without Tears](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CSL.2023.30), which proves this style of incompleteness in Coq.
* Play the [Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/nng4) to learn to write Lean proofs yourself.
* Try [Busy Beavers!](https://busy-beavers.tigyog.app/), the interactive computability course that inspired this one.

[[Finish the course! 🐍]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise big-picture-order The whole course in one proof
Put the course's main steps in order, from the halting problem to incompleteness. Two of the steps don't belong.
--- hint
There are two threads: one about programs (halting, Post's theorem, looping) and one about proofs (searching them). They meet in the last step.
--- solution
Many orders work, since the programs thread and the proofs thread are independent until the end. The red herrings: Gödel's theorems assume consistency rather than finding a contradiction, and every statement about halting is true or false; the system just can't prove which.
:::
