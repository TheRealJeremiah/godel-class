---
id: diagonal
title: The diagonal trick
subtitle: Cantor's escape from every list
emoji: ↘️
blurb: Georg Cantor found a way to build something that is guaranteed to be missing from any list. We prove his diagonal argument in Lean, then generalize it into Lawvere's fixed point theorem, the template for everything that follows.
---

Every proof in this course uses one trick. It was discovered by Georg Cantor in 1891, and it goes like this: **to build something that's missing from a list, make it disagree with item `n` at position `n`.** That's it! It sounds too simple to be powerful, but it's the engine behind Turing's halting problem and Gödel's incompleteness theorem.

[[Show me the trick]]

## Infinite lists of infinite things 📜

An infinite **bit-stream** is an infinite sequence of booleans: `true, false, false, true, ...`. In Lean, a bit-stream is just a function `Nat → Bool`: give it a position, and it gives you the bit there.

Now, an infinite *list* of bit-streams is a function `Nat → (Nat → Bool)`. Give it a row number `i`, and it gives you a whole stream, `table i`. Then `table i n` is the bit in row `i` at position `n`, like a spreadsheet that goes on forever to the right and downwards.

::: question
Here's a list of some bit-streams: row `i` is the stream whose bit at position `n` is `n % (i + 2) == 0`. Is *every* bit-stream in this list?
- [ ] Yes, it's infinite, so it has everything
  Infinite doesn't mean everything! For example, the stream that's `false` everywhere isn't in this list: every row has `true` at position `0`, since `0 % k == 0`.
- [x] No, some streams are missing
  Right. For example, every row starts with `true` (since `0 % k == 0`), so the all-`false` stream is missing.
:::

It's easy to miss a few streams. The real question is: **could some cleverer list include every single bit-stream?** Cantor's answer is no, and here's his trick. Play with the table below: it's the first few rows and columns of some list.

@figure diagonal-table

Look at the highlighted **diagonal**: the bit at row 0, position 0; row 1, position 1; and so on. Now flip every bit on the diagonal. That gives a new stream, `diag table`.

::: question
With the table as it starts out (before you click anything), what are the first three bits of `diag table`?
- [ ] `true, false, true`
  That's the diagonal itself, *before* flipping. `diag table` flips each diagonal bit.
- [x] `false, true, false`
  Right: the diagonal starts `true, false, true`, and flipping gives `false, true, false`.
- [ ] `false, false, false`
  Look at row 1: its diagonal bit (position 1) is `false`, so the flipped bit is `true`.
:::

::: question
Could `diag table` be row 3 of the table?
- [ ] Yes, if row 3 happens to match
  It can't happen to match. Look at position 3: `diag table` has the *flip* of row 3's bit at position 3.
- [x] No, it disagrees with row 3 at position 3
  Exactly. And the same goes for every row: `diag table` disagrees with row `n` at position `n`. So it isn't any row. Try clicking bits in the table to change it: whatever you do, the green row stays different from every row.
:::

## Cantor's theorem, in Lean ✓

Here's the diagonal in Lean. `!` is boolean negation, just like in JavaScript:

@snippet diag_def

And here's the proof that it's missing from the table:

@snippet cantor

Let's go through `diag_not_a_row`. We assume `h : table n = diag table`, and must derive `False`.

::: question
`h` says two *functions* are equal. What does `congrFun h n` give us?
- [ ] `table = diag`
  `congrFun` doesn't strip away arguments, it *adds* one. If two functions are equal, they agree on every input.
- [x] `table n n = diag table n`
  Right. If `table n` and `diag table` are the same function, then they return the same value at position `n`.
- [ ] `n = n`
  That's true but not useful! `congrFun h n` applies both sides of `h` to `n`.
:::

Then `simp [diag] at hn` unfolds `diag`, turning `hn` into `table n n = !(table n n)`.

::: question
Why does that finish the proof?
- [ ] Because `simp` can prove anything
  If only! `simp` just applies known rewrite rules. Here it knows a specific fact about booleans.
- [x] Because no boolean `b` equals `!b`, so `hn` is impossible
  Right. `simp` knows that `b = !b` is `False` for any `b : Bool`, so `hn` becomes `False` and the goal closes. Recognize it? It's the boolean version of the liar lemma, `¬ (P ↔ ¬ P)`!
- [ ] Because `table n n` is `false`
  We don't know what `table n n` is! It doesn't matter: whichever it is, it can't equal its own negation.
:::

Finally `cantor` packages it up: for every table, there's a stream `g` (namely `diag table`) that is different from every row.

::: question
A friend says: "Easy fix! Just add `diag table` to the top of the list as a new row 0, and shift everything else down." What happens?
- [ ] That fixes it: now every stream is listed
  The new list is another table, so Cantor's theorem applies to it too. Its *own* diagonal stream is missing.
- [x] The new table has a new diagonal, which is missing from it
  Right. The diagonal trick works against *any* table, including the patched one. You can never patch your way to a complete list. (Remember this! In chapters 5 and 7 we'll see the same thing with halting testers and formal systems.)
:::

## So what? 🤷

So there are "more" bit-streams than natural numbers: the streams can't be lined up and numbered 0, 1, 2, and so on. Mathematicians say the set of streams is **uncountable**.

::: question
In chapter 6 we'll prove that every program's source code can be given a number: program 0, program 1, and so on. Put that together with Cantor. Is there a bit-stream (a function `Nat → Bool`) that no program computes?
- [x] Yes: the programs can be numbered, but the streams can't
  Right. The programs that compute bit-streams can be listed, but no list contains every stream. So some streams aren't computed by any program. They're **uncomputable**. In chapter 5 we'll meet a specific one: the halting problem.
- [ ] No: with enough cleverness, any function can be programmed
  Cleverness can't beat counting! There are only as many programs as there are natural numbers, but there are more streams than that.
:::

## The trick, once and for all ♾️

Cantor's argument is so useful that it's worth stating in full generality. Here's a version from 1969, due to the category theorist William Lawvere:

@snippet lawvere

Here `e : A → A → B` is a table whose rows and columns are both indexed by `A`, with entries in `B`. The hypothesis `every_row` says that every function `A → B` shows up as some row. The conclusion is surprising: **every function `f : B → B` has a fixed point**, a value `b` with `f b = b`.

::: question
The proof picks out one special function to find in the table. Which one?
- [ ] `fun x => e x x`, the diagonal
  Close! It's the diagonal, but with `f` applied, just like Cantor applied `!`.
- [x] `fun x => f (e x x)`, the diagonal with `f` applied
  Right. It's exactly Cantor's `diag`, with `!` generalized to any `f`.
- [ ] `f` itself
  `f` has type `B → B`, but the rows of the table have type `A → B`.
:::

Say that function is row `a`. Then `e a = fun x => f (e x x)`. Now evaluate both sides at `x = a`, which is the diagonal entry of row `a`:

```lean
e a a = f (e a a)
```

So `e a a` is a fixed point of `f`! That's all `(congrFun ha a).symm` says.

::: question
Take `B = Bool` and `f = fun b => !b`. What does Lawvere's theorem tell us?
- [ ] That `not` has a fixed point
  Only *if* the hypothesis holds. And `not` has no fixed point (no `b` has `!b = b`). So the hypothesis must fail...
- [x] That no table `e : A → A → Bool` can contain every function `A → Bool` as a row
  Right. That's Cantor's theorem again, for any `A` at all. It's what `cantor_again` proves:
- [ ] Nothing, because `Bool` is too small
  It tells us a lot! `not` has no fixed point, so the hypothesis of Lawvere's theorem must fail.
:::

@snippet cantor_again

::: question
What if we take `B = Prop` and `f = Not`? Then a fixed point would be a statement `P` with `¬ P = P`. What does that remind you of?
- [x] The liar, `P ↔ ¬ P`, which `no_liar` rules out
  Right. So no table `A → A → Prop` contains every property of `A`s. In other words, you can't list all properties. Lawvere's theorem unifies the liar paradox and Cantor's diagonal argument, and much else besides.
- [ ] Nothing: `Prop` isn't a type of values
  In Lean, `Prop` is a type like any other. That's what lets us talk about lists of properties.
:::

::: unlock Diagonalization
Given a table (rows indexed like columns), build a new row whose entry at position `n` is the *opposite* of row `n`'s entry at position `n`. That new row differs from every row, so it isn't in the table. Equivalently (Lawvere): if a table has every row, then every `f` has a fixed point. So if some `f` has no fixed point (like `not`), the table can't have every row.
:::

## Coming up: the diagonal meets programs 🔮

Here's where this is heading. Imagine an infinite table where row `p` is a program, column `x` is an input, and entry `(p, x)` says whether program `p` halts on input `x`. Since every program is also a string, the columns can be programs too. That makes it a square table, just like Cantor's.

::: question
Suppose we have a program that *computes* the entries of that table. Then we could write a program that runs along the diagonal and does the opposite: on input `p`, it loops forever if `p` halts on `p`, and halts otherwise. Which row of the table is that program?
- [ ] It's the diagonal row
  The diagonal isn't a row: it's a path through the table. And our new program *disagrees* with the diagonal.
- [x] It can't be any row, but it's a program, so it must be a row. Contradiction!
  That's exactly Turing's argument. The flipped diagonal can't be a row, yet it's a program, and every program is a row. So the assumption, that some program computes the halting table, must be wrong. We'll do this properly in chapter 5.
- [ ] It's row 0
  Whichever row we pick, the new program disagrees with it on the diagonal.
:::

Before we can do that, we need to say precisely what a "program" is in Lean, and what it means for one to "halt". That's the next chapter.

[[On to programs!]]
