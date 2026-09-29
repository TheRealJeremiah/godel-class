---
id: godel
title: The sentence that says "I am unprovable"
subtitle: Gödel's first incompleteness theorem
emoji: 🐍
blurb: We build Gödel's sentence explicitly, as a program that searches for a proof that it loops. Then we prove it true but unprovable, first assuming soundness and then, like Gödel, only consistency. The heart of the course.
---

The last chapter showed that *some* statement escapes every sound, effective system, but it never said which one. Gödel did better. He wrote down a specific sentence and proved it unprovable. His sentence says, roughly:

> "This sentence is not provable."

In this chapter we'll build that sentence, using a program that reads its own source code, and prove that it is true but unprovable.

[[Build the sentence]]

## Truth versus provability, informally 🗣️

Let's first reason loosely. Write `G` for "this sentence is not provable in `S`", and assume `S` is sound: it only proves true things.

::: question
Could `S` prove `G`?
- [ ] Yes, since `G` is true
  Being true doesn't make a statement provable. That's exactly what's at stake.
- [x] No: if `S` proved `G`, then `G` would be false, so `S` would have proved something false
  Right. If `S` proves `G`, then `G` ("I'm not provable") is false. A sound system never proves false things, so `S` can't prove `G`.
- [ ] Yes, but only by accident
  A sound system never proves something false, not even by accident.
:::

::: question
So `S` doesn't prove `G`. Is `G` true?
- [x] Yes: `G` says "I'm not provable", and it isn't
  Right. So `G` is **true but unprovable**. And unlike the liar, there's no paradox: the argument ends in a conclusion, not a contradiction.
- [ ] No, it's false
  `G` claims it's not provable in `S`, and we just showed it isn't. So `G`'s claim is correct.
- [ ] Neither, like the liar
  The liar is contradictory either way. `G` isn't: "true and unprovable" is perfectly consistent.
:::

That's the whole idea. The hard part, the part that took Gödel dozens of pages, is making "*this* sentence" legitimate: a sentence in a formal language can't just point at itself. Gödel built self-reference out of arithmetic. We have a much easier tool: **programs that read their own source code.**

## Gödel's program 🐍

Remember `findLoopProof` from chapter 7? Given a program `x`, it searches for a proof that `x` loops on its own source:

```js
function g(x) {
  for (let n = 0; ; n++) {
    if (check(nthString(n)) === `¬ halts(${x}, ${x})`) return;
  }
}
```

Let's call it `g`. Now do what we did with the troll: **run `g` on its own source code.**

::: question
What does `g(g)` search for?
- [ ] A proof that `g` halts on `g`
  Look at the statement `g` checks for: it starts with `¬`.
- [x] A proof that `g` does **not** halt on `g`
  Right. The computation `g(g)` is searching for a proof that the computation `g(g)` never finishes!
- [ ] A proof that `g` is a valid program
  `g` only looks for one kind of statement: `¬ halts(x, x)` with `x` filled in.
:::

@figure godel-loop

Here's **Gödel's sentence**: "`g` does not halt on `g`". In Lean:

@snippet godel_def

::: question
The Gödel sentence says "`g(g)` never halts". Why does that amount to "this sentence is not provable"?
- [x] Because `g(g)` halts exactly when it finds a proof of this very sentence
  Right. "`g(g)` never halts" ⟺ "`g(g)` never finds a proof of the Gödel sentence" ⟺ "the Gödel sentence has no proof". So the sentence says of *itself* that it has no proof.
- [ ] Because programs that don't halt can't be proved
  Plenty of looping programs have proofs that they loop (chapter 4). What matters is *which* proof `g(g)` is looking for.
:::

## The key fact 🔑

That observation is the heart of the proof. Here it is precisely:

::: theorem The key fact
`g` halts on `g` **if and only if** `S` proves the Gödel sentence.
:::

It's just the definition of `findLoopProof` (it halts on `x` exactly when `S` proves "`x` loops on `x`"), applied with `x` equal to `g` itself.

@snippet godel_key

::: question
Choosing `x` to be `g` itself is the crucial move. What does it remind you of?
- [x] The diagonal: row `g`, column `g`, just like Cantor, Lawvere and the troll
  Right. `findLoopProof` works for every `x`, and we feed it its own source. Self-application is how we get self-reference.
- [ ] Induction
  There's no induction here: just one specific input.
:::

What does it mean for the Gödel sentence to be **true**? It's a halting statement, so (chapter 7) it's true exactly when the program really behaves as it says: **`g` really does not halt on `g`**.

::: unlock The Gödel sentence
Let `g` search for proofs that "`x` doesn't halt on `x`", and run it on itself. Then `g(g)` halts ⟺ `S` proves "`g(g)` doesn't halt". So the sentence `G` = "`g(g)` doesn't halt" is true exactly when `G` is not provable. It says "I am not provable".
:::

## The sound version ✓

::: theorem Gödel's theorem, sound version
If `S` is sound and effective, then the Gödel sentence is **true** (`g` doesn't halt on `g`) but **not provable**.
:::

**Proof.**

1. **True.** Suppose `g` halted on `g`. By the key fact, `S` would prove the Gödel sentence, "`g` doesn't halt on `g`". That's a false halting claim, and `S` is sound. Contradiction. So `g` doesn't halt on `g`.
2. **Not provable.** If `S` proved the Gödel sentence, then by the key fact `g` would halt on `g`, contradicting step 1. ∎

@proof godel_sound See the proof in Lean

::: question
In step 1, what exactly goes wrong if `g` halts on `g`?
- [ ] `S` becomes inconsistent
  In the sound version, the problem is with soundness, not consistency.
- [x] `S` would prove "`g` doesn't halt on `g`" while `g` does halt, and soundness forbids false proofs
  Right. By the key fact, `g` only halts by finding such a proof. So a halt means `S` lied.
:::

We can also show that a sound `S` can't *disprove* the Gödel sentence:

@proof godel_independent See "neither provable nor disprovable" in Lean

::: question
Why can't a sound `S` prove "`g` halts on `g`"?
- [x] By soundness it would be true, but step 1 showed `g` doesn't halt on `g`
  Right. So neither the Gödel sentence nor its negation is provable: an explicit **independent** statement.
- [ ] Because `S` can never prove that programs halt
  `S` can prove lots of true halting facts. This particular one is false.
:::

## Wait, we proved it? 🤯

::: question
We just proved that the Gödel sentence is true. `S` can't prove it. Does that make us smarter than every formal system?
- [ ] Yes: humans can see truths no formal system can
  A popular conclusion. But look carefully at what we actually proved.
- [x] No: we proved "**if `S` is sound**, then `G` is true". We *assumed* soundness, and `S` can't prove that about itself
  Right. We never proved `G` outright, only that soundness implies `G`. And in chapter 11 we'll see that `S` can't even prove its own consistency, let alone its soundness.
:::

## Dropping soundness: Gödel's theorem 🎩

Soundness is a strong assumption: it asks `S` to be *right* about programs. Gödel assumed only that `S` is **consistent**. The trick is to use a different, much milder assumption from chapter 7: `S` **checks computations**, so if a program really halts, `S` proves that it halts.

::: theorem Gödel's first incompleteness theorem
If `S` is consistent, effective, and checks computations, then the Gödel sentence is **true** but **not provable** in `S`.
:::

**Proof.**

1. **Not provable.** Suppose `S` proves the Gödel sentence, "`g` doesn't halt on `g`". By the key fact, `g` halts on `g`. Since `S` checks computations, `S` also proves "`g` halts on `g`". Now `S` proves a statement and its negation, so it's inconsistent. Contradiction.
2. **True.** If `g` halted on `g`, the key fact would make the Gödel sentence provable, contradicting step 1. So `g` doesn't halt on `g`. ∎

@proof godel_consistent See Gödel's theorem in Lean

::: question
In step 1, where does the second proof (of "`g` halts on `g`") come from?
- [x] `S` checks computations, and `g(g)` really does halt (in this hypothetical)
  Right. The run of `g(g)` is finite, so `S` can confirm it.
- [ ] From soundness
  This version doesn't assume soundness at all! That's the point.
- [ ] From the Gödel sentence itself
  The Gödel sentence says the *opposite*: that `g` doesn't halt on `g`.
:::

::: question
Which assumption did "checks computations" replace?
- [x] Soundness
  Right. Instead of trusting `S` to be right, we catch it contradicting itself. Checking finished computations is a very weak requirement that every reasonable system meets.
- [ ] Effectiveness
  We still need effectiveness: it's what makes `g` a program.
- [ ] Consistency
  Consistency is still assumed. It's what the contradiction in step 1 contradicts.
:::

::: question
In step 2 (showing the Gödel sentence is true), did we use the assumption that `S` checks computations?
- [x] No: only step 1's conclusion and the key fact
  Right. Once we know the Gödel sentence is unprovable, the key fact immediately says `g` doesn't halt on `g`. The "checks computations" assumption was only needed to rule out a proof in step 1.
- [ ] Yes, it's needed in both steps
  Look at step 2 again: it only uses the key fact and step 1.
:::

::: question
What would `g(g)` do if `S` were **inconsistent**?
- [x] Halt: an inconsistent system proves everything, including the Gödel sentence, so the search succeeds
  Right. So the Gödel sentence would be *false*. Its truth really does depend on `S` being consistent, which is why "consistent" appears in the theorem.
- [ ] Loop forever, as usual
  An inconsistent `S` proves every statement, so there *is* a proof for `g(g)` to find.
:::

::: question
Think back to the four outcomes from chapter 7 (proves `s` only, proves its negation only, both, neither). For a consistent `S`, which outcome does the Gödel sentence land in?
- [ ] "Both": `S` proves it and its negation
  That would make `S` inconsistent, and we assumed it's consistent.
- [ ] "Only the sentence": `S` proves it
  Step 1 showed `S` can't prove it.
- [x] Not the sentence itself: either "neither", or "only the negation" (a false proof)
  Right. `S` can't prove the Gödel sentence. If `S` is also sound, it can't prove the (false) negation either, so the sentence sits in the "neither" cell: a blank, so `S` is **incomplete**. With consistency alone, `S` might wrongly prove the negation instead. That's the gap Rosser closes in chapter 10.
:::

::: unlock Gödel's first incompleteness theorem
If `S` is consistent, effective, and checks computations, then "`g(g)` doesn't halt" is true but unprovable in `S`, where `g` searches for proofs that its input loops on itself.
:::

## The missing half 🧩

In the sound version, `S` could neither prove nor *disprove* the Gödel sentence. With only consistency, we showed it can't prove it. What about disproving it?

::: question
Could a consistent `S` prove "`g` halts on `g`", which is false?
- [x] Possibly! Consistency doesn't stop `S` from believing a false halting claim
  Right. To catch that lie, `S` would have to prove "`g` doesn't halt on `g`", and we just showed it can't. So the lie never produces a contradiction. The system "`S` plus the axiom `g` halts on `g`" is consistent but **unsound**: the example promised in chapter 7.
- [ ] No: that would make `S` inconsistent
  Being *wrong* isn't the same as being *inconsistent*. `S` would only be inconsistent if it also proved the opposite, and it can't.
:::

Gödel handled this with a stronger assumption called **ω-consistency** ("omega-consistency"). You don't need to know its details. It implies what we'd need here: `S` never proves that a program halts when it doesn't. Five years later, J. Barkley Rosser found a cleverer sentence that needs only plain consistency. That's the next chapter.

## Patch-proof, and ordinary 🛡️

::: question
"Easy fix," says a friend. "Add the Gödel sentence to `S` as a new axiom. Call the result `S′`." Is `S′` complete?
- [ ] Yes: the problem sentence is now provable
  `S′` is a new effective system, with a new proof checker. So it has a new `findLoopProof`, a new `g′`, and a new Gödel sentence.
- [x] No: `S′` has its own Gödel sentence, built from its own proof search
  Right. The Gödel program searches *that system's* proofs, so every patched system gets a new one. Incompleteness isn't a bug to fix; it's a property of every consistent, effective system that checks computations.
:::

::: question
Is the Gödel sentence a weird, artificial statement, unlike "real" mathematics?
- [ ] Yes, it's pure self-referential trickery
  Its *construction* is tricky, but its *form* is completely ordinary.
- [x] Its form is ordinary: "this program never halts". Famous open problems have the same form
  Right. Goldbach's conjecture ("every even number above 2 is a sum of two primes") says "the program that searches for a counterexample never halts". The Gödel sentence says the same kind of thing about a different search. We'll meet some "natural" independent statements in the last chapter.
- [ ] It's not really a statement, just a paradox
  Unlike the liar, it's a perfectly meaningful statement with a definite truth value: it's true, if `S` is consistent.
:::

::: question
Lean can report which axioms each theorem relies on. For Gödel's theorem above, it reports **none**: not even the law of excluded middle. Why might that be?
- [x] Every step builds one proof directly from another: "given a proof of `G`, here's a contradiction"
  Right. The argument never splits on an undecidable question like "does `g` halt?". It just transforms proofs into other proofs, which even the strictest constructive mathematician accepts.
- [ ] Because Lean didn't check it properly
  Lean checked every step. It's just that none of the steps needed any extra axioms.
:::

[[I am (not) convinced]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise godel-program Write Gödel's program
Write Gödel's program `g` as a generator: it searches the theorems of a consistent system for a proof that its input loops on itself, and halts if it finds one. The tests include running `g` on itself.
--- hint
Loop over `theorems()`. For each one, check whether it equals `"¬ halts(" + x + ", " + x + ")"`: if so, `return`; if not, `yield` (one step) and keep going.
--- solution
```js
function* g(x) {
  for (const t of theorems()) {
    if (t === "¬ halts(" + x + ", " + x + ")") return   // found a proof: halt
    yield                                               // one step per theorem
  }
}
```

`g("g")` runs forever, because a consistent system never proves "¬ halts(g, g)". So that statement is true and unprovable: Gödel's sentence.
:::

::: exercise godel-order Prove Gödel's first theorem
Put together the proof, assuming only that `S` is consistent, effective, and checks computations. Two of the steps don't belong.
--- hint
Suppose `S` proves G. Use the key fact, then "checks computations", to make `S` prove G's negation too.
--- solution
Every step depends on the one before, so there's just one valid order. The red herrings: this version doesn't assume soundness, and G being true doesn't make it provable.
:::
