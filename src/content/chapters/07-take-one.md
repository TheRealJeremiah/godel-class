---
id: take-one
title: Incompleteness, take one
subtitle: A complete system would solve the halting problem
emoji: 🏁
blurb: If a sound, effective system could settle every statement, we could race its proof searches to decide halting. Turing says we can't, so the system must be incomplete. Our first full proof of an incompleteness theorem.
---

Here's the plan for our first incompleteness proof. The idea goes back to Alan Turing and Stephen Kleene in the 1930s and 40s, and it's how many computer scientists prefer to explain Gödel today. Suppose a formal system `S` is sound, effective, **and complete**. Then for any program `x`, S proves either "x halts on x" or "x doesn't halt on x", and it's right. So to find out whether `x` halts on `x`, just search for a proof either way. We'd have solved the halting problem, which chapter 5 says is impossible!

[[Let's race some proofs]]

## Racing two searches 🏎️

The "search for a proof either way" step needs a new ability. We can't run `findHaltProof x` and then `findLoopProof x`, because if the first search never finds anything, we'd wait forever. Instead we **race** them: one step of the first search, one step of the second, and so on.

```js
function race(p, q, x) {
  const a = start(p, x), b = start(q, x);  // two paused computations
  while (true) {
    if (a.step() === "done") return true;   // p finished first
    if (b.step() === "done") return false;  // q finished first
  }
}
```

Every real language can do this (JavaScript generators, threads, or an interpreter that runs one step at a time). So, like `HasTroll`, we make it a named ability:

@snippet has_race

@figure race

::: question
`HasRace` only promises something when exactly one of the programs halts. What happens with the real `race` in JavaScript if **both** halt?
- [ ] It crashes
  Nothing crashes: it returns as soon as one of them finishes.
- [x] It returns whichever finishes first, and `HasRace` doesn't say which that is
  Right. Our proofs never need that case, so we don't make any promises about it. Leaving it out makes `HasRace` an easier assumption to satisfy.
- [ ] It loops forever
  The loop checks both computations each round, so it stops as soon as either finishes.
:::

::: question
And if **neither** program halts?
- [x] The race runs forever
  Right. Each round, both computations take a step and neither finishes, forever. (`HasRace` doesn't need to promise this either.)
- [ ] It returns `false` after a timeout
  There's no timeout in `race`. It keeps going as long as neither is done.
:::

## The proof 🏁

Here's the whole argument, in Lean:

@snippet take_one

We assume `hcomplete : S.Complete` and aim for a contradiction with `M.halting_problem T`. To use that theorem, we must exhibit a program that decides `HaltsOnSelf`. The candidate is `R.race E.findHaltProof E.findLoopProof`. Then we must check two things for every `x`: it returns `true` when `x` halts on `x`, and `false` when it doesn't.

::: question
Take the first case, `hx : M.Halts x x`. The proof first shows `no_loop_proof`: S can't prove "x doesn't halt on x". Which assumption gives us that?
- [ ] Completeness
  Completeness says S proves *something*. It doesn't rule anything out.
- [x] Soundness
  Right. If S proved "x doesn't halt on x", soundness would make it true, contradicting `hx`.
- [ ] Effectiveness
  Effectiveness is about searching for proofs, not about which proofs exist.
:::

::: question
Next, `halt_proof : S.Provable (S.halts x x)` comes from `(hcomplete _).resolve_right no_loop_proof`. What does `resolve_right` do?
- [x] Given `A ∨ B` and `¬ B`, it concludes `A`
  Right. Completeness gives "S proves φ or S proves `neg φ`", soundness has ruled out the right side, so the left side must hold.
- [ ] Given `A ∨ B`, it picks `B`
  It can't just *pick* a side! It needs evidence that the other side is impossible.
- [ ] It resolves a merge conflict
  Different kind of conflict! `h.resolve_right hnb` turns `h : A ∨ B` and `hnb : ¬ B` into a proof of `A`.
:::

::: question
Finally, `R.left_wins` needs two facts. Which ones?
- [ ] That `x` halts on `x`, and that S is complete
  `left_wins` is about the two racing programs, not about `x` directly.
- [x] That `findHaltProof` halts on `x`, and `findLoopProof` doesn't
  Right. The first follows from `halt_proof` via `findHaltProof_spec`. The second holds because `findLoopProof` halting would mean a loop proof exists, which we've ruled out.
- [ ] That both searches halt on `x`
  If both halted, `HasRace` would promise nothing. We need exactly one.
:::

The second case (`x` doesn't halt on `x`) is the mirror image: soundness rules out a halting proof, completeness gives a looping proof, and `right_wins` says the race returns `false`.

::: question
Where in this proof did we use `T : M.HasTroll`?
- [ ] Nowhere, it's unused
  Lean would warn us about an unused variable (well, a linter would). Look at `apply M.halting_problem T`.
- [x] Inside `M.halting_problem T`: the troll is what makes halting undecidable
  Right. This proof supplies a would-be halting tester, and chapter 5's troll shows it can't exist. The troll is still doing the work, one level down.
- [ ] In the race
  The race uses `R : M.HasRace`. The troll is used by the halting problem.
:::

::: unlock Incompleteness, take one
If S is sound and effective, it can't be complete. Otherwise, racing a search for "x halts on x" against a search for "x loops on x" would decide the halting problem.
:::

## What did we really prove? 🤔

::: question
The theorem says S is incomplete: *some* statement is neither provable nor disprovable. Does the proof tell us *which* statement?
- [ ] Yes: `S.halts x x`
  Which `x`, though? The proof never picks a specific program. It just shows that "every `x` is settled" leads to a contradiction.
- [x] No: it shows a counterexample exists, without pointing to one
  Right. It's a proof by contradiction that never names a specific undecided statement. That's a bit unsatisfying! In the next chapter, we'll find an **explicit** statement that S can't settle, and it'll be a sentence that talks about itself.
- [ ] Yes: the troll's halting statement
  Close in spirit, but the troll here is built from the race program, and the proof never actually says which statement about it is unprovable.
:::

::: question
Suppose Lean is sound. Does this theorem apply to Lean?
- [x] Yes: Lean is effective and can talk about programs, so if it's sound, some statement is independent of it
  Right. Lean's proofs are mechanically checked, so it's effective. It can state halting claims about an interpreter written in Lean. So there are statements about programs that Lean can neither prove nor disprove (if Lean is sound).
- [ ] No: Lean is a proof assistant, not a formal system
  Lean *is* a formal system: statements (`Prop`s), proofs (terms), and a mechanical checker (the kernel).
- [ ] No: Lean can prove anything that's true
  That's what this theorem refutes, assuming Lean is sound!
:::

::: question
"Fine," you say, "whenever I find a statement Lean can't settle, I'll add the true answer as a new axiom." Does that give a complete system eventually?
- [ ] Yes, after adding enough axioms
  Every system you create along the way is still sound and effective (you can list its axioms), so the theorem applies to each one of them.
- [x] No: every sound, effective extension is incomplete too
  Right. Just like patching a halting tester (chapter 5) or adding the diagonal to a list (chapter 3), each patched system has new gaps. The only way out is to give up effectiveness, and then you can't check proofs mechanically any more.
:::

## Checking the fine print 🔍

@figure hypothesis-map

So far we have one row of that table filled in with a proof. Notice how many assumptions it needs: effective, sound, and both computer abilities.

::: question
Gödel's original theorem needs only **consistency**, not soundness. Why is that better?
- [ ] Consistency is easier to spell
  Well, yes. But there's a mathematical reason too!
- [x] Consistency is a weaker assumption, so the theorem applies to more systems
  Right. Soundness requires the system to be *correct* about halting, which we can't check from inside. Consistency only requires it to never contradict itself. A theorem that assumes less applies to more systems, and says more.
- [ ] Soundness might be false for Lean
  Possibly, but the main point is that consistency is a weaker (more easily satisfied) requirement.
:::

In the next chapter, we'll build Gödel's sentence explicitly and weaken "sound" to "consistent".

[[Show me Gödel's sentence!]]
