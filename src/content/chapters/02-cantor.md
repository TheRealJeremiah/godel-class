---
id: cantor
title: Cantor's diagonal
subtitle: How to escape from any list
emoji: ↘️
blurb: Georg Cantor found a way to build something guaranteed to be missing from any list. This "diagonal argument" is the engine behind the halting problem and Gödel's theorem, so we take it slowly.
---

Every big theorem in this course uses a single trick, discovered by Georg Cantor in 1891:

> To build something that's missing from a list, make it disagree with item number `n` at position `n`.

It sounds almost too simple to matter. In this chapter we'll see exactly how it works, and why it's so powerful.

[[Show me the trick]]

## Infinite lists of infinite streams 📜

A **bit-stream** is an infinite sequence of bits, like `1, 0, 0, 1, 1, 0, ...`, going on forever. You can think of a bit-stream as a function from positions to bits: give it a position `n` (0, 1, 2, ...), and it tells you the bit there. In JavaScript:

```js
const alternating = n => n % 2 === 0;   // true, false, true, false, ...
const allFalse    = n => false;         // false, false, false, ...
```

Now imagine an infinite **list** of bit-streams: stream number 0, stream number 1, stream number 2, and so on forever. Picture it as a table that goes on forever to the right and downwards. `table(i)(n)` is the bit in row `i`, at position `n`.

::: question
Here's an infinite list: row `i` is the stream whose bit at position `n` is `n % (i + 2) === 0`. Is *every* possible bit-stream somewhere in this list?
- [ ] Yes: it's an infinite list, so it contains everything
  Infinite isn't the same as everything! Look at position 0 of each row.
- [x] No: for example, the all-`false` stream is missing
  Right. Every row has `true` at position 0 (since `0 % k === 0`), so the stream that's `false` everywhere isn't any row.
:::

That list was easy to beat. The real question is whether some *cleverer* list could contain every stream. Cantor's answer is **no**, and his argument works against any list at all. Play with this one:

@figure diagonal-table

Look at the highlighted **diagonal**: row 0 at position 0, row 1 at position 1, row 2 at position 2, and so on. Now build a new stream, `diag`, by *flipping* each diagonal bit:

```js
const diag = n => !table(n)(n);   // at position n, the opposite of row n
```

::: question
With the table as it starts (before you click anything), what are the first three bits of `diag`?
- [ ] `true, false, true`
  That's the diagonal itself. `diag` flips each of those bits.
- [x] `false, true, false`
  Right: the diagonal starts `true, false, true`, and flipping gives `false, true, false`.
- [ ] `false, false, false`
  Check row 1: its bit at position 1 is `false`, so `diag` has `true` there.
:::

::: question
Could `diag` be the same as row 3?
- [ ] Yes, if row 3 happens to match
  It can't "happen to match". Look at position 3 specifically.
- [x] No: at position 3, `diag` has the opposite of row 3's bit
  Exactly. And that argument works for every row: `diag` differs from row `n` at position `n`. Click around in the table: whatever you do, `diag` never equals any row.
:::

## The theorem 📐

::: theorem Cantor's theorem
For any infinite list of bit-streams, there is a bit-stream that is not in the list.
:::

**Proof.** Given the list `table`, let `diag` be the stream whose bit at position `n` is the opposite of `table(n)(n)`. Suppose `diag` were row `k` of the list. Then look at position `k`:

* `diag` at position `k` is the opposite of `table(k)(k)`, by the definition of `diag`.
* But `diag` *is* row `k`, so `diag` at position `k` is `table(k)(k)`.

So `table(k)(k)` equals its own opposite, which is impossible for a bit. So `diag` isn't row `k`, for any `k`. ∎

::: question
Where did the contradiction come from?
- [ ] From the list being infinite
  The argument never uses infinity in any essential way. It even works for finite tables, as we'll see next chapter.
- [x] From a bit equalling its own opposite: `b = !b`
  Right. That's the liar lemma in bit form. No bit is equal to its own flip, just as no statement is equivalent to its own negation.
- [ ] From `diag` being defined incorrectly
  `diag` is a perfectly good stream. What's impossible is for it to appear in the list.
:::

::: question
Why flip the *diagonal*? Wouldn't it be simpler to take row 0 and flip every bit in it?
- [ ] Yes: flipped row 0 is also missing from the list
  Flipped row 0 certainly differs from row 0. But what about row 1, or row 17? Nothing stops flipped row 0 from appearing further down the list.
- [x] No: flipped row 0 differs from row 0, but it might equal some other row
  Right. The diagonal is chosen so the new stream differs from *every* row at once: from row `n`, at position `n`. It uses one position per row, so no row is left unchecked.
:::

::: question
Here's a variation: `d(n) = !table(n)(n + 1)`. That flips the entry just to the right of the diagonal. Is `d` also missing from the list?
- [x] Yes: `d` differs from row `n` at position `n + 1`
  Right! The diagonal isn't magic. Any rule that picks a different position for each row, and flips the entry there, produces a stream that differs from every row. The diagonal is just the simplest choice.
- [ ] No: only the exact diagonal works
  Check row `n`: `d` has the opposite of `table(n)(n + 1)` at position `n + 1`. So `d` isn't row `n`, for any `n`.
:::

Here is the Lean version. The definition of `diag` is exactly the JavaScript one:

@snippet diag_def

@proof cantor See Cantor's theorem in Lean

## You can't patch the list 🩹

::: question
A friend says: "Easy fix! Just add `diag` to the list as a new row 0, and shift every other row down by one." Does the new list contain every stream?
- [ ] Yes: the missing stream is now in the list
  That particular stream is now in the list. But the new list is still a list...
- [x] No: the new list has a new diagonal, and its flip is missing
  Right. Cantor's argument works on *any* list, including the patched one. Patching creates a new list with a new missing stream. We'll see this "you can't patch it" story again with halting testers (chapter 6) and formal systems (chapters 8 and 9).
:::

## So what? 🤷

Cantor's theorem says there are, in a precise sense, *more* bit-streams than there are whole numbers: they can't all be given numbers 0, 1, 2, .... Mathematicians say the bit-streams are **uncountable**.

Now for the connection to programs. A program is a finite string of characters, and in chapter 7 we'll see how to list every possible string as string 0, string 1, string 2, .... So programs *can* be numbered.

::: question
Programs can be numbered, and bit-streams can't. What follows?
- [x] Some bit-streams aren't computed by any program
  Right. List all the programs that compute bit-streams. By Cantor, some stream is missing from that list, so no program computes it. It's **uncomputable**. In chapter 6 we'll meet a famous, useful example: the halting problem.
- [ ] Every bit-stream is computed by some program
  There are too many streams and too few programs. Some streams must be left over.
- [ ] Nothing: the two facts are unrelated
  They're closely related! A list of programs gives a list of streams, and Cantor says that list can't be complete.
:::

::: question
Which step of Cantor's argument would you have to change to show that *real numbers* between 0 and 1 can't be listed?
- [x] Write each number in binary, so its digits are a bit-stream, and flip the diagonal digit as before
  Right. That's Cantor's original argument about real numbers. (There's a small wrinkle, since some numbers have two binary expansions, like `0.0111...` and `0.1000...`. It can be fixed, for example by working in base 10 and avoiding the digits 0 and 9.)
- [ ] It can't be done: real numbers can be listed
  They can't! A number between 0 and 1 is essentially an infinite sequence of digits, so the diagonal argument applies.
:::

::: question
Call a stream **eventually zero** if, after some point, all its bits are `false`. Each such stream is described by a finite bit string, so they *can* all be listed. Why doesn't Cantor's argument contradict this?
- [ ] It does: this list must be missing an eventually-zero stream
  The flipped diagonal is missing from the list. But is it an eventually-zero stream?
- [x] The flipped diagonal of that list isn't eventually zero, so it's allowed to be missing
  Right. The flipped diagonal is missing from the list, and the list contains every eventually-zero stream, so the flipped diagonal can't be eventually zero. No contradiction. Cantor's argument only shows that the *new* stream is missing. That's a problem only if the new stream is the kind of thing the list promised to contain.
:::

::: unlock The diagonal argument
Given any table whose rows and columns are numbered the same way, flip the diagonal. The result disagrees with row `n` at position `n`, so it isn't a row. So no list of bit-streams is complete, and patching doesn't help.
:::

## Coming up 🔮

In the next chapter we'll zoom out and ask: what *exactly* made that argument work? The answer, discovered by William Lawvere in 1969, turns Cantor's trick into a general-purpose tool. With it, the liar, Cantor, Russell's paradox, the halting problem and Gödel's theorem all turn out to be the same argument in different costumes.

[[Show me the general trick]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise not-in-list Escape the list
Write `missing(table)`: given any infinite list of bit-streams, return a stream that isn't in it. (A stream is a function from positions to `true` or `false`.) Your function will be tried on several different tables.
--- hint
You need to disagree with row 0 somewhere, with row 1 somewhere, and so on forever. One position per row is enough, as long as each row gets its own position.
--- hint
Cantor's choice: disagree with row `n` at position `n`.
--- solution
```js
function missing(table) {
  return (n) => !table(n)(n)
}
```

This is Cantor's `diag`. Other answers work too: `(n) => !table(n)(n + 1)` disagrees with row `n` at position `n + 1`. But flipping a single row, or returning a fixed stream, fails: some table contains it.
:::

::: exercise cantor-order Prove Cantor's theorem
Put together a proof that no infinite list contains every bit-stream. Two of the steps don't belong.
--- hint
Build `diag` first, then suppose it's in the list as row `k`, and look at position `k` in two different ways.
--- solution
The two views of position `k` (step "since `diag` is row `k`" and step "by the definition of `diag`") can come in either order; together they say a bit equals its own flip. The red herrings: "infinite" doesn't mean "contains everything", and position 0 only rules out row 0.
:::
