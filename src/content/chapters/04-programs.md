---
id: programs
title: Programs as data
subtitle: What it means to halt, and how to prove it
emoji: 💾
blurb: To reason about programs mathematically, we need to say precisely what running a program means. We define halting with a toy machine, discover a deep asymmetry between proving that a program halts and proving that it loops, and set up the abstract model of computing used for the rest of the course.
---

Our proof of Gödel's theorem goes through *programs*: what they do, and whether they ever stop. So before anything else, we need a precise, mathematical meaning for "this program halts". That turns out to be easy. Proving that a program *doesn't* halt is a different story.

[[Let's run something]]

## A toy machine 🧸

Here's the simplest machine I can think of. Its entire state is a single whole number. At each step it replaces the state `s` with `f(s)`, for some fixed function `f`. It stops when the state reaches `0`.

Real machines might run forever, so we can't just "run it and see". Instead, we run it for a limited number of steps, called its **fuel**:

```js
// Run the machine for at most `fuel` steps, starting in state s.
function runFor(f, fuel, s) {
  if (fuel === 0 || s === 0) return s;   // out of fuel, or halted
  return runFor(f, fuel - 1, f(s));      // take one step
}
```

Then **the machine halts from `s`** means: *there is some amount of fuel* after which the state is `0`. Here are the same two definitions in Lean:

@snippet toy_machine

Play with a few machines:

@figure toy-machine

::: question
What does `runFor(n => n - 1, 2, 5)` return? That is, count down from 5, with 2 steps of fuel.
- [ ] `0`
  Two steps from 5 only gets to 3.
- [x] `3`
  Right: 5 → 4 → 3, and then the fuel runs out.
- [ ] `5`
  Each step of fuel changes the state once, so after 2 steps it's no longer 5.
:::

::: question
Does the machine `n => n + 1` halt, starting from state `0`?
- [x] Yes, immediately: state `0` already counts as halted
  Right. With 0 steps of fuel, the state is 0. Edge cases like this are why precise definitions matter: "halts" means "reaches state 0 at some point", and it's there from the start.
- [ ] No: it counts upwards forever
  It *would*, but look at the definition. The machine stops as soon as the state is 0, and it starts at 0.
:::

## Proving that a machine halts ✅

To prove that counting down from 3 halts, we just need one amount of fuel that works. Three steps will do: 3 → 2 → 1 → 0. That's the whole proof:

@snippet toy_halts

Like the `⟨7, rfl⟩` proof in chapter 1, it names the example (3 steps of fuel), and Lean checks it by *actually running* the machine.

::: question
Would 100 steps of fuel also work as a proof?
- [x] Yes: once the machine reaches 0 it stays there
  Right. Extra fuel doesn't hurt. Any amount of 3 or more works.
- [ ] No: it has to be exactly 3
  Look at `runFor`: once `s === 0`, it stops changing. So 100 steps still ends at 0.
:::

::: question
Would 2 steps of fuel work?
- [ ] Yes
  Two steps from 3 only gets to 1.
- [x] No: after 2 steps the state is 1, not 0
  Right. The checker computes `runFor` with 2 steps, gets 1, and rejects the proof.
:::

## Proving that a machine loops ➿

Now take the machine `n => n`, which never changes its state. Start it at 5. It obviously never reaches 0. But how would you *prove* that?

::: question
Could you prove it by running the machine for a very long time?
- [ ] Yes: run it for a billion steps and check it's not 0
  That shows it hasn't halted *yet*. Maybe it halts at step billion-and-one!
- [x] No: running only ever shows it hasn't halted *so far*
  Right. "It never halts" is a claim about *every* amount of fuel, infinitely many. No finite amount of running can check them all.
:::

::: question
"The machine halts from `s`" means "*there is* some fuel after which the state is 0". What does "the machine does **not** halt from `s`" mean?
- [ ] There is some fuel after which the state isn't 0
  That's true of almost any machine: with 0 fuel from a nonzero start, the state isn't 0. That doesn't mean it loops.
- [x] For *every* amount of fuel, the state isn't 0
  Right. Negating "there is some fuel that works" gives "no fuel works", which is a claim about infinitely many cases. That's why it needs more than running.
:::

For a claim about *every* amount of fuel, we need **induction**. Here's the plan:

* **Claim:** for every `k`, running for `k` steps from 5 leaves the state at 5.
* **Base case:** with 0 steps, the state is 5. ✓
* **Inductive step:** if after `k` steps the state is 5, then one more step gives `f(5) = 5`. ✓

So the state is 5 after any number of steps, and 5 isn't 0, so the machine never halts. ∎

A fact like "the state is always 5" that holds at the start and survives every step is called an **invariant**. Proving a program loops almost always means finding the right invariant.

@proof toy_loops See the invariant proof in Lean

::: question
Which invariant would prove that `n => n + 1` never halts when started at 5?
- [ ] "The state is always 5"
  The state goes 5, 6, 7, ... so that fails after one step.
- [x] "The state is always at least 5"
  Right. It's true at the start, and if `n ≥ 5` then `n + 1 ≥ 5`. A state that's at least 5 is never 0.
- [ ] "The state is always odd"
  5 is odd, but 6 isn't. That invariant breaks after one step.
:::

::: question
Now take `n => n % 2 === 0 ? n / 2 : 3 * n + 1`, the famous **Collatz** step (with the extra rule that 1 goes to 0). Nobody knows whether it halts from *every* start. What would a proof that it halts from every start need?
- [ ] Just run it from every start
  There are infinitely many starting states. You can't run them all.
- [x] A clever general argument, and nobody has found one
  Right. For any *single* start, you can run it and watch it reach 0 (it always has, so far). But "halts from every start" is the famous open **Collatz conjecture**. Simple programs can pose very hard questions.
:::

::: unlock The halting asymmetry
To prove a program **halts**, run it: the run is the proof. To prove a program **loops**, you need insight: typically an invariant, proved by induction. There's no general recipe for finding one, and sometimes nobody knows how.
:::

This asymmetry is the seed of everything to come. A formal system can always confirm that a program halts, just by checking the run. But claims that programs *loop* are where formal systems can get stuck forever.

## Real programs, abstractly 🖥️

The toy machine is fine for examples, but we want our theorems to hold for **real** programming languages: JavaScript, Python, Turing machines, whatever you like. Rather than pick one, we'll describe a programming language by the one thing we need to know about it: **what each program does on each input.**

When you run a program on an input, exactly one of two things happens: it runs forever, or it stops and returns an answer. To keep things simple, our programs answer yes/no questions, so the answer is a boolean:

@snippet result

Programs and their inputs are both strings of source code, so a program can be given *another program* as input. A **computer** is anything that tells us what each program does on each input:

@snippet code_computer

`M.run(p, x)` is the behaviour of program `p` on input `x`: either `.loops` or `.returns(b)`.

::: question
Hang on. Some programs loop forever. How can `run` be a function that always gives an answer?
- [ ] `run` must secretly time out
  A timeout couldn't tell "loops forever" apart from "takes a very long time". `run` gives the true answer, however long the program takes.
- [x] `run` is a mathematical description of what each program does. Nobody executes it
  Right. Think of `run` as a gigantic, infinite answer key: for every program and input, it records the true behaviour. That answer key *exists* mathematically, even though, as we'll prove in chapter 6, no program could ever compute it.
- [ ] It can't: this is a bug in our setup
  It's fine! Mathematics can describe things that no computer could calculate. The whole course depends on the difference.
:::

This is worth dwelling on, because it's easy to confuse two things:

* **A function that exists mathematically.** For example, "the function that maps each program to whether it halts". Every program either halts or doesn't, so this function is perfectly well defined.
* **A function that a program can compute.** Here, a program that takes source code and correctly returns `true` or `false`.

Cantor already showed (chapter 2) that some functions can't be computed by any program. `run` will turn out to be one of them.

::: question
Is "the function that maps each program to whether it halts" a well-defined mathematical function?
- [x] Yes: each program either halts or it doesn't, so each input has a definite answer
  Right. The function exists. What we'll prove in chapter 6 is that no *program* computes it. Existing and being computable are different things.
- [ ] No: nobody can compute it, so it doesn't exist
  "Nobody can compute it" is a claim about programs. Mathematical functions can exist without any program computing them, as Cantor showed.
:::

Finally, "halts" in our abstract setting just means "doesn't loop":

@snippet halts_def

::: question
If `M.run(p, x)` is `.returns(false)`, does `p` halt on `x`?
- [x] Yes
  Right. Returning `false` still counts as halting! "Halts" means "finishes with some answer", whatever the answer is.
- [ ] No, it returned false
  Returning `false` is still returning. Only `.loops` counts as not halting.
:::

## Why so abstract? 🤔

You might be suspicious. We haven't said anything about *how* programs run: no interpreter, no instructions. Is this cheating?

It's a deliberate choice. Everything we prove holds for **every** computer. When a proof needs the computer to be able to do something, like "run two programs side by side", we'll write that down as an explicit, named **ability**, explain why every real language has it, and show it in JavaScript. At the end of the course, you'll see exactly which abilities each theorem needs.

::: question
If we prove a theorem about every computer that has certain abilities, which languages does it apply to?
- [ ] Only the toy machine
  The toy machine isn't even a `Computer` in this sense (it has no inputs or answers). The theorems apply to any language with the named abilities.
- [x] JavaScript, Python, Turing machines, and any other language with those abilities
  Right. One proof covers every programming language at once.
- [ ] None, since `run` can't be computed
  `run` describes real languages perfectly well. The fact that no program computes it is a *theorem* about them, not a problem with the setup.
:::

[[On to deciding and recognizing]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise finite-halts Decide halting for a small machine
The halting problem says no program can decide halting in general. But for a machine with only finitely many states, you can! Write `halts(f, s)` for machines with states 0 to 99, where state 0 means "halted". It must always return an answer.
--- hint
Running the machine until it reaches 0 won't work: some machines never do. But there are only 100 states. What must have happened if a run lasts longer than that?
--- hint
If the machine hasn't reached 0 after 100 steps, it has visited some state twice. From then on it repeats the same cycle forever.
--- solution
```js
function halts(f, s) {
  for (let step = 0; step <= 100; step++) {
    if (s === 0) return true
    s = f(s)
  }
  return false   // no halt in 100 steps: a state repeated, so it cycles forever
}
```

Keeping a `Set` of visited states and stopping at the first repeat works too. The halting problem is only unsolvable for programs with **unbounded** memory, like real programs; a finite machine can always be checked this way.
:::

::: exercise invariant-order Prove that a machine loops
Prove that the machine `n => n + 1`, started at 5, never halts. Two of the steps don't belong.
--- hint
State the invariant first, prove it by induction (base case and inductive step), then use it.
--- solution
The base case and the inductive step can come in either order, but both must come before "by induction". The red herrings: running the machine can only show it hasn't halted *yet*, and "always exactly 5" isn't an invariant of `n => n + 1`.
:::
