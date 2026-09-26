---
id: second
title: Can a system prove it's consistent?
subtitle: Gödel's second incompleteness theorem
emoji: 🪞
blurb: Every theorem so far assumed consistency. Can a system prove its own consistency? Gödel's second theorem says no, and our Lean proof of the first theorem is almost exactly the reason why.
---

Every incompleteness theorem in this course comes with an asterisk: *if S is consistent*. So it would be nice if S could at least prove its own consistency. That was the plan of David Hilbert's program in the 1920s: to prove, using only simple, trustworthy methods, that mathematics never contradicts itself.

Gödel's second theorem, announced in the same 1931 paper, destroyed that plan. And you already know almost all of its proof.

[[Show me]]

## Consistency is a statement 🧾

For S to prove "I'm consistent", that has to be something S can *say*. It can, because consistency is a claim about a program:

```js
function findContradiction() {
  for (const proof of allStrings()) {
    if (check(proof) === "0 = 1") return true;
  }
}
```

::: question
S is consistent if and only if ...
- [ ] `findContradiction()` halts
  If it halts, it found a proof of `0 = 1`, so S proves something absurd. That's *in*consistency!
- [x] `findContradiction()` never halts
  Right. S is consistent exactly when the search for a proof of `0 = 1` never succeeds. So "S is consistent" is a statement of the form "this program doesn't halt", which S can state. We'll call that statement `Con`.
- [ ] `findContradiction()` returns `false`
  It never returns `false`: it either finds a proof and returns `true`, or it searches forever.
:::

::: aside Why "0 = 1" rather than "φ and not φ"?
For systems with ordinary logic they're equivalent: an inconsistent system proves everything, including `0 = 1`, and a system that proves `0 = 1` (and knows `0 ≠ 1`) is inconsistent. Searching for one fixed absurdity is just simpler to write down.
:::

## Look again at the first theorem 🔍

Here's the second half of `godel_first` from chapter 8, in plain words: "if S is consistent (and checks halting computations), then `g(g)` doesn't halt". That is:

> **Consistency implies the Gödel sentence.**

And we proved that in about ten lines of Lean, using nothing but definitions and simple logic.

::: question
S is supposed to be a strong system, like Lean or Peano arithmetic. Could S *itself* carry out that ten-line argument, and prove the statement "`Con` implies `G`"?
- [x] Yes: it's a short, elementary argument, and S is a strong system
  Right. That's the key insight of the second theorem. S can reason about its own proofs (they're just strings) and about its own proof searches (they're just programs). So S can follow the argument of chapter 8 and prove "if I'm consistent, then G".
- [ ] No: S can't reason about itself
  Since S can talk about programs, and its own proof checker is a program, it *can* reason about itself. That's what makes the Gödel sentence possible in the first place.
:::

Here's the setup in Lean. We need a system with implication and modus ponens, plus a sentence `Con`:

@snippet logical_system

`modus_ponens` says: if S proves `φ → ψ` and S proves `φ`, then S proves `ψ`. Every reasonable logic has it.

## The proof ✓

@snippet second

The assumption `formalized_first` says S proves `imp Con G`: "if I'm consistent, then G". That's chapter 8, formalized inside S.

::: question
Suppose S proves `Con`. What does `modus_ponens` give us?
- [ ] A proof that S is consistent
  S proving `Con` doesn't make S consistent! (An inconsistent S proves everything, `Con` included.) `modus_ponens` gives something else.
- [x] A proof in S of the Gödel sentence G
  Right: S proves `Con → G` and `Con`, so S proves G. But `godel_first` says a consistent S can't prove G. Contradiction!
- [ ] A proof of `False`
  Not directly: modus ponens gives a proof *in S* of G. The contradiction comes from `godel_first` on the next line.
:::

::: question
So a consistent S can't prove `Con`. Is `Con` true?
- [x] Yes, if S really is consistent: so `Con` is another true but unprovable sentence
  Right. Assuming S is consistent (and `Con` means what it says), `Con` is true. So S can't prove a very important truth about itself.
- [ ] No: if S can't prove it, it must be false
  That's the confusion Gödel's first theorem warns against! Unprovable doesn't mean false.
- [ ] We can't know
  We can know it *relative to our assumption*: if S is consistent, then `Con` is true (and unprovable in S).
:::

::: unlock Gödel's second incompleteness theorem
If S is consistent, effective, checks halting computations, and is strong enough to prove "if I'm consistent then G", then S can't prove its own consistency.
:::

## What it does and doesn't say 🧐

::: question
Suppose someone shows you a formal system that proves its own consistency statement `Con`, and it satisfies the other hypotheses. What should you conclude?
- [ ] Great news: now we know it's consistent
  If it satisfies the other hypotheses, proving `Con` is exactly what a consistent system can't do.
- [x] It's inconsistent
  Right. By the second theorem, a *consistent* system like that can't prove `Con`. So this one is inconsistent. (An inconsistent system proves everything, including its own consistency!) A proof of consistency from inside is worthless.
- [ ] It's complete
  Proving `Con` has nothing to do with completeness. But it does tell you something alarming.
:::

::: question
Can a *different*, stronger system T prove that S is consistent?
- [x] Yes, often it can
  Right. For example, ZFC set theory proves that Peano arithmetic is consistent. And in 1936 Gerhard Gentzen proved Peano arithmetic consistent using a principle called transfinite induction up to ε₀, which Peano arithmetic itself can't prove. The catch: T can't prove *its own* consistency, so we need T′ for T, and so on up.
- [ ] No: consistency can never be proved
  It can't be proved *from inside*. From a stronger vantage point, it often can.
:::

::: question
Does the second theorem suggest that mathematics (say, Peano arithmetic) might be inconsistent?
- [ ] Yes: if it can't prove it's consistent, it probably isn't
  The theorem shows the system *can't* prove its consistency either way. That's no evidence of inconsistency: a consistent system is exactly the kind that can't prove it.
- [x] No: it only says certainty about consistency must come from outside the system
  Right. Our confidence in Peano arithmetic comes from outside it: we have a clear picture of the natural numbers, Gentzen's proof, and a century of use without contradiction. The second theorem only says the system can't certify itself.
:::

::: aside Where's the hard part?
Our Lean proof of the second theorem is three lines, because we *assumed* `formalized_first`. In a real system like Peano arithmetic, justifying that assumption is where all the work is. You have to check that S can prove facts about its own provability, now known as the **Hilbert–Bernays–Löb derivability conditions**. Roughly: if S proves φ, then S proves "S proves φ"; S knows provability respects modus ponens; and S knows the first of these about itself. With those in hand, the formalized chapter 8 argument goes through. Lean-scale formalizations of this exist (see the epilogue), and they're thousands of lines long.
:::

::: question
In the Lean proof of `second_incompleteness`, which earlier theorem does all the real work?
- [ ] `halting_problem`
  Interestingly, no! The second theorem doesn't use the halting problem at all.
- [x] `godel_first`
  Right. The second theorem is the first theorem, internalized. S can prove "if I'm consistent, G is true", but S can't prove G, so S can't prove it's consistent.
- [ ] `rosser`
  Rosser's sentence isn't needed here. It's Gödel's sentence G that does the job.
:::

[[One last chapter]]
