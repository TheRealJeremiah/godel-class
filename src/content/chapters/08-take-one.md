---
id: take-one
title: Incompleteness, take one
subtitle: A complete system would recognize looping
emoji: 🏁
blurb: If a sound, effective system could settle every statement, its proof search would recognize exactly the looping programs. Chapter 6 says that's impossible, so the system must be incomplete. Our first incompleteness theorem.
---

We now have all the pieces for a first incompleteness theorem:

* **Chapter 6:** no program recognizes the programs that loop on themselves.
* **Chapter 7:** in an effective system, a program (`findLoopProof`) can search for proofs that a program loops.

Put a *sound* and *complete* system in the middle, and those two facts collide. This argument goes back to Alan Turing and Stephen Kleene in the 1930s and 40s, and it's how many computer scientists prefer to explain Gödel today.

[[Let's collide them]]

## The theorem 🎯

::: theorem Incompleteness via halting
No formal system is sound, effective, and complete (for halting statements).
:::

**Proof.** Suppose `S` were all three. We'll show that `findLoopProof` recognizes looping, contradicting chapter 6. We need: for every program `x`,

> `findLoopProof` halts on `x`  **if and only if**  `x` loops on itself.

By chapter 7, `findLoopProof` halts on `x` exactly when `S` proves "`x` loops on `x`". So it's enough to show that **`S` proves "`x` loops on `x`" if and only if `x` really loops on `x`.**

1. **If `S` proves it, it's true.** That's soundness.
2. **If it's true, `S` proves it.** Suppose `x` loops on `x`. Then `S` can't prove "`x` halts on `x`", since soundness would make that true. And completeness says `S` proves one of the two. So `S` proves "`x` loops on `x`".

So `findLoopProof` would recognize looping, which chapter 6 says is impossible. So `S` can't be sound, effective and complete. ∎

::: question
In step 2, which assumption rules out `S` proving "`x` halts on `x`"?
- [ ] Completeness
  Completeness says `S` proves *something*. It never rules anything out.
- [x] Soundness
  Right. `x` really loops, and a sound system never proves a false halting claim.
- [ ] Effectiveness
  Effectiveness is about searching for proofs, not about which proofs exist.
:::

::: question
And which assumption then guarantees that `S` proves "`x` loops on `x`"?
- [x] Completeness
  Right. `S` proves the statement or its negation; the negation is ruled out; so it proves the statement.
- [ ] Soundness
  Soundness only tells you that what's proved is true. It never forces anything to *be* proved.
:::

::: question
Where did we use effectiveness?
- [ ] Nowhere
  Without effectiveness, there'd be no program to contradict chapter 6 with.
- [x] To have `findLoopProof` at all: a *program* that searches for proofs
  Right. Chapter 6 says no *program* recognizes looping. Effectiveness is what turns "`S` proves it" into something a program can recognize.
:::

::: question
Suppose `S` is sound and complete, but **not** effective: there's no program that checks its proofs. Where does the proof break?
- [x] We no longer have a *program* `findLoopProof`, so there's nothing to contradict chapter 6 with
  Right. "`S` proves `x` loops" is still exactly "`x` loops", but no program recognizes it. That's fine: chapter 6 only forbids *programs* from recognizing looping. (The set of all true halting statements is exactly such a system.)
- [ ] Step 1 fails
  Step 1 only uses soundness, which we still have.
- [ ] It doesn't break: the theorem still applies
  Without effectiveness, the theorem genuinely fails: "all true halting statements" is sound and complete.
:::

Here's the Lean version. Its structure follows the English proof exactly: it aims to contradict "looping is not recognizable", offers `findLoopProof` as the recognizer, and checks the two directions.

@proof take_one See the proof in Lean

::: unlock Incompleteness, take one
A sound, effective system can't be complete. Otherwise, its search for "this program loops" proofs would recognize every looping program, and chapter 6 says no program can.
:::

## What did we really prove? 🤔

::: question
The theorem says some statement is neither provable nor disprovable. Does the proof tell us *which* statement?
- [ ] Yes: "`x` loops on `x`"
  Which `x`, though? The proof never picks a specific program.
- [x] No: it shows a gap must exist, without pointing to it
  Right. It's a proof by contradiction that never names a specific undecided statement. A little unsatisfying! In the next chapter, we'll find an **explicit** one, and it will be a sentence that talks about itself.
:::

::: question
If we trust that Lean is sound, does this theorem apply to Lean?
- [x] Yes: Lean is effective and can state halting claims, so if it's sound, some halting statement is independent of it
  Right. Lean's proof checker is a program, and you can state halting claims in Lean. So there are statements about programs that Lean can neither prove nor disprove.
- [ ] No: Lean is a proof assistant, not a formal system
  Lean *is* a formal system: statements, proofs, and a mechanical checker.
- [ ] No: Lean can prove anything that's true
  That's exactly what this theorem refutes, assuming Lean is sound.
:::

::: question
"Fine," you say. "Whenever I find a statement Lean can't settle, I'll add the true answer as a new axiom." Does that eventually give a complete system?
- [ ] Yes, after adding enough axioms
  Each system you build along the way is still sound and effective (as long as a program can list its axioms), so the theorem applies to each one.
- [x] No: every sound, effective extension is incomplete too
  Right. Like patching a halting tester, or adding `diag` to Cantor's list, each patched system has new gaps. The only escape is to give up effectiveness, and then nobody can check your proofs.
:::

## Checking the fine print 🔍

::: question
Can we simply drop soundness from the theorem, and say "no effective system is complete"?
- [ ] Yes: soundness isn't really needed
  Think of the silly system from chapter 7 that proves every statement.
- [x] No: the system that proves every statement is effective and complete
  Right. Its checker is trivial ("everything is a proof"), and it proves everything, so it's complete. It's just inconsistent. So *some* condition like soundness or consistency is needed.
:::

::: question
Our theorem needs **soundness**. Gödel's original theorem needs only **consistency**. Why is that better?
- [x] Consistency is a weaker assumption, so the theorem applies to more systems
  Right. Soundness asks the system to be *right* about programs, which is hard to check. Consistency only asks it to never contradict itself. A theorem that assumes less says more.
- [ ] Consistency is easier to prove
  In fact, the second incompleteness theorem (chapter 11) says a system can't even prove its own consistency! The point is that consistency is a *weaker assumption*.
:::

::: question
Which chapter-6 abilities of the computer does this proof rely on, through "looping is not recognizable"?
- [ ] None
  "Looping is not recognizable" was built on the halting problem and Post's theorem, which each needed abilities.
- [x] Guards (to build the troll), racing (for Post's theorem), and self-running (to recognize halting)
  Right. All three, one level down. We'll list every theorem's assumptions in a table in chapter 10.
:::

In the next chapter, we'll build Gödel's sentence explicitly, and weaken "sound" to "consistent".

[[Show me Gödel's sentence]]
