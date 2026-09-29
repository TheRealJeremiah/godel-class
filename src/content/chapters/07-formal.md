---
id: formal
title: Formal systems, precisely
subtitle: Consistent, complete, sound, and searchable
emoji: 🤵
blurb: We pin down what a formal system is, what it means for its statements to be true, and the properties Gödel's theorem is about. Then we prove the fact that dooms every such system - its theorems can be searched by a program.
---

In chapter 1 we met a toy formal system, Evens. Gödel's theorem is about *all* formal systems that are strong enough to talk about programs. To prove something about all of them at once, we'll do what we did for computers: write down only the few things we need to know about a formal system, and nothing else.

[[Let's formalize formal systems]]

## What we need to know about a formal system 🏛️

@snippet formal_system

In words, a formal system `S` has:

* **statements** (`Stmt`): the things it can say;
* **provability** (`Provable`): which statements it can prove;
* **negation** (`neg`): for each statement `s`, the statement "not `s`";
* **halting statements** (`halts`): for any program `p` and input `x`, a statement that says "`p` halts on `x`".

We'll say `S` **disproves** `s` when it proves `neg s`.

::: note
**Some real formal systems.** You'll hear these names for the rest of the course.

* **Peano arithmetic** (PA): axioms about the whole numbers, `+` and `×`, plus induction. Enough for most of number theory.
* **ZFC set theory**: axioms about sets. Almost all of modern mathematics can be written in it.
* **Lean**: the system we've been using. Its logic is at least as strong as ZFC's, in practice.

All three can talk about programs (in a way we'll discuss below), and all three have mechanical proof checkers.
:::

## Statements versus facts 🪞

It's very important to keep two things apart:

* **The fact** that program `p` halts on `x`. That's `M.Halts p x` from chapter 4: something that is simply true or false about the program.
* **The statement** `S.halts p x`, a sentence in the formal system that *claims* `p` halts. `S` may or may not prove it, and if it does prove it, it may or may not be right!

::: question
Which of these is about what a formal system can *prove*, rather than about what programs actually *do*?
- [ ] `M.Halts p x`
  That's the fact about the program. It doesn't mention any formal system.
- [x] `S.Provable (S.halts p x)`
  Right. That says the system `S` proves the statement "`p` halts on `x`". Whether `p` really halts is a separate question.
:::

This lets us say exactly what **true** means for the statements we care about. A halting statement `S.halts p x` is **true** when `p` really does halt on `x`. Its negation is true when `p` really loops. We never need truth for any other kind of statement, so we won't define it for them.

::: aside Wait: how can Peano arithmetic talk about programs?
Peano arithmetic only knows about whole numbers, `+` and `×`. Gödel spent most of his 1931 paper on exactly this problem, which is now called **arithmetization**. You encode each program as a number (its **Gödel number**), encode each step of a computation as a number, and write a formula that says "there's a number that encodes a finished run of program `p` on input `x`". It's fiddly but routine, like writing an interpreter in a very low-level language.

We skip all that by *assuming* the system has a statement `S.halts p x`. For Lean the assumption is easy to believe: you could write an interpreter in Lean, and state "there is some amount of fuel after which the program has halted", exactly like our toy machine.
:::

## Consistent and complete 👍👎

Here are the two properties from chapter 1, now for any formal system:

@snippet consistent_complete

::: question
A silly system proves *every* statement. Is it consistent? Complete?
- [ ] Both: the perfect system!
  It proves `s` *and* `neg s` for every `s`. That's exactly what "inconsistent" means.
- [x] Complete, but not consistent
  Right. Completeness is trivial if you don't care about consistency.
- [ ] Consistent, but not complete
  It proves `s` and `neg s` for every `s`, which is what consistency forbids.
:::

::: question
And a system that proves *nothing*?
- [x] Consistent, but not complete
  Right. Consistency is trivial if you don't care about completeness. The hard part, and Hilbert's dream, is getting both at once.
- [ ] Complete, but not consistent
  It never proves `s` or `neg s`, so it isn't complete.
:::

::: question
In ordinary logic, an inconsistent system can prove *every* statement. Why?
- [x] From a statement and its negation, ordinary logic lets you derive anything
  Right. It's called the **principle of explosion**: from `P` and `¬P`, any conclusion follows. So an inconsistent system is useless. It "proves" `0 = 1`.
- [ ] Because inconsistent systems have more axioms
  An inconsistent system might have very few axioms. The problem is what logic lets you do with a contradiction.
:::

## Sound: never wrong about programs 😇

Consistency means a system never contradicts *itself*. **Soundness** is stronger: the system never contradicts *reality*. We only need soundness for halting statements:

@snippet sound

In words: if `S` proves "`p` halts on `x`", then `p` really halts; and if `S` proves "`p` doesn't halt on `x`", then `p` really doesn't.

::: question
Why does soundness imply that `S` never proves both "`p` halts on `x`" and its negation?
- [x] Because then `p` would both halt and not halt, which is impossible
  Right. The first proof would mean `p` halts, and the second that it doesn't. So soundness implies consistency, at least for halting statements.
- [ ] Because sound systems are complete
  Soundness says nothing about completeness. It only restricts what *is* proved.
:::

@proof sound_consistent See this in Lean

::: question
Does it work the other way? Can a consistent system be *unsound*?
- [x] Yes: it can prove a false claim without ever proving a contradiction
  Right. Suppose `p` really loops, but `S` has an extra axiom saying "`p` halts". `S` would only become inconsistent if it could *also* prove "`p` doesn't halt", and proving that something loops can be very hard (remember the halting asymmetry). So the false axiom might never be caught. We'll build exactly such a system in chapter 9.
- [ ] No: a false claim always leads to a contradiction eventually
  Surprisingly, no. A false halting claim can hide forever if the system is too weak to *disprove* it.
:::

## Telling them apart: consistent, complete, sound 🧭

These three words are easy to mix up, so let's put them side by side. Pick any halting statement `s` (say, "`p` halts on `x`"). A formal system either proves `s` or doesn't, and either proves its negation or doesn't. That gives four possible outcomes:

@figure four-outcomes

Each property rules out a different kind of failure:

* **Consistent** rules out the "both" cell: the system never proves `s` *and* its negation. It's about the system agreeing **with itself**.
* **Complete** rules out the "neither" cell: the system always proves one of the two. It's about **coverage**: every question gets an answer.
* **Sound** rules out proving the **false** one. It's about the system agreeing **with reality**.

::: unlock Consistent, complete, sound
**Consistent:** never both. **Complete:** never neither. **Sound:** never wrong. Consistency and soundness limit what a system proves; completeness demands that it prove enough.
:::

A helpful picture is a student taking an exam of yes/no questions (the questions are statements; answering "yes" means proving the statement, "no" means proving its negation):

* A **consistent** student never answers both "yes" and "no" to the same question.
* A **complete** student answers every question.
* A **sound** student never gives a wrong answer.

::: question
A student answers only the questions they're sure about, gets every one of those right, and leaves the rest blank. Which properties does this student have?
- [x] Sound and consistent, but not complete
  Right. Every answer is correct, so they're sound, and a correct student can't answer both "yes" and "no" (only one can be right), so they're consistent too. But the blanks mean they're not complete. This is what a good formal system looks like, according to Gödel: the blanks can't all be filled in.
- [ ] Complete, but not sound
  They left questions blank, so they're not complete. And every answer they gave was right, so they *are* sound.
- [ ] All three
  The blank questions are the problem: a complete student answers everything.
:::

::: question
Another student answers every question, never gives two answers to the same question, but gets some wrong. Which properties?
- [ ] Sound and complete
  Some answers are wrong, so this student isn't sound.
- [x] Complete and consistent, but not sound
  Right. Answering everything makes them complete, and never answering both ways makes them consistent. But being consistent doesn't make you *correct*: this student is confidently wrong on some questions.
- [ ] Only complete
  They never give two answers to the same question, which is exactly what consistency means.
:::

::: question
A system proves "`q` halts on `x`" *and* "`q` doesn't halt on `x`". Which property fails for sure?
- [x] Consistency (and so soundness too, since one of the two claims must be false)
  Right. That's the "both" cell. And a sound system can never land there, because one of the two statements is false.
- [ ] Completeness
  Completeness is about the "neither" cell. This system answered, twice!
- [ ] Only soundness
  Soundness does fail, but more obviously, the system contradicts itself. That's inconsistency.
:::

::: question
For some program `q`, a system proves neither "`q` halts on `x`" nor "`q` doesn't halt on `x`". Which property fails?
- [ ] Consistency
  It hasn't proved anything about `q`, so it certainly hasn't proved two contradictory things.
- [x] Completeness, and only completeness
  Right. That's the "neither" cell: a question left blank. The system can still be perfectly consistent and sound. Gödel's theorem says every consistent, effective system that checks computations has a blank like this somewhere.
- [ ] Soundness
  It hasn't proved anything false about `q`. It hasn't proved anything about `q` at all.
:::

::: question
A system proves "`q` halts on `x`", but `q` really loops on `x`, and the system never proves that `q` loops. Which property fails?
- [x] Soundness, but it may still be consistent
  Right. It proved a false statement, so it isn't sound. But it never proved the opposite, so it hasn't contradicted *itself*. Consistent but unsound: the confidently wrong student.
- [ ] Consistency
  Consistency would fail only if the system *also* proved "`q` loops on `x`", and it doesn't.
- [ ] Completeness
  It did answer the question about `q`. It just answered wrongly.
:::

::: question
Which of these implications is true (for halting statements)?
- [x] Sound implies consistent
  Right. A sound system only proves true statements, and a statement and its negation can't both be true. So it never proves both. (We showed this above.)
- [ ] Consistent implies sound
  The confidently wrong student is consistent but not sound.
- [ ] Complete implies consistent
  The system that proves every statement is complete but wildly inconsistent.
:::

::: question
Is it possible for a system to be consistent, complete, *and* sound?
- [ ] No, never: that's what Gödel's theorem says
  Look back at the chapter 1 examples, or at the "system" of all true halting statements.
- [x] Yes, but not if it's also effective (and strong enough to talk about programs)
  Right. Evens (chapter 1) is all three (it only ever proves true facts about evenness), but it's too weak to talk about programs. The "system" whose theorems are all the true halting statements is all three, but no program can check its proofs. Gödel's theorem is about the combination: a consistent, effective system that checks computations can't also be complete.
:::

## Checking computations ✅

One more property. Remember the halting asymmetry from chapter 4: if a program halts, its run is a finite, checkable record. Any reasonable formal system can turn that record into a proof:

@snippet proves_halting

Logicians call this **Σ₁-completeness** ("sigma-one completeness"). It's a very mild requirement: Peano arithmetic has it, ZFC has it, Lean has it, and even much weaker systems do.

::: question
Why is `ProvesHalting` a reasonable assumption?
- [x] If `p` halts, the system can check the run step by step, like proving the toy machine halts with a given amount of fuel
  Right. It needs patience, not insight: "here's how many steps it takes, and here's the computation".
- [ ] Because strong systems can decide whether any program halts
  Nothing can do that; that's the halting problem. `ProvesHalting` only promises proofs for programs that *do* halt.
:::

::: question
Does `ProvesHalting` also promise proofs that looping programs loop?
- [ ] Yes, that's the other half
  Read the definition: it only covers programs that halt.
- [x] No: proving that something loops needs insight, and chapter 6 says no effective system can do it for every looping program without also proving false things
  Right. This is the asymmetry again, and it's exactly where Gödel's theorem will strike: its unprovable sentence says that a certain program **loops**.
:::

## Every proof can be listed 🔢

Now for the property that dooms formal systems. A proof is just a string of characters, and every string can be written in binary. So if we can list every **bit string**, we can list every possible proof. Here's a way to number every bit string:

@snippet nth_string

@figure string-list

::: question
Using the list in the figure, what is string number 2?
- [ ] `0`
  That's string number 1.
- [x] `1`
  Right. The list goes: the empty string, `0`, `1`, `00`, `10`, `01`, `11`, `000`, and so on. (In this encoding, the first bit is at the left.)
- [ ] `00`
  That's string number 3.
:::

::: theorem Every string is listed
Every bit string appears in the list: for each string `s`, some number `n` has `nthString n = s`.
:::

The proof works by induction on the length of `s`: the function `indexOf` computes the position, and the proof checks that `nthString (indexOf s) = s`.

@proof every_string_listed See the proof in Lean

::: aside Isn't this just Gödel numbering?
Yes! Gödel gave every formula and proof a number, so that arithmetic could talk about them. `indexOf` is a much simpler Gödel numbering, for bit strings. Today it doesn't feel deep: every programmer knows that strings are just bytes, and bytes are just numbers.
:::

Now suppose a system's proofs can be checked by a program, and checking always finishes (like our Evens checker). Then a program can try every string as a proof:

```js
// Halts exactly when the statement s is provable.
function findProof(s) {
  for (let n = 0; ; n++) {
    if (check(nthString(n)) === s) return;   // found a proof of s
  }
}
```

::: theorem The theorems of a formal system are recognizable
If a formal system's proofs can be checked by a program that always finishes, then "`s` is provable" is recognizable: `findProof(s)` halts exactly when `s` has a proof.
:::

@proof search_spec See the proof-search theorem in Lean

::: question
Why do we need proof-checking to always finish?
- [x] Otherwise the search could get stuck forever checking one bogus string, and never reach the real proof
  Right. Remember from chapter 1: `check` always finishes. That's what makes the search work.
- [ ] Otherwise the system would be inconsistent
  Consistency is about which statements are provable. This is about whether a program can find the proofs.
:::

::: question
If `s` has no proof, what does `findProof(s)` do?
- [ ] It eventually returns "no proof"
  After checking a billion strings, the next one might be a proof. The search can never know when to give up.
- [x] It searches forever
  Right. It's a recognizer, not a decider: it halts on the provable statements and runs forever on the rest.
:::

## Effective systems ⚙️

A system whose proofs can be checked by a program is called **effective**. Lean, Peano arithmetic and ZFC are all effective. For our proofs, we only need one particular proof search: the search for proofs that a program loops on itself.

@snippet effective

In JavaScript, it's `findProof` specialized to one kind of statement:

```js
function findLoopProof(x) {
  for (let n = 0; ; n++) {
    if (check(nthString(n)) === `¬ halts(${x}, ${x})`) return;
  }
}
```

::: question
Why do we only need the search for "`x` doesn't halt on `x`", and not searches for every statement?
- [x] Because the arguments ahead only ever ask about programs run on themselves: the diagonal
  Right. Just as the halting problem focused on `HaltsOnSelf`, Gödel's argument only needs the diagonal statements. Assuming less makes the theorem stronger.
- [ ] Because other statements can't be searched for
  They can. We just don't need them.
:::

::: aside Why is Effective an assumption, and not a theorem?
We just *proved* that proof search works, so why assume it? Because our Lean proof is about a *Lean* function (`searchUpTo`), while `Effective` is about a *program* for the abstract computer `M`. Since `M` is abstract, Lean doesn't know how to turn one into the other. For any real programming language, you'd just write the search. So we record it as an assumption, and the proof-search theorem above is the reason it's reasonable.
:::

::: question
Imagine the "system" whose provable statements are exactly the **true** halting statements. It's consistent, complete and sound. Is it effective?
- [ ] Yes, every system is effective
  Only systems whose proofs a program can check. And chapter 6 has something to say about this one.
- [x] No: its search for "`x` loops" proofs would recognize looping, which chapter 6 says is impossible
  Exactly. If this system were effective, `findLoopProof` would halt on exactly the looping programs, which would recognize looping. So "just take all the truths" doesn't give an effective system. That's the argument of the next chapter, in miniature.
:::

::: unlock Effective formal systems
If proofs can be checked by a program that always finishes, then a program can search through every proof, one string at a time. So "`s` is provable" is **recognizable**. That's harmless for weak systems, and fatal for strong ones.
:::

[[Put the pieces together]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise classify-systems Consistent, complete, or sound?
Write three functions that classify a formal system in a tiny world of four programs. A system is described by the list of statements it proves. The tests try systems with many different combinations of the three properties.
--- hint
**Consistent:** for no program `p` does it prove both `p + " halts"` and `p + " loops"`. **Complete:** for every program it proves at least one. **Sound:** for every statement it proves, the claim matches `reallyHalts`.
--- solution
```js
function consistent(proved) {
  return !programs.some((p) => proved.includes(p + " halts") && proved.includes(p + " loops"))
}

function complete(proved) {
  return programs.every((p) => proved.includes(p + " halts") || proved.includes(p + " loops"))
}

function sound(proved) {
  return proved.every((s) => {
    const [p, claim] = s.split(" ")
    return (claim === "halts") === reallyHalts(p)
  })
}
```

Consistent: never both. Complete: never neither. Sound: never wrong.
:::

::: exercise sound-consistent-order Prove that sound implies consistent
Prove that a sound system never proves both "`p` halts on `x`" and its negation. Two of the steps don't belong.
--- hint
Suppose it proves both, and apply soundness to each one.
--- solution
The two uses of soundness can come in either order. The red herrings: completeness isn't needed, and consistency doesn't imply soundness (it's the other way round).
:::
