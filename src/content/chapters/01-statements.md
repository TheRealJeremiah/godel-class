---
id: statements
title: Machines that check proofs
subtitle: Formal systems, true vs provable, and the liar
emoji: 🧾
blurb: What did Gödel actually prove? We build a tiny formal system from scratch, meet the ideas of consistency and completeness, see how Lean fits the same mould, and prove the small lemma behind every argument in this course.
---

In 1931, a 25-year-old logician named Kurt Gödel proved something that shocked the mathematical world. Roughly:

> Any consistent formal system that is strong enough to talk about computer programs has statements it can neither prove nor disprove.

By the end of this course, you'll understand every word of that sentence, you'll know *why* it's true, and you'll have seen a complete proof of it that has been checked by a computer. But first: what on earth is a "formal system"?

[[Let's find out]]

## A tiny formal system 🧮

A **formal system** is a set of rules for producing proofs so precise that a computer can check them. Here's a very small one. I'll call it **Evens**. It can make two kinds of statements about whole numbers:

* `"n is even"`, for example `"4 is even"`
* `"n is not even"`, for example `"7 is not even"`

Evens starts with two **axioms**: statements it accepts without proof.

* `"0 is even"`
* `"1 is not even"`

And it has two **rules** for getting new statements from old ones:

* From `"n is even"`, you may conclude `"n+2 is even"`.
* From `"n is not even"`, you may conclude `"n+2 is not even"`.

A **proof** is a list of statements, where each one is either an axiom or follows from an earlier line by a rule. The last line is what the proof proves. Here's a checker for Evens proofs, in JavaScript:

```js
const axioms = ["0 is even", "1 is not even"];

function check(proof) {                 // proof: an array of statements
  for (let i = 0; i < proof.length; i++) {
    const ok = axioms.includes(proof[i]) ||
      proof.slice(0, i).some(prev => followsByRule(prev, proof[i]));
    if (!ok) return null;               // a bad step: not a proof at all
  }
  return proof[proof.length - 1];       // the statement it proves
}
```

(`followsByRule(prev, line)` checks that `line` is `prev` with the number increased by 2.)

::: question
Is `["0 is even", "2 is even", "4 is even"]` a valid proof? If so, what does it prove?
- [x] Yes, it proves `"4 is even"`
  Right. The first line is an axiom, and each later line follows from the one before by the "+2" rule. The checker returns the last line, `"4 is even"`.
- [ ] Yes, it proves `"0 is even"`
  A proof proves its *last* line. The first line is just where it starts.
- [ ] No, because `"2 is even"` isn't an axiom
  It doesn't need to be an axiom: it follows from `"0 is even"` by a rule. Each line must be an axiom *or* follow by a rule.
:::

::: question
What about `["0 is even", "4 is even"]`?
- [ ] Valid: 4 is even, after all
  It's true that 4 is even, but the checker doesn't care about truth! It only checks steps. Can you get from 0 to 4 with one "+2" step?
- [x] Not valid: `"4 is even"` doesn't follow from `"0 is even"` in one step
  Right. The rules only allow steps of 2, so this "proof" skips a step and the checker rejects it. A formal system is strict: every step must be spelled out.
:::

A statement is **provable** if some proof proves it. Notice the difference between *provable* ("the checker would accept some proof of it") and *true* ("it's actually the case about numbers"). For Evens, they happen to line up. But they are different ideas, and Gödel's theorem is about the gap between them.

## Consistent and complete ✅

Two properties of a formal system will matter all course long:

* A system is **consistent** if it never proves a statement *and* its opposite. For Evens, that would mean proving both `"n is even"` and `"n is not even"` for some `n`.
* A system is **complete** if, for every statement, it proves either the statement or its opposite. It settles every question it can ask.

::: question
Is Evens consistent?
- [x] Yes
  Right. The even axiom and rule only ever produce even numbers (0, 2, 4, ...), and the "not even" ones only produce odd numbers (1, 3, 5, ...). No number gets both labels.
- [ ] No
  Try to find an `n` where both `"n is even"` and `"n is not even"` are provable. The first kind only reaches 0, 2, 4, ..., and the second only reaches 1, 3, 5, ...
:::

::: question
Is Evens complete?
- [x] Yes: for every number, it proves either "is even" or "is not even"
  Right. Every even number is reached from 0, and every odd number is reached from 1. So Evens settles every question it can ask. It's consistent *and* complete. (Gödel's theorem doesn't apply because Evens is far too weak to talk about programs.)
- [ ] No: it can't prove things about big numbers
  It can, it just takes long proofs. `"1000000 is even"` has a proof with 500,001 lines!
:::

Now let's break it. Suppose we delete the axiom `"1 is not even"`.

::: question
In this broken version of Evens, is `"3 is not even"` provable?
- [ ] Yes
  With the axiom `"1 is not even"` gone, no "not even" statement can ever get started. Nothing produces `"3 is not even"`.
- [x] No
  Right. And `"3 is even"` isn't provable either, since the even statements only reach 0, 2, 4, .... So the broken system is **incomplete**: it can't settle the question "is 3 even?".
:::

::: question
In the broken system, `"3 is not even"` is unprovable. Is it *true*?
- [x] Yes: 3 really isn't even. It's true but unprovable in this system
  Exactly. This is the gap between **true** and **provable**. Here the gap is boring: we just forgot an axiom. Gödel's shock was that in *strong* systems, the gap can never be closed, however many axioms you add.
- [ ] No: if it's unprovable, it can't be true
  Truth is about numbers; provability is about what one particular checker accepts. A weak system can miss true facts.
:::

::: question
Instead, suppose we keep the original Evens and add an extra axiom: `"6 is not even"`. What happens?
- [ ] Nothing much: one more true fact
  `"6 is not even"` isn't true! And the system can still prove `"6 is even"` the usual way.
- [x] The system becomes inconsistent
  Right. It proves `"6 is even"` (from 0) and `"6 is not even"` (the new axiom). Adding axioms is risky: add a false one, and you may get a contradiction.
- [ ] The system becomes incomplete
  It still proves `"n is even"` or `"n is not even"` for every `n`, so it's still complete. The trouble is that it now sometimes proves both.
:::

The dream of mathematicians in the 1920s, led by David Hilbert, was a formal system for *all* of mathematics that was both consistent and complete. Gödel showed that, for any system strong enough to talk about computer programs, the dream is impossible.

::: question
One more property of our checker: does `check(proof)` always finish, for any list of statements?
- [x] Yes: it looks at each line once, then stops
  Right. And that will turn out to be important. In chapter 7, we'll write a program that tries *every possible proof*, one after another. That only works because checking any single proof always finishes.
- [ ] No: a long proof could make it loop forever
  A long proof takes longer, but the loop still ends after the last line.
:::

::: unlock Formal system
A **formal system** has statements, **axioms** (statements accepted without proof), and **rules** for deriving new statements. A **proof** is a list of steps that a mechanical **checker** can verify, and checking always finishes. The system is **consistent** if it never proves a statement and its opposite, and **complete** if it always proves one of the two. **Provable** (the checker accepts a proof) is not the same thing as **true**.
:::

## Lean: a much bigger formal system 🧑‍💻

Evens can only talk about evenness. Real mathematics needs a formal system that can talk about numbers, functions, sets, and programs. In this course we'll use **Lean**, a programming language that is also a formal system. Mathematicians use it to check real research proofs.

In Lean, a statement is written as a *type*, and a proof is a *value* of that type. Checking a proof is just type-checking, much like TypeScript checking your code:

@snippet tiny_theorem

This says: "here is a theorem called `two_plus_two`; it states `2 + 2 = 4`; and its proof is `rfl`." (`rfl` means "compute both sides and check that they're the same".)

::: question
What would Lean do with `theorem bad : 2 + 2 = 5 := rfl`?
- [ ] Accept it: `rfl` is a valid proof
  `rfl` only works when both sides compute to the same thing. `4` isn't `5`.
- [x] Reject it with an error
  Right. Lean's checker computes `2 + 2`, gets `4`, sees that isn't `5`, and refuses. Like the Evens checker, it won't accept a bad proof.
:::

Here's one more example. To prove that something *exists*, you name it and show it works:

@snippet exists_proof

::: question
The proof `⟨7, rfl⟩` has two parts. What are they?
- [x] The number 7, and a check that `7 * 7 = 49`
  Right. To prove "some number squares to 49", you hand over a specific number and evidence that it works. We'll see this pattern again: to prove a program halts, you'll hand over the number of steps it takes.
- [ ] Two separate proofs of the same thing
  They're different kinds of thing: first the *example* (7), then the *evidence* about it.
:::

That's all the Lean you need to get started. Throughout the course:

* I'll explain every idea in plain English first, usually with some JavaScript.
* Then I'll show the **key definitions** in Lean, so you can see exactly what's being claimed.
* The **proofs** will be folded away behind a button. Open them if you're curious; you won't need to read them.

Every Lean snippet you see has been checked by Lean, so nothing in this course is hand-waving about what's been proved.

## The liar 🤥

Let's finish with our first real theorem. Consider this sentence:

> "This sentence is false."

::: question
Is it true, or false?
- [ ] True
  If it's true, then what it says holds, so it's false. Contradiction!
- [ ] False
  If it's false, then what it says is wrong, so it's true. Contradiction!
- [x] Neither: either answer leads to a contradiction
  Right. This is the **liar paradox**, and it's been annoying people for more than two thousand years.
:::

The liar sentence `L` says "`L` is false". So `L` is true exactly when `L` is false. In symbols, `L ↔ ¬L`, where `↔` means "if and only if" (the two sides are either both true or both false), and `¬` means "not".

::: theorem The liar lemma
No statement `P` is equivalent to its own negation: it's impossible that `P ↔ ¬P`.
:::

**Proof.** Suppose `P ↔ ¬P`.

1. If `P` were true, then `¬P` would be true too (by the equivalence), which is a contradiction. So `P` is false: we have `¬P`.
2. But then, by the equivalence, `P` is true. That contradicts step 1.

Either way we hit a contradiction, so `P ↔ ¬P` can't hold. ∎

@proof no_liar

::: question
Why does the proof need *two* steps, rather than stopping after step 1?
- [ ] It doesn't; step 2 is just a double-check
  Step 1 alone isn't a contradiction: it just concludes `¬P`, which is a perfectly fine thing to be true.
- [x] Step 1 only shows `P` must be false; step 2 shows that being false is *also* impossible
  Exactly. First we rule out "`P` is true". Then, knowing `P` is false, the equivalence forces it to be true. Neither option survives.
:::

::: question
A village barber shaves *exactly* those villagers who don't shave themselves. Does the barber shave themselves?
- [ ] Yes
  Then they're someone who shaves themselves, so the barber doesn't shave them. Contradiction.
- [ ] No
  Then they're someone who doesn't shave themselves, so the barber shaves them. Contradiction.
- [x] No such barber can exist
  Right. Applying the rule to the barber gives "shaves self ↔ ¬ shaves self", which the liar lemma rules out. The story describes an impossible barber.
:::

::: unlock The liar lemma
No statement is equivalent to its own negation. If an argument ever produces `X ↔ ¬X`, one of its assumptions must be false. This humble lemma is the final step of nearly every proof in this course.
:::

## The road ahead 🗺️

The liar is a paradox. But with a small twist, the same shape becomes a *weapon* that proves things impossible:

| Twist on the liar | What it proves | Chapter |
|---|---|---|
| a row that disagrees with every row of a table | Cantor: some infinite lists can't be complete | 2–3 |
| a program that does the opposite of what it's predicted to do | Turing: no program can decide whether programs halt | 6 |
| a sentence that says "I am not *provable*" | Gödel: strong formal systems are incomplete | 9 |

::: question
Gödel's sentence swaps "false" for "not provable". Why isn't that a paradox too?
- [ ] It is a paradox; that's Gödel's theorem
  Gödel's sentence doesn't lead to a contradiction. It leads to a *conclusion*.
- [x] Because true and provable can differ, the sentence can simply be true but unprovable
  Right. "I am not provable" is only paradoxical if everything true is provable. Drop that assumption and there's no contradiction: just a true statement the system can't prove, like `"3 is not even"` in broken Evens, but unavoidable.
:::

[[On to Cantor!]]
