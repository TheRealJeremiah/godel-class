---
id: formal
title: Formal systems
subtitle: Consistent, complete, sound, and searchable
emoji: 🤵
blurb: We model a formal system in Lean, define what it means to be consistent, complete and sound, and prove that a program can search through every possible proof. That last fact is what dooms formal systems to incompleteness.
---

We've seen what programs can't do. Now we turn to what *proofs* can't do. To talk about "any formal system" in Lean, we'll do what we did for programs: write down only the few things we need to know about it, and prove our theorems for every system at once.

[[Formalize the formal!]]

## A formal system, in Lean 🏛️

@snippet formal_system

Let's unpack the four fields:

* `Stmt` is the type of statements the system can make. For Lean itself, think `Prop`. For Peano arithmetic, it's formulas about numbers.
* `Provable φ` says the system has a proof of `φ`.
* `neg φ` is the statement "not φ". (We call it `neg` rather than `not`, to keep it apart from Lean's own `¬`.)
* `halts p x` is the system's *statement* that program `p` halts on input `x`.

::: question
What's the difference between `M.Halts p x` and `S.halts p x`?
- [ ] They're the same thing, written twice
  They have different types! One is a Lean `Prop`, the other is an `S.Stmt`.
- [x] `M.Halts p x` is the *fact* (a Lean `Prop`); `S.halts p x` is a *sentence* in the system `S`, which S may or may not prove
  Exactly. `M.Halts p x` is whether `p` *really* halts. `S.halts p x` is just a string of symbols in S's language that *claims* it does. The whole game is about how these two relate.
- [ ] `S.halts` is a program that runs `p`
  `S.halts p x` is a statement, not a program. It doesn't run anything; it just claims something.
:::

::: aside Wait, how can a system like Peano arithmetic talk about programs?
Peano arithmetic only knows about natural numbers, `+` and `×`. Gödel's paper spends most of its pages on exactly this problem, now called **arithmetization**. You encode a program as a number (a "Gödel number"), encode each step of a computation as a number, and write a formula that says "there's a number encoding a finished run of program `p` on input `x`". It's fiddly but routine, like writing an interpreter in a very low-level language.

We skip all of that by *assuming* the system has a statement `S.halts p x`. For Lean the assumption is easy to believe: you could write an interpreter in Lean and state `∃ fuel, run fuel p x = done`, just like our toy machine.
:::

## Consistent and complete 👍👎

Here are the two properties at the center of Gödel's theorem:

@snippet consistent_complete

::: question
Imagine a silly system that proves *every* statement. Is it consistent? Is it complete?
- [ ] Consistent and complete: the perfect system!
  It proves `φ` *and* `neg φ` for every `φ`. That's the definition of inconsistent.
- [x] Complete, but not consistent
  Right. It proves everything, so it certainly proves `φ` or `neg φ` (it's complete). But it also proves both (it's inconsistent). Completeness is trivial if you don't care about consistency.
- [ ] Consistent, but not complete
  It proves `φ` and `neg φ` for every `φ`, which is exactly what consistency forbids.
:::

::: question
And a system that proves *nothing at all*?
- [x] Consistent, but not complete
  Right. It never proves anything, so it never proves a contradiction. But it's hopelessly incomplete. Consistency alone is trivial too.
- [ ] Complete, but not consistent
  It never proves `φ` or `neg φ`, so it's not complete. And it never proves both, so it is consistent.
- [ ] Neither
  It proves nothing, so it can't prove a contradiction. It's consistent (though useless).
:::

So each property is easy on its own. The dream, pursued by the mathematician David Hilbert and his school in the 1920s, was a system that has **both**: it settles every question, and never contradicts itself. Gödel's theorem says that dream is impossible (for systems strong enough to talk about programs).

::: question
In standard logic, an inconsistent system can prove *every* statement, because from `φ` and `¬ φ` you can derive anything. Which Lean fact from chapter 1 is behind this?
- [ ] `and_swap`
  `and_swap` just flips a pair. The key is what you can do with a contradiction.
- [x] From `False` you can prove anything, since `¬ φ` is a function `φ → False`
  Right. Given `hφ : φ` and `hnφ : ¬ φ`, the term `hnφ hφ` has type `False`, and `False.elim` turns a proof of `False` into a proof of anything. This is called the **principle of explosion**. So an inconsistent system is worthless: it "proves" `0 = 1`.
:::

## Soundness 😇

Consistency says a system doesn't contradict *itself*. **Soundness** is stronger: it says the system doesn't contradict *reality*. We only need it for halting statements:

@snippet sound

In words: if S proves "p halts on x", then p really does halt on x; and if S proves "p doesn't halt on x", then p really doesn't.

@snippet sound_consistent

::: question
`sound_no_halting_contradiction` says a sound system never proves both `S.halts p x` and its negation. Why is that true?
- [ ] Because sound systems are complete
  Soundness doesn't say anything about completeness. It only restricts what *is* proved.
- [x] Because then `p` would both halt and not halt, which is impossible
  Right. The first proof gives `M.Halts p x`, and the second gives `¬ M.Halts p x`. So soundness implies consistency, at least for halting statements.
:::

::: question
Does it work the other way? Can a consistent system be *unsound*?
- [x] Yes: it can consistently prove false things
  Right. Take a program `p` that really loops, and add the axiom "`p` halts on `x`" to a system. The new system proves something false, but might still never prove a contradiction, because checking that "`p` halts" is false requires proving "`p` loops", which might be beyond it. We'll build exactly such a system in chapter 8.
- [ ] No: if it proves something false, it must eventually prove a contradiction
  Surprisingly, no! A false statement can hide from contradiction forever if the system is too weak to *disprove* it. Chapter 8 has an example.
:::

## Checking computations ✅

One more property. Recall the halting asymmetry from chapter 4: to show that a program halts, you just run it. Any reasonable system can turn a finished run into a proof:

@snippet proves_halting

Mathematicians call this **Σ₁-completeness** ("sigma-one completeness"). It's a very weak requirement: Peano arithmetic has it, Lean has it, and even very weak systems like Robinson arithmetic have it.

::: question
Why is it reasonable to assume `S.ProvesHalting` for systems like Lean?
- [x] If `p` halts on `x`, its run is finite, and the system can check that run step by step, like `⟨fuel, rfl⟩`
  Right. Just like `countdown_halts := ⟨3, rfl⟩`, the proof is "here's how many steps it takes, and here's the computation". No insight required, just patience.
- [ ] Because Lean can decide whether any program halts
  No system can do that! That's the halting problem. `ProvesHalting` only promises proofs for programs that *do* halt.
:::

::: question
Does `ProvesHalting` also promise proofs of `S.neg (S.halts p x)` for programs that loop?
- [ ] Yes, that's the other half
  Look at the definition: it only mentions `M.Halts p x → S.Provable (S.halts p x)`. Nothing about looping.
- [x] No, and it couldn't: proving that things loop needs insight, not patience
  Right. Proving non-halting needs invariants and induction, as in chapter 4. No system gets them all. Keep an eye on this asymmetry: Gödel's unprovable sentence will be a claim that some program **loops**.
:::

## Listing every proof 🔢

Now for the crucial property: a program can **search through all the proofs** of the system. First, a fact about strings. Every proof is written down as a string, and every string can be written in binary. Here's a way to list every bit string:

@snippet nth_string

@figure string-list

::: question
What is `nthString 2`? Remember that `nthString (n + 1) = (n % 2 == 1) :: nthString (n / 2)`.
- [ ] `[false]`
  That's `nthString 1`: with `n = 0`, we get `(0 % 2 == 1) :: nthString 0 = false :: []`.
- [x] `[true]`
  Right. `2 = 1 + 1`, so `n = 1`: we get `(1 % 2 == 1) :: nthString (1 / 2) = true :: nthString 0 = [true]`.
- [ ] `[false, false]`
  That's `nthString 3`. Try the figure above to check!
:::

::: question
What is `indexOf [true]`, according to the definition?
- [x] `2`
  Right: `indexOf (true :: []) = 2 * indexOf [] + 2 = 2 * 0 + 2 = 2`. And `nthString 2 = [true]`, so they agree.
- [ ] `1`
  `indexOf (b :: s)` adds `2` when `b` is `true`, and `1` when it's `false`. `1` is the index of `[false]`.
- [ ] `0`
  `0` is the index of the empty string `[]`.
:::

Lean proves that the list really contains everything:

@snippet every_string_listed

::: question
Why does `nthString_indexOf` need induction?
- [ ] Because it's about natural numbers
  It's actually by induction on the *list* `s`, not on a number.
- [x] Because it's a claim about *every* list, however long
  Right. The base case is the empty list, and the inductive step shows that if it works for `s`, it works for `b :: s`. The `omega` calls do the small arithmetic about `% 2` and `/ 2`.
- [ ] Because `rfl` can't compute with lists
  `rfl` computes with lists fine, but it can only check *one* list at a time. Here we need every list.
:::

::: aside Isn't this just Gödel numbering?
Yes! Gödel assigned a number to every formula and proof so that arithmetic could talk about them. `indexOf` is a (much simpler) Gödel numbering of bit strings. Today we don't think of it as a deep idea, because every programmer knows that strings are just bytes, and bytes are just numbers.
:::

## Searching for proofs 🔍

Now suppose the system has a mechanical proof checker, `check`, which takes a proof string and returns the statement it proves (or `none` for nonsense). Recall from chapter 1 that checkers always halt. Then we can search:

@snippet search

`searchUpTo check φ fuel` tries the first `fuel` strings as proofs of `φ`. Here's the key fact: searching long enough succeeds **exactly** when a proof exists.

@snippet search_spec

::: question
In the `←` direction, we're given a proof string `proof`. How much fuel does the search need?
- [ ] Infinitely much
  Every string appears at a finite position in the list. That position (plus one) is enough fuel.
- [x] `indexOf proof + 1`, enough to reach the proof's position in the list
  Right. The search tries strings `0, 1, 2, ...`, and the proof is string number `indexOf proof`, so it's found within `indexOf proof + 1` steps.
- [ ] `proof.length`
  The search goes through strings in order of their *index*, which is roughly 2 to the power of the length. A proof of length 10 sits at index 1000 or so.
:::

::: question
Suppose `φ` has **no** proof. What happens if we just keep searching, with more and more fuel?
- [ ] Eventually the search reports "no proof exists"
  How would it know? After checking a billion strings, the proof might be string billion-and-one.
- [x] It searches forever: it never finds a proof, and never knows to give up
  Exactly. The search halts if and only if `φ` is provable. If `φ` isn't provable, it runs forever. A proof search is a **recognizer** for provability, but not a decider.
:::

::: unlock Theorems can be listed
If proofs can be checked mechanically (and checking always halts), then a program can list every theorem, by trying every string as a proof. So for any statement, there's a program that halts exactly when that statement is provable: a **recognizer** for provability.
:::

## Effective systems ⚙️

We'll package the proof search as one final assumption. We need two particular searches, for statements about programs run on themselves:

@snippet effective

In JavaScript, `findLoopProof` looks like this:

```js
function findLoopProof(x) {
  for (const proof of allStrings()) {
    if (check(proof) === `¬ halts(${x}, ${x})`) return true;
  }
}
```

A system with these two recognizers is called **effective** (or *effectively axiomatized*). Lean, Peano arithmetic, and ZFC set theory are all effective.

::: question
Which ingredient makes a system effective?
- [ ] Being consistent
  An inconsistent system can be effective too. Effectiveness is about *searching* proofs, not about which proofs exist.
- [x] Having a proof checker that a program can run, and that always halts
  Right. Then a program can list every theorem, as `searchUpTo` does. Everything else is bookkeeping.
- [ ] Being complete
  Completeness is about which statements have proofs. Effectiveness is about whether a program can find the proofs that exist.
:::

::: question
Here's a formal system: "the statements are claims about programs, and the provable ones are exactly the **true** ones." It's consistent, complete, and sound. Is it effective?
- [ ] Yes, every formal system is effective
  Only systems whose proofs can be checked mechanically. What would a "proof" even be in this system?
- [x] It can't be: we'll prove in the next chapter that no system is sound, complete *and* effective
  Right. "Truth" is a perfectly good set of statements, but there's no mechanical checker for it. In fact, that's exactly what the next chapter proves.
:::

We now have all the pieces. Let's put them together.

[[Assemble the pieces!]]
