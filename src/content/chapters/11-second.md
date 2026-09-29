---
id: second
title: Can a system prove it's consistent?
subtitle: Gödel's second incompleteness theorem
emoji: 🪞
blurb: Every theorem so far assumed consistency. Can a system prove its own consistency? Gödel's second theorem says no, and our proof of the first theorem turns out to be almost exactly the reason why.
---

Every incompleteness theorem in this course comes with an asterisk: *if the system is consistent*. It would be reassuring if a system could at least prove that about itself. That was David Hilbert's plan in the 1920s: to prove, using only simple and trustworthy methods, that mathematics never contradicts itself.

Gödel's second theorem, announced in the same 1931 paper, ended that plan. And you already know almost all of its proof.

[[Show me]]

## Consistency is a statement about a program 🧾

For `S` to prove "I'm consistent", that has to be something `S` can *say*. It can, because consistency is a claim about a program:

```js
function findContradiction() {
  for (let n = 0; ; n++) {
    if (check(nthString(n)) === "0 = 1") return;   // found a proof of nonsense
  }
}
```

::: question
`S` is consistent if and only if ...
- [ ] `findContradiction()` halts
  If it halts, it found a proof of `0 = 1`, so `S` proves something absurd. That's *in*consistency.
- [x] `findContradiction()` never halts
  Right. `S` is consistent exactly when the search for a proof of `0 = 1` never succeeds. So "`S` is consistent" is a statement of the form "this program doesn't halt", which `S` can state. We'll call that statement `Con`.
:::

::: aside Why search for "0 = 1" rather than "some statement and its negation"?
For systems with ordinary logic they amount to the same thing. An inconsistent system proves everything, including `0 = 1`. And a system that proves `0 = 1` (and also knows `0 ≠ 1`, as any reasonable system does) is inconsistent. Searching for one fixed absurdity is just simpler to write down.
:::

::: question
What kind of statement is `Con`: a claim that a program halts, or that it loops?
- [x] That a program loops, like the Gödel sentence
  Right. And by the halting asymmetry, loop claims are exactly the kind that formal systems can struggle to prove. That's a hint of what's coming.
- [ ] That a program halts
  `Con` says the contradiction search *never* finishes.
:::

## Look again at the first theorem 🔍

Here's half of Gödel's first theorem from chapter 9, in plain words:

> If `S` is consistent (and checks computations), then `g` doesn't halt on `g`.

In other words: **consistency implies the Gödel sentence.** And our proof of it was about ten lines long, using nothing but definitions and simple logic.

::: question
`S` is supposed to be a strong system, like Peano arithmetic or Lean. Could `S` itself follow that ten-line argument, and prove the statement "`Con` implies `G`"?
- [x] Yes: it's a short, elementary argument, and `S` can reason about its own proofs and proof searches
  Right. That's the key insight. `S`'s proofs are just strings, and its proof searches are just programs, so `S` can reason about them. So `S` can prove "if I am consistent, then `G`".
- [ ] No: a system can't reason about itself
  Since `S` can talk about programs, and its own checker is a program, it *can* reason about itself. That's what made the Gödel sentence possible in the first place.
:::

## The theorem 🎯

::: theorem Gödel's second incompleteness theorem
If `S` is consistent, effective, checks computations, and can prove "`Con` implies `G`", then `S` cannot prove `Con`.
:::

**Proof.** Suppose `S` proves `Con`. `S` also proves "`Con` implies `G`". By ordinary logic (if you've proved `A`, and proved "`A` implies `B`", you've proved `B`), `S` proves `G`. But the first theorem says a consistent `S` can't prove `G`. Contradiction. ∎

That's the whole argument. The rule "from `A` and `A` implies `B`, conclude `B`" is called **modus ponens**. To state the theorem in Lean, we give our system an "implies" and modus ponens:

@snippet logical_system

::: note
**A careful point about `Con`.** In the Lean model, `Con` is just a name for some statement. Nothing in the definition says it means "`S` is consistent"! Its meaning enters in exactly one place: the assumption that `S` proves "`Con` implies `G`". For a real system like Peano arithmetic, `Con` is the statement "`findContradiction` never halts", and establishing that assumption is the hard part (see the aside below).
:::

@proof second See the second theorem in Lean

::: question
Suppose `S` proves `Con`. What does modus ponens give us?
- [ ] A proof that `S` is consistent
  `S` proving `Con` doesn't make `S` consistent. (An inconsistent `S` proves everything, `Con` included!)
- [x] A proof in `S` of the Gödel sentence
  Right: `S` proves "`Con` implies `G`" and `Con`, so `S` proves `G`. But the first theorem says a consistent `S` can't.
- [ ] A proof of `0 = 1`
  Modus ponens gives a proof of `G`. The contradiction comes from comparing that with the first theorem.
:::

::: question
So a consistent `S` can't prove `Con`. Is `Con` *true*?
- [x] Yes, if `S` really is consistent: `Con` is another true but unprovable sentence
  Right. If `S` is consistent, `findContradiction` really does run forever, so `Con` is true. `S` just can't prove it.
- [ ] No: if `S` can't prove it, it must be false
  That's exactly the confusion the first theorem warns against. Unprovable isn't the same as false.
:::

::: unlock Gödel's second incompleteness theorem
The first theorem, "consistent implies `G`", can be proved *inside* any strong enough system. So if the system could prove its own consistency, it could prove `G`, which the first theorem forbids. A consistent system can't prove its own consistency.
:::

## What it does and doesn't say 🧐

::: question
Someone shows you a system that meets all the hypotheses *and* proves its own consistency statement `Con`. What should you conclude?
- [ ] Great: now we know it's consistent
  A consistent system meeting these hypotheses *can't* prove `Con`. So...
- [x] It's inconsistent
  Right. An inconsistent system proves everything, including its own consistency. So a proof of consistency from inside is worthless.
:::

::: question
Can a *stronger* system `T` prove that `S` is consistent?
- [x] Yes, often it can
  Right. ZFC set theory proves that Peano arithmetic is consistent. And in 1936, Gerhard Gentzen proved Peano arithmetic consistent using a principle ("transfinite induction up to ε₀") that Peano arithmetic itself can't prove. The catch: `T` can't prove *its own* consistency, so you'd need a stronger `T′`, and so on.
- [ ] No: consistency can never be proved
  It can't be proved from *inside*. From a stronger vantage point, it often can.
:::

::: question
Does the second theorem suggest that Peano arithmetic might be inconsistent?
- [ ] Yes: if it can't prove it's consistent, it probably isn't
  A consistent system is exactly the kind that can't prove its consistency. So this is no evidence at all.
- [x] No: it only says that confidence in a system's consistency has to come from outside it
  Right. Our confidence in Peano arithmetic comes from outside it: a clear picture of the whole numbers, Gentzen's proof, and over a century of use without contradiction.
:::

::: question
Now a mind-bender. Take a consistent `S`, and add one new axiom: "`S` is inconsistent" (that is, `¬ Con`). Is the new system consistent?
- [ ] No: it claims its own base system is inconsistent, which is false, so it must contradict itself
  Being *false* isn't the same as producing a contradiction. To contradict the new axiom, the system would have to prove `Con`...
- [x] Yes: to contradict the new axiom it would need to prove `Con`, and the second theorem says `S` can't
  Right. The new system is consistent but **unsound**: it believes a false statement about a program (`findContradiction` "halts"). It's the most dramatic example yet of consistency and truth coming apart.
:::

::: question
Take `T` to be `S` plus the axiom `Con` ("`S` is consistent"). Can `T` prove its own consistency?
- [ ] Yes: it has consistency as an axiom
  It has *`S`'s* consistency as an axiom. `T` is a different system, with its own consistency statement.
- [x] No, if `T` is consistent: the second theorem applies to `T` too
  Right. `T` proves that `S` is consistent, but not that `T` is. Every consistent, effective system has a consistency statement just out of its own reach.
:::

::: aside Where's the hard part?
Our Lean proof of the second theorem is three lines, because we *assumed* that `S` can prove "`Con` implies `G`". For a real system, justifying that is where all the work is. You have to check that `S` can reason about its own provability well enough. The standard checklist is called the **Hilbert–Bernays–Löb derivability conditions**. Roughly: if `S` proves something, then `S` can prove that it proves it; `S` knows that provability respects modus ponens; and `S` knows the first condition about itself. With those in hand, `S` can carry out the chapter 9 argument internally. Full formalizations exist (see the last chapter), and they run to thousands of lines.
:::

::: question
In the proof of the second theorem, which earlier result does the real work?
- [ ] The halting problem
  Interestingly, no. The second theorem doesn't use the halting problem at all.
- [x] Gödel's first theorem
  Right. The second theorem is the first theorem, internalized: `S` can prove "if I'm consistent, `G` is true", but `S` can't prove `G`, so `S` can't prove it's consistent.
- [ ] Rosser's theorem
  Rosser's sentence isn't needed here. It's Gödel's sentence `G` that does the job.
:::

[[One last chapter]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise second-order Prove the second incompleteness theorem
Put together the proof that a consistent system can't prove its own consistency. Two of the steps don't belong.
--- hint
Suppose `S` proves `Con`. What does modus ponens give you, and why is that impossible?
--- solution
Every step depends on the one before. The red herrings: an inconsistent system proves `Con` too, so proving it shows nothing, and `Con` is true (if `S` is consistent), just unprovable.
:::

::: exercise not-con-order Prove that S + ¬Con is consistent
Show that adding the false axiom "`S` is inconsistent" to a consistent `S` doesn't create a contradiction. Two of the steps don't belong.
--- hint
A new axiom only causes a contradiction if the system could already disprove it. What would disproving `¬Con` mean?
--- solution
The second theorem and the fact about adding axioms can come in either order. The red herrings: a false axiom isn't automatically contradictory, and the new system proves `¬Con`, not its own consistency.
:::
