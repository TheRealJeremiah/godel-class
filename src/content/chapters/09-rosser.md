---
id: rosser
title: Rosser's trick
subtitle: Incompleteness from consistency alone
emoji: 🎭
blurb: Gödel's sentence can't be proved, but a consistent system might still wrongly disprove it. Rosser's program races a proof against a disproof and does the opposite of whichever it finds first, giving a sentence that is neither provable nor disprovable, assuming only consistency.
---

At the end of the last chapter, we found a gap. Assuming only consistency, we showed that S can't *prove* the Gödel sentence, but S might still *disprove* it (by wrongly proving "g halts on g"). So we haven't yet shown that a merely consistent S is **incomplete**, meaning it has a statement it can neither prove nor disprove.

In 1936, J. Barkley Rosser closed the gap with a cleverer sentence. In this chapter, we'll build Rosser's sentence as a program. It's the troll's trick, turned on proofs.

[[Troll the proofs]]

## The idea 💡

Gödel's program `g` searches for only one thing: a proof that it loops. Rosser's program searches for *two* things at once, and does the opposite of whatever it finds first:

```js
function rosser(x) {
  // Race two proof searches, like in chapter 7:
  //   a disproof of "x(x) returns true"   vs   a proof of it.
  // Whichever is found first, do the opposite!
  return race(findNo, findYes, x);
    // disproof found first → return true
    // proof found first    → return false
}
```

Then, as always, run it on its own source: `rosser(rosser)`.

::: question
Rosser's sentence says "`rosser(rosser)` returns `true`". Suppose S **proves** it. What will `rosser(rosser)` find first?
- [ ] The disproof
  If S is consistent and proves the sentence, there is no disproof to find.
- [x] The proof, since (by consistency) there's no disproof, so it returns `false`
  Right. It finds S's proof that it returns `true`, so it returns `false`, making the proven sentence false. And S can *check* that run and prove "`rosser(rosser)` doesn't return `true`". Now S has proved the sentence and its negation!
- [ ] Neither, it loops
  A proof exists (we supposed so), so the proof search eventually finds it.
:::

::: question
Now suppose S **disproves** the sentence, proving "`rosser(rosser)` doesn't return `true`". What happens?
- [x] It finds the disproof, since there's no proof. So it returns `true`, and S can check that. Contradiction again!
  Right. Returning `true` makes the disproved sentence true. S can check that finished run and prove the sentence, so S proves both it and its negation.
- [ ] It finds the disproof, so it returns `false`
  Look at the rule: a disproof found first means *return true*. Rosser's program always contradicts what it finds.
- [ ] It loops forever
  A disproof exists (we supposed so), and consistency means there's no proof to find instead. So the disproof search wins.
:::

So if S is consistent, it can neither prove nor disprove Rosser's sentence. Notice that each case needs S to *check* a finished run, but no case needs S to be *right* about anything. That's why plain consistency is enough.

## Talking about outputs 📤

Rosser's sentence is about what a program *returns*, not just whether it halts. So we extend our formal system with a new kind of statement:

@snippet rosser_system

`extends FormalSystem M` means a `RosserSystem` has all the fields of a `FormalSystem` (`Stmt`, `Provable`, `neg`, `halts`) plus one new one, `says`.

We need S to check finished computations, now including their outputs:

@snippet proves_outputs

::: question
`ProvesOutputs` asks for *two* proofs when `p` returns `b` on `x`. Why do we also need "p doesn't return `!b` on x"?
- [ ] We don't; it's redundant
  From S's point of view it's not obvious! S needs to know that a program can't return two different answers. Rosser's proof uses this second half directly.
- [x] Because Rosser's contradiction needs S to *disprove* "ρ says true" when ρ actually returns `false`
  Right. In the first case of the proof, ρ returns `false`, and we need S to prove "ρ doesn't return `true`". Knowing only "ρ returns `false`" isn't enough unless S knows programs have only one output. Any reasonable system does, so it's a harmless assumption.
- [ ] Because programs can return both `true` and `false`
  A program run returns (at most) one answer. That's exactly the fact we're asking S to be able to prove.
:::

And, of course, S must be effective: we need the two proof searches.

@snippet rosser_effective

## Rosser's program, in Lean 🎭

@snippet rosser_program

::: question
`R.race E.findNo E.findYes` returns `true` if the *first* program halts and the second doesn't. So when does `ρ` return `true` on `x`?
- [ ] When S proves "x says true on x"
  That's `findYes`, which is the *second* racer. If it wins, the race returns `false`.
- [x] When S disproves "x says true on x" (and doesn't prove it)
  Right. `findNo` is the first racer, and it halts when a *disproof* exists. So ρ contradicts S: disproof found means return `true`.
:::

## The proof ✓

Here's Rosser's theorem. It's the two cases we just reasoned through:

@snippet rosser

::: question
In the first case, `hyes` says S proves "ρ says true". How does the proof get `hno : ¬ S.Provable (S.neg ...)`?
- [x] From consistency: S can't prove both a sentence and its negation
  Right: if S also proved the negation, then `hcon _ ⟨hyes, hno⟩` would be a contradiction. So there's no disproof.
- [ ] From soundness
  There's no soundness assumption in `rosser`! That's the whole point.
- [ ] From `ProvesOutputs`
  `ProvesOutputs` is used later, after we know what ρ returns.
:::

::: question
Next, `hrun : M.run ρ ρ = .returns false`. Which racer won?
- [ ] `findNo`, the disproof search
  There's no disproof (that's `hno`), so `findNo` never halts on ρ.
- [x] `findYes`, the proof search, so the race returns `false`
  Right: `findYes` halts (S proves the sentence), `findNo` doesn't (no disproof), so `R.right_wins` gives `.returns false`.
:::

::: question
The last line is `exact hno (hout ρ ρ false hrun).2`. What does `(hout ρ ρ false hrun).2` prove?
- [ ] That ρ returns `false` on ρ
  That's `(hout ρ ρ false hrun).1`. The `.2` part is about the *other* answer.
- [x] "ρ doesn't return `!false`", which is "ρ doesn't return `true`": the negation of Rosser's sentence
  Right. `!false` is `true`, so this is exactly a disproof of Rosser's sentence, contradicting `hno`.
- [ ] That S is inconsistent
  It's a proof *in* S of a particular statement. The contradiction comes from comparing it with `hno`.
:::

The second case is the mirror image, using `left_wins` and `.1`.

::: unlock Rosser's theorem (1936)
If S is consistent, effective, and can check finished computations (including their outputs), then Rosser's sentence, "ρ returns `true` on ρ", is neither provable nor disprovable in S. So S is **incomplete**. No soundness, no ω-consistency: just consistency.
:::

## Comparing Gödel and Rosser 🔬

::: question
Gödel's `g` looks for a proof of one statement. Rosser's ρ races a proof against a disproof. Why does the race help?
- [ ] It makes the program faster
  Speed isn't the point: the proofs aren't about speed.
- [x] Whichever way S commits, ρ contradicts it with a run S can check. So *both* directions lead to inconsistency
  Right. Gödel's `g` only reacts to one kind of proof. If S wrongly proves "g halts", `g` never notices. Rosser's ρ reacts to both, so S can't commit either way without contradicting itself.
- [ ] It doesn't; Rosser's theorem is the same as Gödel's
  Rosser's conclusion is stronger: "neither provable nor disprovable" from consistency alone.
:::

::: question
What happens if S is **inconsistent**, so it proves both Rosser's sentence and its negation?
- [ ] Then `rosser` still applies
  `rosser` assumes `hcon : S.Consistent`. Without it, the theorem says nothing.
- [x] Then both racers halt, `HasRace` promises nothing, and the argument breaks down, as it must: an inconsistent S proves everything
  Right. This is exactly the case `HasRace` stays silent about. And it has to break down somewhere, since an inconsistent system proves every statement, so it's certainly "complete".
:::

::: aside Rosser's trick as a guessing game
Scott Aaronson describes Rosser's theorem as a puzzle about **consistent guessing**. Is there a program that, given any program `P`, halts and outputs `true` if `P` returns `true`, outputs `false` if `P` returns `false`, and outputs *either* (but still halts) if `P` loops? A consistent, complete, effective system would give such a program: race a proof against a disproof of "P returns true". But a Rosser-style troll defeats any such guesser. So no consistent, effective system is complete.
:::

Here's where all our theorems stand now:

@figure hypothesis-map

::: question
Look at the table. Which theorem needs the fewest assumptions about S itself (ignoring the computer abilities)?
- [ ] `incomplete_via_halting`
  That one needs S to be sound, which is a strong assumption.
- [ ] `first_incompleteness_sound`
  Also needs soundness.
- [x] `godel_first` and `rosser`: effective, consistent, and able to check computations
  Right. And between them, `rosser` gets the stronger conclusion (a sentence that's neither provable nor disprovable), at the price of one more computer ability (`HasRace`) and statements about outputs.
:::

One question remains. Our theorems all *assume* S is consistent. Can S at least prove *that* about itself?

[[Can S prove it's consistent?]]
