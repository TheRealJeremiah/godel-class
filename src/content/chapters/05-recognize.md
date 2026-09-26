---
id: recognize
title: Deciding, recognizing, listing
subtitle: Three ways a program can answer a question
emoji: 🔎
blurb: A program can answer a yes/no question by always replying, by halting only on "yes", or by listing every "yes". We pin down exactly how these relate, ending with Post's theorem, the tool that will turn the halting problem into Gödel's theorem.
---

Computers answer questions. But "answering a question" can mean surprisingly different things, and the differences are at the heart of both Turing's and Gödel's theorems. In this chapter we'll look at three ways a program can answer a yes/no question, and work out exactly how they relate.

[[What are the three ways?]]

## Yes/no questions about inputs ❓

A **property** is a yes/no question you can ask about any input string. For each input `x`, it gives a statement `P(x)` that is either true or false. Some examples:

* "`x` has even length"
* "`x` is valid JSON"
* "`x` is a valid Evens proof" (from chapter 1)
* "`x`, run as a program on its own source code, halts"

The inputs with the property are the **yes-instances**, and the rest are the **no-instances**.

## Way 1: deciding ⚖️

A program **decides** a property if, on *every* input, it halts and answers correctly: `true` on yes-instances, `false` on no-instances.

```js
// Decides "x has even length"
function evenLength(x) {
  return x.length % 2 === 0;
}
```

That's what we normally mean by "a program that answers a question". A property is **decidable** if some program decides it. In Lean:

@snippet decides_def

::: question
Is "`x` is a valid Evens proof" decidable?
- [x] Yes: the Evens checker from chapter 1 decides it
  Right. The checker looks at each line, always finishes, and says whether the proof is valid. Being a valid proof is decidable. (Being a *provable statement* is a different question, as we'll see shortly.)
- [ ] No: proofs can be arbitrarily long
  Long inputs just take longer. The checker still always finishes with the right answer.
:::

## Way 2: recognizing 🔦

A program **recognizes** a property if it halts on exactly the yes-instances, and runs forever on the no-instances. It never says "no"; you learn the answer is "yes" when it stops.

Why would anyone want such a strange program? Because sometimes it's the best you can do. Take the property "the statement `s` is provable in Evens". Here's a program that searches for a proof:

```js
// Recognizes "s is provable in Evens"
function findProof(s) {
  for (const proof of allProofs()) {     // every possible proof, one by one
    if (check(proof) === s) return;      // found one: halt
  }
}
```

If `s` is provable, the search eventually finds a proof and halts. If it isn't, the search goes on forever: there's always another candidate to try. A property is **recognizable** if some program recognizes it.

@snippet recognizes_def

::: question
You've been running a recognizer for property `P` on input `x` for an hour, and it's still going. What do you know?
- [ ] `x` is a no-instance
  Maybe it's a yes-instance and the recognizer just needs another hour.
- [ ] `x` is a yes-instance, but slowly
  Maybe it's a no-instance and the recognizer will run forever.
- [x] Nothing yet
  Right. That's the frustration of a recognizer: "still running" never tells you anything. You only get an answer, "yes", if it stops.
:::

::: question
A program that loops forever on every input. What property does it recognize?
- [ ] No property: it's useless
  It's useless in practice, but it does recognize something!
- [x] The property with no yes-instances at all
  Right. It halts on exactly the yes-instances, and there are none.
- [ ] Every property
  A recognizer for `P` must halt on the yes-instances of `P`. This program never halts on anything.
:::

## Deciding versus recognizing 🥊

::: question
Suppose program `d` decides property `P`. Does `d` itself also *recognize* `P`?
- [ ] Yes: deciding is stronger than recognizing
  Tempting, but look at the definition. A recognizer must *loop* on the no-instances, and `d` halts on them (with `false`).
- [x] No: `d` halts on every input, but a recognizer must loop on the no-instances
  Right. The program `d` isn't a recognizer for `P`. But it's easy to turn it into one, as we'll see next.
:::

Here's how to turn a decider `d` into a recognizer, and even into a recognizer for the **opposite** property ("not `P`"):

```js
function haltIfYes(x) { if (!d(x)) while (true) {} }   // recognizes P
function haltIfNo(x)  { if ( d(x)) while (true) {} }   // recognizes not-P
```

Every real language can wrap a program in an `if` and a loop like this. For our abstract computers, we'll list it as our first named **ability**:

@snippet has_guards

::: question
On a no-instance `x`, what does `haltIfNo` do?
- [x] It halts, because `d(x)` is false so it skips the loop
  Right. And on a yes-instance, `d(x)` is true and it loops forever. So `haltIfNo` halts on exactly the no-instances: it recognizes "not `P`".
- [ ] It loops forever
  On a no-instance, `d(x)` returns `false`, so the `if` condition fails and the loop is skipped.
:::

So: **if a property is decidable, then both it and its opposite are recognizable.** Remember this; its converse is the big theorem of the chapter.

::: question
If `P` is decidable, is its opposite, "not `P`", decidable too?
- [x] Yes: run the decider for `P` and flip its answer
  Right. Decidable properties come in pairs. Recognizable ones don't, as we're about to discover: that asymmetry is what the rest of the course runs on.
- [ ] Not necessarily
  A decider always halts with an answer, so you can simply flip it.
:::

## Way 3: listing 📋

A program **lists** a property if it prints out every yes-instance, one after another (possibly forever), and never prints a no-instance.

```js
// Lists "x has even length"
function* listEvenLength() {
  for (const x of allStrings()) {        // every string, shortest first
    if (x.length % 2 === 0) yield x;
  }
}
```

Listing and recognizing sound different, but they're the same power. Let's see why.

**From a lister to a recognizer.** To recognize whether `x` is a yes-instance, run the lister and halt if `x` ever gets printed.

::: question
Using this method, what happens on a no-instance?
- [x] The recognizer waits forever, because `x` is never printed
  Right. And that's exactly what a recognizer should do on a no-instance. (If the list is finite and runs out, we just loop forever at the end.)
- [ ] The recognizer halts when the list ends
  The list may go on forever. And even if it ends, halting would wrongly signal "yes", so we loop instead.
:::

**From a recognizer to a lister.** This direction is trickier. The obvious idea is: run the recognizer on input 0, then input 1, then input 2, and print the ones where it halts.

::: question
What's wrong with that obvious idea?
- [x] If the recognizer loops on input 0, we never get to input 1
  Right. One looping input would stall the whole list forever, and every later yes-instance would be missed.
- [ ] It prints no-instances too
  It only prints inputs where the recognizer halts, which are yes-instances. The problem is different.
- [ ] Nothing: it works fine
  Try it when the recognizer loops on input 0!
:::

The fix is called **dovetailing**: never wait on any single input. In stage 1, run input 0 for 1 step. In stage 2, run inputs 0 and 1 for 2 steps each. In stage 3, run inputs 0, 1 and 2 for 3 steps each, and so on. Print each input the first time you see it halt.

@figure dovetail

::: question
Input 3 halts after 5 steps. At which stage does dovetailing first print it?
- [ ] Stage 3
  At stage 3, only inputs 0 to 2 have started. Input 3 starts at stage 4.
- [x] Stage 5
  Right. Input 3 starts at stage 4 (with 4 steps, not enough), and at stage 5 it gets 5 steps and halts. Every yes-instance gets printed at some finite stage, and a looping input never blocks the others.
- [ ] Never
  It halts after 5 steps, and it gets at least 5 steps from stage 5 on. So it's printed.
:::

::: question
Suppose `P` and `Q` are both recognizable. Is "`P` **or** `Q`" recognizable?
- [x] Yes: run both recognizers side by side and halt as soon as either one halts
  Right. If `x` has either property, one of the recognizers halts, and we stop. If it has neither, both run forever, and so do we. (Running them one after the other wouldn't work: the first might loop forever.)
- [ ] No: one of the recognizers might loop
  It might, which is why we don't wait for it. Run them side by side instead.
:::

::: unlock Recognizable = listable
A property is recognizable exactly when some program lists its yes-instances. From a lister, recognize by waiting for `x` to appear. From a recognizer, list by **dovetailing**: run more and more inputs for more and more steps, so no looping input can block the rest.
:::

## Post's theorem 🏁

We saw that a decidable property has two recognizers: one for it, one for its opposite. Emil Post noticed in 1944 that the reverse holds too.

::: theorem Post's theorem
A property is decidable **if and only if** both it and its opposite are recognizable.
:::

**Proof.** The "only if" direction is `haltIfYes` and `haltIfNo` from above. For the "if" direction, suppose `r1` recognizes `P` and `r2` recognizes "not `P`". To decide `P` on input `x`, **race** them: run one step of `r1`, then one step of `r2`, then another of `r1`, and so on. If `r1` halts first, answer `true`; if `r2` halts first, answer `false`.

* If `x` is a yes-instance, `r1` halts and `r2` loops, so the race answers `true`.
* If `x` is a no-instance, `r2` halts and `r1` loops, so the race answers `false`.

Either way the race halts with the right answer, so it decides `P`. ∎

@figure race

Racing needs one more ability: running two programs side by side. Every real language can do that too (with an interpreter that runs one step at a time):

@snippet has_race

@proof decidable_of_both See the racing half of the proof in Lean

@proof post See Post's theorem in Lean

::: question
Why race the two recognizers, rather than running `r1` first and then `r2`?
- [ ] Racing is faster
  Speed isn't the issue. Think about what happens on a no-instance.
- [x] On a no-instance, `r1` runs forever, so we'd never get to `r2`
  Right. Racing makes sure the one that halts gets its turn, whichever it is. It's the same idea as dovetailing.
- [ ] Because `r1` and `r2` might both halt
  They can't both halt: every input is either a yes-instance or a no-instance, not both.
:::

::: question
In the race, could `r1` and `r2` both run forever on some input?
- [ ] Yes, on inputs that are neither yes nor no
  Every input is one or the other: `P(x)` is either true or false.
- [x] No: if `x` is a yes-instance `r1` halts, and otherwise `r2` does
  Right. Exactly one of them halts, on every input. That's what makes the race a decider.
:::

## The landscape 🗺️

Here's a map of all properties, according to what programs can do with them:

@figure landscape

::: question
Where does "`x` has even length" go on the map?
- [x] In the overlap: it's decidable, so it and its opposite are both recognizable
  Right. Every decidable property sits in the overlap, and Post's theorem says the overlap contains *only* decidable properties.
- [ ] In the left circle only
  It's decidable, so its opposite ("odd length") is recognizable too.
:::

::: question
Suppose some property `P` is recognizable but **not** decidable. What does Post's theorem tell you about its opposite, "not `P`"?
- [ ] It's decidable
  If "not `P`" were decidable, then so would `P` be (just flip the answer). But we assumed `P` isn't.
- [x] It's not even recognizable
  Exactly. If "not `P`" were recognizable, Post's theorem would make `P` decidable. This is the key move of the whole course: in chapter 6 we'll find a property ("halts") that's recognizable but not decidable, and conclude that its opposite ("loops") can't even be recognized.
- [ ] Nothing
  Post's theorem tells you a lot here. Try assuming "not `P`" is recognizable and see what follows.
:::

::: question
We saw that "`s` is provable in Evens" is recognizable (search for a proof). What about "`s` is provable" in *any* formal system whose proofs can be checked by a program?
- [x] Also recognizable: search through all possible proofs
  Right. As long as checking a proof always finishes, the same proof search works. Remember this for chapter 7: "provable" is always recognizable, and that's the property Gödel's theorem will exploit.
- [ ] Decidable
  The search halts when a proof exists, but runs forever when none does. That's recognizing, not deciding. (For weak systems like Evens it happens to be decidable, but not in general.)
- [ ] Neither
  The proof search recognizes it. The only question is whether we can do better.
:::

[[On to the halting problem!]]
