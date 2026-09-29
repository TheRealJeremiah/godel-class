---
id: rosser
title: Rosser's trick
subtitle: Incompleteness from consistency alone
emoji: 🎭
blurb: A consistent system can't prove Gödel's sentence, but it might still wrongly disprove it. Rosser's program races a proof against a disproof and does the opposite of whatever it finds first, giving a sentence that is neither provable nor disprovable, assuming only consistency.
---

At the end of the last chapter we found a gap. Assuming only consistency, `S` can't *prove* the Gödel sentence, but it might still *disprove* it, by wrongly proving "`g` halts on `g`". So we haven't yet shown that a merely consistent system is **incomplete**, meaning it has a statement it can neither prove nor disprove.

In 1936, J. Barkley Rosser closed the gap with a cleverer sentence. His idea is Turing's troll, aimed at proofs instead of at a halting tester.

[[Troll the proofs]]

## The idea 💡

Gödel's program `g` watches for only one thing: a proof that it loops. If `S` wrongly "proves" the opposite, `g` never notices. Rosser's program watches for **both** a proof and a disproof, and does the opposite of whichever it sees first.

Rosser's sentence is about what a program *returns*: "`rosser`, run on its own source, returns `true`". The program uses two proof searches, one for each side:

* `findYes(x)` searches for a proof of "`x`, run on itself, returns `true`";
* `findNo(x)` searches for a *disproof* of it.

```js
function rosser(x) {
  // Race the two searches (chapter 5), and contradict whichever wins:
  return race(findNo, findYes, x);
  //   a disproof is found first → return true
  //   a proof is found first    → return false
}
```

As always, the magic happens when we run it on itself: `rosser(rosser)`.

::: question
Suppose `S` **proves** Rosser's sentence, "`rosser(rosser)` returns `true`". If `S` is consistent, what does `rosser(rosser)` find first?
- [ ] A disproof
  A consistent system that proves the sentence can't also disprove it. There's no disproof to find.
- [x] The proof, so it returns `false`
  Right. It finds `S`'s proof that it returns `true`, and so returns `false`. `S` can check that finished run and prove "`rosser(rosser)` doesn't return `true`". Now `S` has proved the sentence *and* its negation: inconsistent!
- [ ] Neither, so it loops
  A proof exists (we supposed so), so the proof search eventually finds it.
:::

::: question
Now suppose `S` **disproves** the sentence. What happens?
- [x] `rosser(rosser)` finds the disproof (there's no proof), so it returns `true`. `S` can check that, and proves the sentence. Inconsistent again!
  Right. Returning `true` makes the disproved sentence true, and `S` can confirm it by checking the run.
- [ ] It finds the disproof, so it returns `false`
  Look at the rule: a disproof found first means *return true*. Rosser's program always contradicts what it finds.
- [ ] It loops forever
  A disproof exists (we supposed so), and there's no proof to compete with it. So the disproof search wins.
:::

So a consistent `S` can neither prove nor disprove Rosser's sentence. Notice that each case only needed `S` to *check a finished run*. Neither case needed `S` to be *right* about anything. That's why plain consistency is enough.

## Making it precise 📤

Rosser's sentence is about outputs, so we give our formal system one more kind of statement. `says p x b` is the statement "program `p`, run on input `x`, returns `b`":

@snippet rosser_system

We also need a slightly stronger version of "checks computations". If a program really returns `b`, then `S` can prove that it returns `b`, **and** that it doesn't return the other answer:

@snippet proves_outputs

::: question
Why do we need that second part: that `S` can prove "`p` doesn't return `!b`"?
- [x] Because the first case of the argument needs `S` to *disprove* "`rosser(rosser)` returns `true`", when it actually returned `false`
  Right. Knowing "it returns `false`" only helps if `S` also knows a program can't return two different answers. Any reasonable system knows that, so it's a harmless assumption.
- [ ] It's redundant
  From `S`'s point of view it isn't obvious. `S` needs to know that a program can't return two different answers.
:::

::: question
Why is Rosser's sentence about what a program *returns*, instead of just whether it halts?
- [x] Because the race halts in both interesting cases; what distinguishes them is the *answer* it returns
  Right. In case 1 it returns `false` and in case 2 it returns `true`. Halting alone can't tell those apart, so the sentence has to talk about outputs.
- [ ] Because halting statements can't be proved
  Halting statements can often be proved. The issue is that `rosser(rosser)` halts in both cases, so halting doesn't capture the difference.
:::

And we need the two proof searches, as an effectiveness assumption:

@snippet rosser_effective

::: theorem Rosser's theorem (1936)
If `S` is consistent, effective, and checks computations (including their outputs), then `S` can neither prove nor disprove Rosser's sentence. So `S` is **incomplete**.
:::

**Proof.** Exactly the two cases above.

1. If `S` proves the sentence, consistency means there's no disproof. So only `findYes` halts, the race returns `false`, and `S` checks that run to *disprove* the sentence. Contradiction.
2. If `S` disproves the sentence, consistency means there's no proof. So only `findNo` halts, the race returns `true`, and `S` checks that run to *prove* the sentence. Contradiction. ∎

@snippet rosser_program

@proof rosser See Rosser's theorem in Lean

::: question
In case 1, which assumption tells us there's no disproof to find?
- [x] Consistency
  Right. `S` has already proved the sentence, so a disproof would make it inconsistent.
- [ ] Soundness
  Rosser's theorem doesn't assume soundness at all. That's the point.
- [ ] Checking computations
  That's used later, once we know what the program returned.
:::

::: question
In case 2, which search wins the race?
- [ ] `findYes`, the proof search
  In case 2, `S` disproves the sentence, and consistency means there's no proof. So `findYes` never halts.
- [x] `findNo`, the disproof search, so the race returns `true`
  Right. That makes the disproved sentence true, and `S` can check it.
:::

::: question
If `S` is consistent, what does `rosser(rosser)` actually do?
- [ ] Returns `true`
  It only returns `true` if it finds a disproof. The theorem says there isn't one.
- [ ] Returns `false`
  It only returns `false` if it finds a proof. The theorem says there isn't one.
- [x] Runs forever: neither search ever finds anything
  Right. So Rosser's sentence ("returns `true`") is actually **false**, and its negation is true but unprovable. Neat: Gödel's unprovable truth is a sentence, while Rosser's is the negation of one.
:::

::: question
What happens if `S` is **inconsistent**, so it proves the sentence *and* its negation?
- [x] Both searches halt, the race makes no promise about which wins, and the argument breaks down, as it must
  Right. And it *has* to break down somewhere: an inconsistent system proves every statement, so it's certainly "complete".
- [ ] Rosser's theorem still applies
  The theorem assumes consistency. Without it, there's nothing to say.
:::

::: unlock Rosser's theorem
Race a search for a proof against a search for a disproof, and do the opposite of whatever turns up first. Whichever way a consistent system commits, the program contradicts it with a run the system can check. So every consistent, effective system that checks computations is incomplete.
:::

## Gödel and Rosser, side by side 🔬

::: question
Why does Rosser's race help, compared with Gödel's single search?
- [ ] It makes the program faster
  Speed isn't the point.
- [x] It reacts to *both* ways `S` could commit, so either way leads to a contradiction
  Right. Gödel's `g` only reacts to one kind of proof, so a false "`g` halts" slips past unnoticed. Rosser's program reacts to both.
- [ ] It doesn't: they prove the same thing
  Rosser's conclusion is stronger: "neither provable nor disprovable", from consistency alone.
:::

::: aside Rosser's trick as a guessing game
Scott Aaronson describes Rosser's theorem as a puzzle about **consistent guessing**. Imagine a program that, given any program `P`, must always halt, and must answer `true` if `P` returns `true`, `false` if `P` returns `false`, and anything it likes if `P` loops. A consistent, complete, effective system would give you one: race a proof against a disproof of "`P` returns `true`". But a troll that asks the guesser about itself and does the opposite defeats any such guesser, just as in chapter 6. So no consistent, effective system (that checks computations) is complete.
:::

Here's every theorem in the course so far, and exactly what each one assumes:

@figure hypothesis-map

::: question
Look at the table. Which theorems make the weakest assumptions about the formal system itself?
- [ ] The halting-based one from chapter 8
  That one needs soundness, which is a strong assumption.
- [x] Gödel's theorem and Rosser's theorem: effective, consistent, and checks computations
  Right. And between the two, Rosser's has the stronger conclusion ("neither provable nor disprovable"), at the cost of the racing ability and statements about outputs.
:::

All of our theorems *assume* the system is consistent. One question remains: can a system at least prove that about itself?

[[Can a system prove it's consistent?]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise rosser-program Write Rosser's program
Write `rosser(x)`: race a search for a proof against a search for a disproof, and do the opposite of whichever `S` finds first.
--- hint
This is the racing decider from chapter 5, with the answers swapped: a disproof found first means return `true`.
--- solution
```js
function rosser(x) {
  const yes = findYes(x), no = findNo(x)
  while (true) {
    if (no.next().done) return true    // S disproved it first: say true
    if (yes.next().done) return false  // S proved it first: say false
  }
}
```

Whichever way `S` commits, Rosser's program does the opposite, with a run that `S` can check.
:::

::: exercise rosser-order Prove Rosser's theorem
Put together Rosser's proof that a consistent system can neither prove nor disprove Rosser's sentence. Two of the steps don't belong.
--- hint
There are two cases, "`S` proves it" and "`S` disproves it". Each uses consistency to rule out the other search, then gets a contradiction.
--- solution
The two cases can be handled in either order (or even interleaved), so several orders work. The red herrings: Rosser's theorem doesn't assume soundness, and nothing lets `S` prove that a program loops.
:::
