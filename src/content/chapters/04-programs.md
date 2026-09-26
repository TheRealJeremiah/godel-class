---
id: programs
title: Programs as data
subtitle: What "halting" means to Lean
emoji: 💾
blurb: To prove things about programs, we need programs as Lean values. We define a toy machine, prove one run halts and another loops, then define the abstract Computer that the rest of the course is built on.
---

Gödel's theorem is about what formal systems can prove, and our proof will go through *programs*. So we need Lean to talk about programs: what they are, what they do, and whether they halt. In this chapter, we'll build that vocabulary.

[[Let's talk about programs]]

## A toy machine 🧸

Let's start small. Our toy machine has a single number as its state. Each step, it applies a function `f` to the state, and it stops when the state reaches `0`. Here's how we run it for a limited number of steps (the **fuel**):

@snippet toy_machine

`runFor f fuel s` runs from state `s` for up to `fuel` steps, and returns the state it ended in. `HaltsFrom f s` says that *there exists* some amount of fuel after which we're at state `0`. Play with some machines:

@figure toy-machine

::: question
What is `runFor (fun n => n - 1) 2 5`? That is, count down from `5`, with `2` steps of fuel.
- [ ] `0`
  With only 2 steps of fuel, we don't get far: 5 → 4 → 3, and we're out of fuel.
- [x] `3`
  Right: `5 → 4 → 3`, then the fuel is gone and `runFor` returns the current state.
- [ ] `5`
  `runFor` takes up to `fuel` steps. With `fuel = 2`, the state changes twice.
:::

Now here's a proof that counting down from 3 halts:

@snippet toy_halts

The proof is the pair `⟨3, rfl⟩`: the witness is `3` units of fuel, and `rfl` checks, by *actually running the machine*, that `runFor (fun n => n - 1) 3 3 = 0`.

::: question
Would `⟨100, rfl⟩` also prove `countdown_halts`?
- [x] Yes
  Right. After reaching `0` the machine stays there (look at the `if s = 0 then 0` line), so any fuel of 3 or more works. `rfl` just runs 100 steps instead of 3.
- [ ] No, only exactly 3 steps of fuel works
  Look at `runFor`: once the state is `0`, it stays `0`. So more fuel is fine.
- [ ] No, `rfl` would time out
  100 steps is nothing for Lean. Even a million would be fine, just slower.
:::

::: question
Would `⟨2, rfl⟩` prove it?
- [ ] Yes
  With 2 steps, we get `3 → 2 → 1` and stop at `1`, not `0`. So `rfl` would fail to check `1 = 0`.
- [x] No
  Right: `runFor (fun n => n - 1) 2 3 = 1`, and `1 ≠ 0`, so Lean rejects the proof.
:::

## Proving that something loops ➿

Proving that a program halts is easy: find enough fuel, then run it. But how do you prove that a program **never** halts?

::: question
Take the machine `fun n => n`, which never changes its state. Starting from `5`, it never reaches `0`. Can we prove `¬ HaltsFrom (fun n => n) 5` by running it with lots of fuel?
- [ ] Yes, run it for a million steps and check it's not 0
  That only shows it hasn't halted *yet*. Maybe it halts at step million-and-one! No finite amount of running rules out halting later.
- [x] No: running it can only ever show it hasn't halted *yet*
  Right. To prove "for every amount of fuel, the state isn't `0`", we need a *for all* argument. And for claims about all natural numbers, that means **induction**.
:::

Here's the proof by induction:

@snippet toy_loops

The key step is the helper fact `always5`: for every `k`, `runFor (fun n => n) k 5 = 5`. The base case (`k = 0`) is `rfl`, and the inductive step uses the previous case `ih`.

::: question
`always5` is what we call an **invariant**: a fact that's true at the start and stays true after every step. Which invariant would prove that `fun n => n + 1` never halts when started from `5`?
- [ ] "The state is always 5"
  The state goes 5, 6, 7, ... so that's false after one step.
- [x] "The state is always at least 5"
  Right. It's true at the start, and if `n ≥ 5` then `n + 1 ≥ 5`, so it stays true. And a state that's at least 5 is never 0.
- [ ] "The state is always even"
  It's not even at the start (5 is odd), and it alternates between odd and even anyway.
:::

::: unlock The halting asymmetry
To prove a program **halts**, just run it until it stops. The run itself is the proof: `⟨fuel, rfl⟩`. To prove a program **loops**, you need insight: an invariant, proved by induction. There's no general recipe, and finding the right invariant can be arbitrarily hard.
:::

This asymmetry will be crucial later. Formal systems are good at proving that things halt (they can just "run" the computation), but proving that things *loop* is where they can get stuck.

## Real programs 🖥️

Our toy machine is fine for examples, but Gödel's theorem is about *every* formal system and *real* programs: JavaScript, Python, Turing machines, whatever you like. We want our proof to work for all of them. So instead of picking a particular programming language, we'll say only what we need about it:

@snippet result

@snippet code_computer

A `Computer` is anything with a `run` function. `M.run p x` tells us what program `p` does when given input `x`: either it `.loops` forever, or it `.returns` a boolean answer.

::: question
Hang on. Some programs loop forever. How can `run` be a Lean function that always returns an answer?
- [ ] `run` must secretly time out after a while
  If it timed out, it couldn't tell "loops forever" apart from "takes a really long time". `run` gives the *true* answer, however long the program takes.
- [x] `run` just *describes* what each program does; nobody ever executes it
  Right. `run` is a mathematical function, like "the function that maps each program to whether it halts". It exists in the mathematical sense, even though (as we'll prove!) no program can compute it. Lean lets us talk about it without running it.
- [ ] It can't; this is a bug in our setup
  It's fine! Lean functions can describe things that no computer could calculate. This is just a definition, and we'll never execute `M.run`.
:::

::: aside Wait, why do programs return a Bool rather than a string?
Just to keep things simple. We only ever need programs that answer yes/no questions ("does this program halt?") or that we care about for halting alone. Returning a `Bool` is enough for all of that. A program's *input* is a `Code`, a string, so programs can inspect other programs' source code.
:::

Now some vocabulary:

@snippet halts_decides

::: question
`M.Halts p x` is defined as `M.run p x ≠ .loops`. If `M.run p x = .returns false`, does `p` halt on `x`?
- [x] Yes
  Right. Returning `false` still counts as halting! "Halts" means "finishes and returns something", whatever the answer.
- [ ] No, it returned false
  Returning `false` is still returning. Only `.loops` counts as not halting.
:::

Here's the small lemma that says so, in Lean:

@snippet returns_halts

## Deciding versus recognizing 🔎

The definitions `Decides` and `Recognizes` are the heart of computability theory, so let's make sure they're clear. Here's a JavaScript example of each, for the property "the string has even length":

```js
// Decides "even length": always returns, and answers correctly.
function isEven(x) { return x.length % 2 === 0; }

// Recognizes "even length": halts on even lengths, loops on odd ones.
function haltIfEven(x) { if (x.length % 2 !== 0) while (true) {} }
```

::: question
Suppose program `d` decides property `P`. Does `d` also *recognize* `P`?
- [ ] Yes: deciding is stronger than recognizing
  Tempting, but look at the definition of `Recognizes`: `r` must halt on *exactly* the inputs with property `P`. A decider halts on *every* input.
- [x] No: a decider halts on every input, but a recognizer must loop on inputs without the property
  Right! A decider halts everywhere, so as a recognizer it recognizes the "everything" property. However, it's easy to *turn* a decider into a recognizer: `if (!d(x)) while (true) {}`. So any decidable property is also recognizable.
- [ ] Only if `P` is true for every input
  That's actually a correct special case! But it's not the general answer: if `P` fails on some input, the decider still halts there, so it doesn't recognize `P`.
:::

::: question
A program that loops forever on every input: what property does it recognize?
- [ ] No property: it's useless
  It's useless in practice, but it does recognize something!
- [x] The property that's false for every input
  Right. It halts on exactly the inputs where `P x` holds, namely none of them.
- [ ] Every property
  A recognizer for `P` must *halt* on inputs where `P` holds. This program never halts.
:::

::: question
Suppose you have a recognizer `r1` for property `P`, and a recognizer `r2` for `¬ P` (the inputs *without* the property). Could you write a *decider* for `P`?
- [x] Yes: run both side by side, and see which halts
  Right! On any input, exactly one of `P x` and `¬ P x` holds, so exactly one of `r1` and `r2` halts. Run them alternately, one step at a time, and whichever halts first tells you the answer. We'll use this trick, called **racing**, in chapter 7.
- [ ] No: `r1` might loop, and then you'd wait forever
  You'd wait forever if you ran `r1` *first*. Instead, take one step of `r1`, then one of `r2`, then `r1` again, and so on. One of them must halt.
- [ ] Only if both halt quickly
  Speed doesn't matter. Exactly one of them halts, so racing them will finish eventually.
:::

## Why so abstract? 🤔

You might be suspicious. We haven't said anything about how `run` works: no interpreter, no instruction set. Is this cheating?

It's a deliberate choice. Everything we prove from here on holds for **every** `Computer`. When we need a computer to have some ability, like "you can build a program that loops when another program says yes", we'll write that down as an explicit, named assumption, and justify it with a few lines of JavaScript. At the end of the course, you'll see exactly which abilities each theorem needs.

::: question
If we prove a theorem about an arbitrary `M : Computer` (plus some abilities), which of these does it apply to?
- [ ] Only to the toy machine
  The toy machine isn't even a `Computer` (it has no inputs or return values). The theorem applies to any `Computer` with the named abilities.
- [x] JavaScript, Python, Turing machines, and any language with the named abilities
  Right. That's the beauty of proving it abstractly: one proof covers every programming language at once.
- [ ] No real language, since `run` isn't computable
  `run` describes real languages perfectly well. It's just not something a program can compute (which is the point of the next chapter!).
:::

[[I'm ready for the halting problem]]
