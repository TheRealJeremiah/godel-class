---
id: tactics
title: The liar, in Lean
subtitle: Tactics, and the one lemma to rule them all
emoji: 🤥
blurb: We learn to read tactic proofs step by step, then prove that no statement can be equivalent to its own negation. That small lemma is the logical engine behind the halting problem and Gödel's theorem.
---

In chapter 1 we saw that proofs are programs. But nobody writes big programs in one go, and nobody writes big proofs in one go either. In this chapter, we'll learn to read **tactic proofs**, where Lean shows you the **goal** at each step and you chip away at it. Then we'll use tactics to defeat an ancient paradox.

[[Let's chip away]]

## Goals and hypotheses 🎯

When you're inside a `by` block, Lean keeps track of two things:

* **Hypotheses**: facts you have, like `hp : P` or `h : P ∧ Q`.
* **The goal**: the statement you still have to prove.

Each tactic transforms these. The proof is finished when no goals remain. Here's a proof of an old rule of logic called *modus tollens* ("if P implies Q, and Q is false, then P is false"):

@snippet modus_tollens

The hypotheses `hpq` and `hnq` come from the theorem's parameters: the theorem is really a function, and those are its arguments. At the start, the goal is `¬ P`.

::: question
After `intro hp`, what are the hypotheses and the goal?
- [ ] Hypotheses `hpq`, `hnq`; goal `¬ P`
  `intro` always changes something! Since `¬ P` means `P → False`, `intro hp` moves the `P` into the hypotheses.
- [x] Hypotheses `hpq`, `hnq`, `hp : P`; goal `False`
  Right. We now *assume* `P` (calling that assumption `hp`) and must derive a contradiction.
- [ ] Hypotheses `hpq`, `hnq`, `hp : ¬ P`; goal `False`
  `intro` names the *input* to the function. The input to `¬ P = P → False` is a proof of `P`, not of `¬ P`.
:::

::: question
Now the proof finishes with `exact hnq (hpq hp)`. Reading inside out, what is `hpq hp`?
- [ ] A proof of `P`
  `hp` is the proof of `P`. We feed it *into* `hpq`.
- [x] A proof of `Q`
  Yes. `hpq : P → Q` is a function, and applying it to `hp : P` gives a proof of `Q`. Then `hnq : Q → False` turns that into `False`. The goal was `False`, so `exact` closes it.
- [ ] A proof of `False`
  Not yet. `hpq hp` gives `Q`. It's the next step, applying `hnq`, that gives `False`.
:::

Notice how *mechanical* this was. Each step is like evaluating an expression, and each hypothesis is like a variable with a type. A useful slogan for reading Lean proofs: **hypotheses are variables, the goal is the return type.**

## Splitting into cases 🔀

Another tactic we'll use constantly is `by_cases`, which splits a proof into two cases: either some statement holds, or it doesn't.

@snippet by_cases_demo

The `·` (a centered dot) focuses on one case at a time. In the first case we have `h : P`, and in the second we have `h : ¬ P`. `Or.inl` and `Or.inr` build the left and right sides of an `∨`.

::: question
`by_cases` lets us assume that every statement is either true or false. Is `P ∨ ¬ P` provable in Lean for *every* statement `P`, even unsolved problems like the Collatz conjecture?
- [x] Yes, by `by_cases`
  Right. Lean's logic is *classical*: every statement is true or false, even if we don't know which. So you can prove `collatz ∨ ¬ collatz` without knowing which side holds! (This principle is called the *law of excluded middle*. Some logics reject it. We'll check later which of our proofs actually need it.)
- [ ] No, only for statements we've already settled
  That's what a *constructive* logic would say. Lean's default logic is classical, where `P ∨ ¬ P` holds for every `P`, even if we can't tell which side is true.
- [ ] No, it's false for the Collatz conjecture
  Whatever the truth about Collatz, it's either true or false, so `collatz ∨ ¬ collatz` holds.
:::

## Iff, and using existence proofs 🔁

`P ↔ Q` ("P if and only if Q") is a pair of implications. You get them out with `.mp` ("modus ponens", left to right) and `.mpr` (right to left):

@snippet iff_demo

::: question
Suppose `h : Halts ↔ Provable`. Which expression is a function that turns a proof of `Provable` into a proof of `Halts`?
- [ ] `h.mp`
  `h.mp` goes left to right: from `Halts` to `Provable`.
- [x] `h.mpr`
  Right: `.mpr` goes right to left. (Keep this one in mind. In chapter 8 we'll have exactly this `h`!)
:::

And here's how we build and use existence proofs in tactic mode:

@snippet obtain_demo

`refine ⟨2 * n + 2, ?_, ?_⟩` says: "the witness is `2 * n + 2`, and I'll prove the two remaining facts later". Each `?_` becomes a new goal. The tactic `omega` then solves simple arithmetic goals automatically.

`obtain ⟨n, hn⟩ := h` works in the other direction: it *unpacks* an existence proof into its witness `n` and evidence `hn`.

::: question
In `use_exists`, just after the `obtain` line, what do we know about `n`?
- [ ] Nothing, `n` is an arbitrary number
  We know one thing about it: `obtain` gave us the evidence too.
- [x] `hn : n > 5`
  Right. We don't know *which* number `n` is, but we have `hn : n > 5`. That's enough for `omega` to show `n > 3`, so `⟨n, by omega⟩` proves the goal.
- [ ] `n = 6`
  The proof `h` might have used any witness greater than 5. After unpacking, all we know is `hn : n > 5`.
:::

## The liar 🤥

Now let's use our new tactics on a famous puzzle. Consider this sentence:

> "This sentence is false."

::: question
Is that sentence true, or false?
- [ ] True
  If it's true, then what it says holds, so it's false. Contradiction!
- [ ] False
  If it's false, then what it says ("this sentence is false") is wrong, so it's true. Contradiction!
- [x] Neither: it leads to a contradiction either way
  Right. This is the **liar paradox**, and it's been bothering people for over two thousand years.
:::

What makes the liar sentence work is that it's *equivalent to its own negation*. Call the sentence `L`. It says "`L` is false", so `L` is true if and only if `L` is false: `L ↔ ¬ L`.

Lean can prove that this situation is impossible, for *every* statement:

@snippet no_liar

Let's walk through it. After `intro h`, we have `h : P ↔ ¬ P` and the goal is `False`.

::: question
The proof first proves `hnp : ¬ P`. Inside that `have`, we assume `hp : P`. What is `h.mp hp`?
- [ ] A proof of `P`
  `h.mp` converts `P` into the *right-hand side* of the `↔`.
- [x] A proof of `¬ P`
  Right: `h.mp : P → ¬ P`. So `h.mp hp : ¬ P`, which is a function from `P` to `False`. Then `(h.mp hp) hp : False`. So assuming `P` leads to a contradiction, and we've proved `¬ P`.
- [ ] A proof of `False`
  Not quite yet: `h.mp hp` is `¬ P`, which is a function. We still need to apply it to `hp` to get `False`.
:::

::: question
Now we have `hnp : ¬ P`. The final line is `exact hnp (h.mpr hnp)`. What does `h.mpr hnp` produce?
- [x] A proof of `P`
  Right. `h.mpr : ¬ P → P`, so feeding it `hnp` gives `P`. And `hnp` refutes `P`. So `hnp (h.mpr hnp) : False`, and we're done.
- [ ] A proof of `¬ P`
  `h.mpr` goes from the right side (`¬ P`) to the left side (`P`).
- [ ] A proof of `P ↔ ¬ P`
  That's `h` itself. `h.mpr` is one direction of it.
:::

::: unlock The liar lemma
`theorem no_liar (P : Prop) : ¬ (P ↔ ¬ P)`

No statement is equivalent to its own negation. If you ever find yourself holding a proof of `X ↔ ¬ X`, you've reached a contradiction, and whatever assumption got you there must be false.
:::

::: question
Here's a riddle. A village barber shaves *exactly* those villagers who don't shave themselves. Does the barber shave themselves? Which Lean statement captures the problem?
- [ ] `ShavesSelf ∧ ¬ ShavesSelf`
  That's a statement that's plainly false, but it isn't what the rule *says*. The rule gives us an *equivalence*.
- [x] `ShavesSelf ↔ ¬ ShavesSelf`
  Right. Apply the rule to the barber: they shave themselves if and only if they don't. By `no_liar`, no such barber can exist.
- [ ] `ShavesSelf → ¬ ShavesSelf`
  That's only half of it. (By itself it just says the barber doesn't shave themselves!) The rule works in both directions, giving an `↔`.
:::

## Why this matters 🗺️

Here's a sneak preview of the whole course. The liar paradox leads nowhere by itself: it just shows that "this sentence is false" can't be a legitimate statement. But over the next chapters, we'll find **three** tweaks of it that are legitimate, each of which makes something impossible:

| Tweak | What it proves | Chapter |
|---|---|---|
| "row `n` differs from row `n` at column `n`" | Cantor: you can't list all infinite bit-streams | 3 |
| "the troll halts iff the troll doesn't halt" | Turing: no program decides halting | 5 |
| "this sentence is not *provable*" | Gödel: every good formal system is incomplete | 8 |

::: question
Gödel's tweak replaces "false" with "not provable". Why doesn't *that* sentence cause a paradox too?
- [ ] It does cause a paradox; that's what Gödel proved
  Gödel's sentence doesn't cause a contradiction. It's a perfectly consistent statement that happens to be true but unprovable. The *liar* is the paradoxical one.
- [x] Because "true" and "provable" can come apart: the sentence can be true but not provable
  Exactly. "I am not provable" is only paradoxical if everything true is provable. Gödel's move is to take that as the *assumption* that leads to a contradiction. The conclusion: some true statements aren't provable.
- [ ] Because formal systems can't talk about themselves
  Gödel's big discovery was that they *can*! In chapter 8 we'll build a sentence that talks about its own provability, using a program that inspects its own source code.
:::

[[I've got the liar in my pocket]]

That's it for pure logic! Next, we'll take the liar out for its first real job: Cantor's **diagonal argument**, the trick behind every proof in this course.

[[On to diagonalization!]]
