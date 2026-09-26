---
id: godel
title: The sentence that says "I am unprovable"
subtitle: Gödel's first incompleteness theorem
emoji: 🐍
blurb: We build Gödel's sentence explicitly, as a program that searches for a proof that it loops. Then we prove it true but unprovable, first assuming soundness and then, like Gödel, only consistency. The heart of the course.
---

The last chapter showed that *some* statement escapes every sound, effective system, but it never told us which one. Gödel did better: he wrote down a specific sentence and showed it's unprovable. His sentence says, roughly:

> "This sentence is not provable."

In this chapter we'll build that sentence in Lean, using a program that reads its own source code, and prove that it is true and unprovable.

[[Build the sentence]]

## Truth versus provability 🗣️

Let's first reason informally. Write `G` for "this sentence is not provable in S", and assume S is sound (it only proves true things).

::: question
Could S prove `G`?
- [ ] Yes, since `G` is true
  Being true doesn't make a statement provable. That's exactly what's at stake!
- [x] No: if S proved `G`, then `G` would be false, and S would have proved something false
  Right. If S proves `G`, then `G` (which says "I'm not provable") is false. But a sound system only proves true things. So S can't prove `G`.
- [ ] Yes, but only by accident
  A sound system never proves false things, even "by accident". And `G` would be false the moment S proved it.
:::

::: question
So S doesn't prove `G`. Is `G` true?
- [x] Yes: `G` says "I'm not provable", and it isn't provable
  Right. So `G` is **true but unprovable**. No paradox: unlike the liar, the argument ends in a conclusion, not a contradiction. "True" and "provable" have come apart.
- [ ] No, it's false
  `G` claims it's not provable in S. We just showed it isn't. So `G`'s claim is correct.
- [ ] Neither, like the liar
  The liar leads to a contradiction either way. `G` doesn't: assuming it's unprovable is perfectly consistent.
:::

That's the whole idea. The hard part, the part that took Gödel dozens of pages, is making "*this* sentence" legitimate: a sentence in a formal language can't just point at itself. Gödel built self-reference out of arithmetic, with what's now called the *diagonal lemma*. We have a much easier tool: **programs that read their own source code.**

## Gödel's program 🐍

Remember `findLoopProof` from chapter 6? It takes a program `x`, and searches for a proof that `x` doesn't halt on `x`:

```js
function g(x) {
  for (const proof of allStrings()) {
    if (check(proof) === `¬ halts(${x}, ${x})`) return true;
  }
}
```

Let's call this program `g`. Now do what we did with the troll: **run `g` on its own source code.**

::: question
What does `g(g)` search for?
- [ ] A proof that `g` halts on `g`
  Look at the string `g` checks for: it starts with `¬`.
- [x] A proof that `g` doesn't halt on `g`
  Right. `g(g)` searches for a proof of the statement "`g(g)` doesn't halt". It's a computation searching for a proof that *it itself* never finishes!
- [ ] A proof that `g` is a valid program
  `g` only looks for one specific kind of statement: "¬ halts(x, x)", with `x` filled in.
:::

@figure godel-loop

So here's Gödel's sentence: **"`g` doesn't halt on `g`"**. In Lean:

@snippet godel_def

::: question
The Gödel sentence says "`g(g)` never halts". Why does that amount to "this sentence is not provable"?
- [x] `g(g)` halts exactly when it finds a proof of this very sentence
  Right. `g(g)` never halts ⟺ `g(g)` never finds a proof of "`g(g)` never halts" ⟺ that sentence has no proof. So the sentence says of *itself* that it has no proof. Self-reference, built from self-application.
- [ ] Because programs that don't halt are unprovable
  Plenty of non-halting programs have proofs that they don't halt (we proved one in chapter 4!). The special thing is *which* proof `g(g)` is looking for.
- [ ] It doesn't; they're unrelated
  They're closely related! Think about what `g(g)` is searching for.
:::

## The key fact 🔑

The observation we just made is the heart of the proof. Here it is in Lean:

@snippet godel_key

::: question
The proof of `godel_key` is a single line: `E.findLoopProof_spec (S.godelProgram E)`. Why does that work?
- [ ] Lean figured it out with automation
  No automation here. It's a direct application of an assumption, and it type-checks because both sides unfold to the same thing.
- [x] `findLoopProof_spec` says `findLoopProof` halts on `x` iff S proves "x loops on x". Plug in `x := g`, the program itself
  Exactly. The specification holds for *every* `x`, and we choose `x` to be the program itself. That's the diagonal move: row `g`, column `g`. The result unfolds to precisely `godel_key`.
- [ ] Because `g` is defined to be provable
  `g` is a program, not a statement. It's defined to *be* `findLoopProof`.
:::

::: unlock The Gödel sentence
Let `g` be the program that searches for a proof of "x doesn't halt on x", and run it on itself. Then:

`g(g)` halts  ⟺  S proves "`g(g)` doesn't halt".

The Gödel sentence `G` = "`g(g)` doesn't halt" is therefore true exactly when `G` is not provable. It says "I am not provable".
:::

## The sound version ✓

Now, assuming soundness, we can prove both halves of "true but unprovable":

@snippet godel_sound

::: question
In `godel_true`, we assume `hhalts : M.Halts g g` and derive a contradiction. What's `hprov`?
- [ ] A proof that `g` halts
  `hhalts` already says that. `hprov` is what `godel_key` gives us.
- [x] The fact that S proves the Gödel sentence ("g doesn't halt on g")
  Right. By `godel_key`, if `g(g)` halts, it found a proof of the Gödel sentence. So S proves "g doesn't halt on g" while g *does* halt on g. That violates soundness: `(hsound _ _).2 hprov hhalts : False`.
- [ ] A proof of `False`
  Not yet. `hprov : S.Provable (S.godelSentence E)`. Combined with soundness and `hhalts`, it gives `False` on the next line.
:::

::: question
And `godel_unprovable` is short. If S proved the Gödel sentence, what goes wrong?
- [ ] S would be inconsistent
  With the sound version, the contradiction comes from `godel_true`, not directly from consistency.
- [x] By `godel_key`, `g(g)` would halt, contradicting `godel_true`
  Right: `(S.godel_key E).mpr hprov : M.Halts g g`, and `godel_true` says that's impossible. (Remember the `.mpr` question from chapter 2? This is it!)
:::

We can also show that S can't *disprove* the Gödel sentence either:

@snippet godel_independent

::: question
Why can't a sound S prove `S.halts g g` ("g halts on g")?
- [ ] Because that statement is too long
  Length has nothing to do with it!
- [x] Because by soundness it would be true, but `godel_true` says `g` doesn't halt on `g`
  Right. A sound system only proves true halting claims, and "`g` halts on `g`" is false. So neither `S.halts g g` nor its negation is provable: an explicit **independent** statement.
- [ ] Because S can never prove that programs halt
  S can prove plenty of halting facts (in fact, all the true ones, if it has `ProvesHalting`). This particular one is false.
:::

## Wait, we proved it? 🤯

::: question
We just proved in Lean that the Gödel sentence is true (`godel_true`). But S can't prove it. So are we (with Lean) smarter than every formal system?
- [ ] Yes: humans can see truths no formal system can
  This is a popular conclusion, but look carefully at what we proved.
- [x] No: we proved "**if S is sound**, then G is true". S can't prove its own soundness, and we assumed it
  Right. Our Lean theorem has `hsound` as a hypothesis. We never proved `G` outright. We proved `Sound → G`. And in chapter 10 we'll see that S can't prove its own consistency, let alone soundness. There's no magic here.
- [ ] Yes, because Lean is not a formal system
  Lean is a formal system. And Lean has its own Gödel sentence, which Lean can't prove.
:::

## Dropping soundness: Gödel's theorem 🎩

Soundness is a strong assumption: it asks S to be *right* about halting. Gödel only assumed S is **consistent** (plus, as we'll see, a little more). The trick is to use `ProvesHalting` instead: S can confirm any computation that actually halts.

@snippet godel_consistent

::: question
Suppose S proves the Gödel sentence. By `godel_key`, `g(g)` halts. Then what does `ProvesHalting` give us?
- [x] A proof in S of "`g(g)` halts"
  Right: `hph g g hhalts : S.Provable (S.halts g g)`. S can check the finished run of `g(g)`.
- [ ] A proof in S of "`g(g)` doesn't halt"
  That's what we assumed S proves! `ProvesHalting` gives the opposite: that `g(g)` *does* halt.
- [ ] Nothing, since `ProvesHalting` only works for programs that loop
  It's the other way round: `ProvesHalting` gives proofs for programs that *halt*.
:::

::: question
So S proves "`g(g)` halts" *and* "`g(g)` doesn't halt". Which hypothesis does that contradict?
- [ ] Soundness
  Soundness isn't a hypothesis of `godel_first`! That's the point of this version.
- [x] Consistency
  Right: `hcon _ ⟨hprov2, hprov⟩` feeds both proofs to `hcon`, which says S never proves φ and `neg φ` together.
- [ ] Effectiveness
  Effectiveness gave us `godel_key`. The contradiction itself is with consistency.
:::

::: question
Notice that the second half, `¬ M.Halts g g`, still says the Gödel sentence is **true**. What did we need to know that?
- [ ] Soundness of S
  Not needed! Only `godel_key` and the first half.
- [x] Just that G is unprovable, plus `godel_key`
  Right. If `g(g)` halted, then by `godel_key` S would prove G, which the first half rules out. So if S is consistent (and confirms halting computations), G is true and unprovable.
:::

::: unlock Gödel's first incompleteness theorem
If S is consistent, effective, and proves every true "p halts on x", then the Gödel sentence "`g(g)` doesn't halt" is true, but S can't prove it.
:::

## The missing half 🧩

`godel_first` shows S can't *prove* the Gödel sentence. Before, with soundness, we also showed S can't *disprove* it. Why didn't we claim that here?

::: question
Can a consistent S prove `S.halts g g` ("g halts on g"), which is false?
- [x] Possibly! Consistency doesn't stop S from believing a false halting claim
  Right. To catch S lying about "g halts on g", you'd need S to prove "g doesn't halt on g", and we just showed it can't. So the lie never produces a contradiction. The system `S + "g halts on g"` (S with one extra axiom) is consistent but **unsound**: it's the example promised in chapter 6.
- [ ] No: `g(g)` doesn't halt, so S would be inconsistent
  S being *wrong* isn't the same as S being *inconsistent*. S would only be inconsistent if it also proved "g doesn't halt on g", and it can't.
:::

Gödel handled this with a stronger assumption he called **ω-consistency**. It implies what we'd need here: S never proves that a program halts when it doesn't. Five years later, J. Barkley Rosser found a cleverer sentence that needs only plain consistency. That's the next chapter.

## Constructive, and patch-proof 🛡️

Lean can list the axioms each theorem depends on. For `godel_first`, the answer is: **none**. No `Classical.choice`, no excluded middle. Just definitions and function application.

::: question
Compare with `halting_problem` from chapter 5, which (in its `by_cases` form) used classical logic. What's different about `godel_first`?
- [ ] It's a weaker theorem
  It's a strong theorem! The difference is in *how* it's proved.
- [x] Every step is a direct construction: assume a proof of G, and build a proof of `False` from it
  Right. We never had to split on an undecidable question. We just transform proofs into other proofs. Even the most skeptical constructive mathematician accepts it.
:::

::: question
"Easy fix," says a friend. "Add the Gödel sentence to S as a new axiom. Call it `S'`." Is `S'` complete?
- [ ] Yes: the one problematic sentence is now provable
  `S'` is a new effective system, with a new proof checker. So it has a new `findLoopProof`, a new `g'`, and a new Gödel sentence.
- [x] No: `S'` has its own Gödel sentence, built from its own proof search
  Right. The Gödel program depends on the system, since it searches *that system's* proofs. Patching S creates S′, and S′ has a new blind spot. Incompleteness isn't a bug to patch; it's what every consistent, effective system is like.
:::

::: question
Is the Gödel sentence a strange, artificial statement, unlike "real" mathematics?
- [ ] Yes, it's pure self-referential trickery
  Its *construction* is tricky, but its *form* is completely ordinary. What does it actually say?
- [x] Its form is ordinary: "this program never halts". Goldbach's conjecture has the same form
  Right. Goldbach's conjecture ("every even number above 2 is a sum of two primes") says "the program that searches for a counterexample never halts". The Gödel sentence says the same kind of thing about a different search. Later, mathematicians found "natural" statements that are independent of standard systems too. We'll meet some in the last chapter.
- [ ] It's not really a statement, just a paradox
  Unlike the liar, it's a perfectly meaningful statement with a definite truth value (it's true, if S is consistent).
:::

[[I am (not) convinced]]
