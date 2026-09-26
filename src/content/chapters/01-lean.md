---
id: lean
title: Proofs are programs
subtitle: Lean in fifteen minutes
emoji: 🧾
blurb: Gödel's theorem is about formal systems, which are machines for checking proofs. We'll meet one, Lean, and learn to read its statements and proofs as ordinary code.
---

Gödel's theorem says something about **formal systems**: "any sufficiently powerful formal system has statements it can neither prove nor disprove." Before we can prove that, we need to know what a formal system *is*. The textbook examples have intimidating names like "Zermelo–Fraenkel set theory with the axiom of choice", written in dense squiggles like `∀x ∃y (x ∈ y)`.

We'll use a friendlier one instead. **Lean** is a programming language and proof assistant, and it's also a formal system. By the end of this course, you'll have read a complete, machine-checked Lean proof of Gödel's incompleteness theorem.

[[Sounds good, show me some Lean!]]

## Statements are values 🧾

In most languages, `2 + 2 == 5` is an expression that *evaluates* to `false`. Lean has that too, but it has something more interesting. In Lean, `2 + 2 = 5` can also be a **statement**: a claim, which may or may not be true. Statements have the type `Prop` (short for "proposition"):

@snippet props_are_values

Just like `def x : Nat := 42` defines a number, `def claim2 : Prop := 2 + 2 = 5` defines a statement.

::: question
Lean will only accept a definition if it's well-typed. Which of these three definitions does Lean accept?
- [ ] Only `claim1`, since the others are false
  Lean is happy to let you *state* false things! A `Prop` is just a claim. Claiming something doesn't make it true, any more than writing the string `"the moon is cheese"` does.
- [ ] `claim1` and `claim2`, but not `claim3`
  `claim3` is a perfectly good statement: "there's a natural number that equals itself plus one". It's false, but it's still a statement.
- [x] All three
  Right. All three are well-formed statements. Two of them are false, but stating a falsehood isn't an error. Proving one would be.
:::

So Lean can *state* things. The interesting question is how Lean decides which statements are *true*. And the answer is the same as for mathematicians: **proofs**.

## Proofs are programs 🧑‍💻

Here's how you prove a statement in Lean:

@snippet first_theorems

A theorem has the shape `theorem name : statement := proof`. It looks exactly like defining a variable: `name` has type `statement`, and its value is `proof`. That's not a coincidence! In Lean, **a statement is a type, and a proof of it is a value of that type.**

When you run `lean` on a file, it type-checks everything, just like `tsc` does for TypeScript. If a proof has the wrong type, Lean reports an error and refuses to accept the theorem.

::: question
The proof `rfl` (short for "reflexivity") proves any statement of the form `a = a`, by computing both sides and checking they're identical. What happens if we write this?

```lean
theorem bad : 2 + 2 = 5 := rfl
```
- [ ] Lean accepts it, since `rfl` is a valid proof
  `rfl` is only a valid proof of `a = b` when `a` and `b` compute to the same value. It's like a function whose return type depends on its input: here the types don't line up.
- [x] Lean rejects it with an error
  Right. Lean computes `2 + 2` to get `4`, sees `4` isn't `5`, and reports a type error. You can't prove false things (as long as Lean has no bugs!).
- [ ] Lean runs forever trying to check it
  Checking `rfl` just means computing both sides, and `2 + 2` is quick to compute. Lean reports an error straight away.
:::

The second theorem uses `by decide`. The keyword `by` switches into **tactic mode**, where you write instructions for *building* a proof rather than writing the proof directly. The `decide` tactic works for small claims that can be settled by brute-force computation: it evaluates `10 < 100` to `true`, and builds a proof from that.

::: question
Would `theorem oops : 10 < 5 := by decide` be accepted?
- [ ] Yes, `decide` will decide it
  `decide` does decide it... and the answer is `false`! Then there's no proof to build, so `decide` fails with an error.
- [x] No, Lean reports an error
  Right. `decide` computes that `10 < 5` is false, so it can't produce a proof, and Lean rejects the theorem. The error message says it plainly: "Tactic `decide` proved that the proposition `10 < 5` is false".
:::

## Proving that something exists 🔍

The third theorem, `seven_squared`, is different. It says `∃ n : Nat, n * n = 49`: "there exists a natural number `n` whose square is 49". The proof is `⟨7, rfl⟩`.

That's a pair! A proof of "there exists an `n` such that `P n`" consists of two things: a **witness** (here, `7`) and **evidence** that the witness works (here, `rfl : 7 * 7 = 49`).

::: question
If you think of proofs as ordinary data, what's the best JavaScript analogy for a proof of `∃ n, n * n = 49`?
- [ ] The boolean `true`
  A boolean just says *that* something's true. A proof of an existence claim must say *which* thing exists. Lean won't accept `∃` claims on your word alone.
- [x] An object like `{ witness: 7, evidence: ... }`
  Exactly. To prove something exists, you exhibit it, together with evidence that it has the property.
- [ ] A function that takes `n` and returns evidence
  That's more like a proof of a *for all* claim, `∀ n, ...`: "give me any `n`, and I'll give you evidence about it". We'll see those next.
:::

::: question
Could you prove `∃ n : Nat, n * n = 50` the same way?
- [ ] Yes, with `⟨7, rfl⟩`
  `7 * 7 = 49`, not `50`, so `rfl` would fail. The evidence has to actually work.
- [x] No, there's no whole number whose square is 50
  Right: `7 * 7 = 49` and `8 * 8 = 64`, so there's no witness. And the claim is false, so no proof exists at all, of any kind.
- [ ] Yes, with `⟨√50, rfl⟩`
  `√50` isn't a natural number (`Nat`), so it can't be the witness. The type `Nat` means `0, 1, 2, ...` only.
:::

## The logic toolkit 🧰

Every piece of logic has a matching kind of data. Here's the full dictionary (keep it handy, or see the [cheat sheet](#/cheatsheet)):

| Statement | Read it as | A proof is ... |
|---|---|---|
| `P ∧ Q` | P **and** Q | a pair `⟨hp, hq⟩` |
| `P ∨ Q` | P **or** Q | `Or.inl hp` or `Or.inr hq` (a tagged union) |
| `P → Q` | **if** P **then** Q | a function turning proofs of P into proofs of Q |
| `¬ P` | **not** P | a function `P → False` |
| `P ↔ Q` | P **iff** Q | two functions: `.mp : P → Q` and `.mpr : Q → P` |
| `∃ x, P x` | **some** x has P | a pair `⟨x, hx⟩` |
| `∀ x, P x` | **every** x has P | a function taking any `x` to a proof of `P x` |

By convention we name proofs with an `h` (for "hypothesis"): `hp` is a proof of `P`, `hq` a proof of `Q`.

::: question
According to the table, what is a proof of `P → Q`?
- [ ] A proof of `P` and a proof of `Q`
  That would be a proof of `P ∧ Q`. An implication doesn't claim `P` is true at all!
- [x] A function that turns any proof of `P` into a proof of `Q`
  Yes. "If P then Q" means: whenever you hand me evidence for `P`, I can hand you back evidence for `Q`. That's a function.
- [ ] A proof of `Q`, because then `P → Q` holds no matter what
  That does *give* you a proof of `P → Q` (the function that ignores its input), but it's not what a proof of `P → Q` *is*. Most implications are proved without knowing `Q` in advance.
:::

Here's a small proof built from that toolkit:

@snippet and_swap

The goal starts as `P ∧ Q → Q ∧ P`. The tactic `intro h` does what you'd do when writing a function: it names the input. Now we have `h : P ∧ Q`, and need to produce `Q ∧ P`.

::: question
Given `h : P ∧ Q`, what is `h.2`?
- [ ] A proof of `P`
  That's `h.1`, the first component of the pair.
- [x] A proof of `Q`
  Right. `h` is a pair, so `h.1 : P` and `h.2 : Q`. Then `⟨h.2, h.1⟩` is a pair of type `Q ∧ P`, which is exactly the goal.
- [ ] The number 2
  Here `.2` means "second component", like `h[1]` on a JavaScript tuple.
:::

## Not is a function 🙅

The oddest row in the table is `¬ P`. In Lean, `¬ P` is *defined* to mean `P → False`, where `False` is a statement with no proofs at all (like the `never` type in TypeScript). So a proof of `¬ P` is a function that takes a proof of `P` and produces something impossible. The only way to write such a function is if `P` itself can't be proved.

@snippet not_is_function

::: question
After `intro h`, what is the goal (what we have left to prove)?
- [ ] `¬ (2 = 3)`
  `intro` consumed the `¬`. Remember that `¬ (2 = 3)` means `(2 = 3) → False`, and `intro h` turns the input `2 = 3` into a hypothesis.
- [x] `False`
  Right. We've assumed `h : 2 = 3`, and now we must produce a proof of `False`. The `contradiction` tactic spots that `h` is an impossible equation between different numbers, and finishes the job.
- [ ] `2 = 3`
  We *have* `2 = 3` now, as the hypothesis `h`. We don't need to prove it.
:::

That's a proof pattern we'll use constantly: **to prove `¬ P`, assume `P` and derive a contradiction.**

## Why checking must be mechanical ⚙️

We can picture Lean as a JavaScript function that takes the text of a proof file and returns the list of theorems it proves, or `null` if anything fails to check:

```js
lean("theorem two_plus_two : 2 + 2 = 4 := rfl")
  // => ["2 + 2 = 4"]

lean("theorem bad : 2 + 2 = 5 := rfl")
  // => null
```

For our purposes, the `lean` function has an important property: **it always halts.** Lean only does a bounded amount of work on each proof. If a proof is too expensive to check, Lean gives up and rejects it. (Look up `maxHeartbeats` if you're curious.)

::: question
Why might it matter that the proof checker always halts? (Take a guess. We'll use this in chapter 6!)
- [x] So a program can check proofs one after another without getting stuck
  Spot on. Later we'll write a program that tries *every possible proof*, one after another. If checking a single bogus proof could loop forever, that search would get stuck on the first bogus proof it met.
- [ ] So Lean can prove that all programs halt
  No: Lean happily talks about programs that loop forever. It's the *checker itself* that always halts.
- [ ] It doesn't matter; it's just convenient
  It matters a lot! It's what makes the set of theorems *searchable*. Hold that thought until chapter 6.
:::

::: unlock Proofs are programs (the Curry–Howard correspondence)
A statement is a type, and a proof of it is a value of that type. `∧` is a pair, `∨` is a tagged union, `→` and `∀` are functions, `∃` is a (witness, evidence) pair, and `¬ P` is a function into the empty type `False`. Checking a proof is just type-checking, and it's mechanical: a program can do it, and it always finishes.
:::

## What we have so far

A **formal system** needs three things:

1. A language of **statements**. In Lean, these are the `Prop`s.
2. A language of **proofs**. In Lean, these are programs (terms and tactic scripts).
3. A mechanical **checker** that says which proofs prove which statements. In Lean, that's the type checker.

::: question
Which of these is *not* a formal system in this sense?
- [ ] Peano arithmetic: axioms about numbers plus rules of logic, with proofs checked line by line
  That *is* a formal system. Its statements are formulas about numbers, and a proof is a list of formulas where each line follows from earlier ones by a rule. Checking that is mechanical.
- [ ] Lean
  Lean is our running example of a formal system.
- [x] "Whatever a panel of expert mathematicians agrees is true"
  Right. There's no mechanical checker here: experts can disagree, change their minds, or rely on intuition. Gödel's theorem is about *formal* systems, where proofs can be checked by a machine.
:::

In the next chapter, we'll learn a few more tactics, and use them to prove a small theorem that'll turn out to be the heart of everything: **no statement can be equivalent to its own negation.**

[[On to chapter 2!]]
