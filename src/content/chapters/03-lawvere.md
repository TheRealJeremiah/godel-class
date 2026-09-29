---
id: lawvere
title: One trick, many disguises
subtitle: Lawvere's fixed-point theorem, slowly
emoji: 🎭
blurb: What exactly made Cantor's argument work? We take it apart into two ingredients, rebuild it as one general theorem, and then watch the liar, Russell's paradox and the barber fall out as special cases.
---

Cantor's argument felt like a clever one-off. In 1969, the mathematician William Lawvere noticed that it's really a general principle, and that many famous paradoxes and impossibility results are the *same* argument wearing different clothes. In this chapter we'll build up his theorem one piece at a time. No step is hard on its own; the trick is seeing how they fit together.

[[Let's take Cantor apart]]

## Ingredient 1: fixed points 📌

A **fixed point** of a function `f` is an input that `f` leaves unchanged: a value `x` with `f(x) === x`. Some functions have several fixed points, some have one, and some have none. Try a few:

@figure fixed-points

::: question
What are the fixed points of `x => x * x`, on the whole numbers?
- [ ] Just `0`
  Try `x = 1` as well: `1 * 1 === 1`.
- [x] `0` and `1`
  Right: `0 * 0 === 0` and `1 * 1 === 1`. Every other whole number gets bigger when squared.
- [ ] None
  Squaring leaves some numbers unchanged. Try the small ones!
:::

::: question
Which function on whole numbers has **no** fixed point?
- [x] `x => x + 1`
  Right. Adding 1 always changes the number, so nothing stays put.
- [ ] `x => x * 1`
  Multiplying by 1 leaves *every* number unchanged, so every number is a fixed point.
- [ ] `x => 10 - x`
  `x = 5` gives `10 - 5 = 5`, so 5 is a fixed point.
:::

The star of the show is the **flip** function on bits, `b => !b`. It has no fixed point, since flipping always changes a bit.

::: question
There are exactly four functions from bits to bits: `b => b`, `b => true`, `b => false`, and `b => !b`. How many of them have no fixed point?
- [x] Just one: `b => !b`
  Right. `b => b` fixes both bits, `b => true` fixes `true`, and `b => false` fixes `false`. Only flipping moves everything. Keep that in mind: flipping is special.
- [ ] Two: `b => !b` and `b => true`
  `b => true` sends `true` to `true`, so `true` is a fixed point.
- [ ] All four
  `b => b` leaves both bits unchanged: it has two fixed points.
:::

## Ingredient 2: a table with a diagonal 🧮

The second ingredient is a table whose rows and columns are labelled by the **same** things. In Cantor's case, rows are numbered 0, 1, 2, ... and so are positions. That's what gives the table a **diagonal**: the entries where the row label equals the column label.

::: question
Why does it matter that rows and columns are labelled by the same things?
- [x] So that "row `n`, column `n`" makes sense: that's the diagonal
  Right. If rows were labelled by colours and columns by numbers, there'd be no "row red, column red" entry, and no diagonal to flip.
- [ ] So the table is finite
  Cantor's table is infinite in both directions. What matters is that each row label is also a column label.
:::

## Cantor, rewritten 🔁

Now let's retell Cantor's argument using these two ingredients. Suppose, hoping for a contradiction, that the table contains **every** stream as a row. Then in particular it contains `diag`, the flipped diagonal, as some row `k`. Look at the entry in row `k`, column `k`:

* It equals `diag(k)`, because row `k` *is* `diag`.
* And `diag(k)` is `!table(k)(k)`, by the definition of `diag`.

So the entry `b = table(k)(k)` satisfies `b === !b`. In other words, **`b` is a fixed point of the flip function.**

::: question
So Cantor's argument really shows: "if a table contained every row, then the flip function would have a fixed point". Why does that prove Cantor's theorem?
- [x] Because flip has no fixed point, so no table can contain every row
  Exactly. The argument produces a fixed point of flip out of a complete table. Flip has no fixed point, so there's no complete table.
- [ ] Because fixed points are always contradictions
  Fixed points are perfectly normal: `x => x * x` has two. The contradiction comes from flip in particular having none.
:::

That's Lawvere's insight. Cantor's argument is really about fixed points, and the only thing special about "flip" is that it has none.

## Try it on a small table 🔬

Infinite tables are hard to picture, so let's shrink everything. Take a table with 3 rows and 3 columns of bits. A row is then just 3 bits, so there are `2 × 2 × 2 = 8` possible rows.

@figure lawvere-finite

::: question
Can a 3-row table contain all 8 possible rows?
- [ ] Yes, if you choose the rows cleverly
  Three rows can hold at most three different rows. There are eight to fit in.
- [x] No: there are more possible rows than rows in the table
  Right. For finite tables you could just count. But the diagonal gives you more than a count: it points at a *specific* missing row. And unlike counting, it still works when both are infinite.
:::

::: question
Play with the table. The flipped diagonal is always marked "missing". Why can't it ever be one of the table's rows?
- [ ] Because it's always `000`
  It changes as you edit the table. Try it!
- [x] Because it differs from row 0 in column 0, from row 1 in column 1, and from row 2 in column 2
  Right. It disagrees with each row at that row's own diagonal position, so it can't equal any of them. Same argument, just finite.
:::

## The general theorem 🎯

Now let's say exactly what the argument needs. We need:

* a set `A` of labels, used for both rows and columns (for Cantor: the whole numbers);
* a set `B` of possible entries (for Cantor: the bits `true`/`false`);
* a table `e`, where `e(a)(x)` is the entry in row `a`, column `x`.

The table **has every row** if every function from `A` to `B` shows up as some row.

::: theorem Lawvere's fixed-point theorem
If a table has every row, then every function `f` from `B` to `B` has a fixed point.
:::

**Proof.** In three steps. In JavaScript-flavoured pseudocode:

```js
const d = x => f(e(x)(x));  // 1. f along the diagonal
const a = rowOf(d);          // 2. d is some row a
const b = e(a)(a);           // 3. f(b) === b
```

1. Build a new row `d`: at column `x`, take the diagonal entry `e(x)(x)` and apply `f` to it. (For Cantor, `f` is flip, so `d` is exactly `diag`.)
2. By assumption, the table has every row, so `d` is row `a` for some label `a`.
3. Look at row `a`, column `a`. Since row `a` is `d`, the entry `e(a)(a)` equals `d(a)`, which is `f(e(a)(a))` by step 1. So `b = e(a)(a)` satisfies `f(b) = b`. ∎

@proof lawvere See Lawvere's theorem in Lean

::: question
Which step uses the assumption that the table has every row?
- [ ] Step 1
  Step 1 builds `d` from any table at all; it doesn't need any assumption.
- [x] Step 2
  Right. The assumption is what guarantees `d` appears as some row `a`. Without it, `d` might simply be missing, and that's exactly what happens in Cantor's case.
- [ ] Step 3
  Step 3 uses the *result* of step 2 (that `d` is row `a`), but the assumption itself is used in step 2.
:::

::: question
In step 3, why do we look at column `a` in particular?
- [ ] Any column would do
  At a random column `x`, we'd only learn `e(a)(x) = f(e(x)(x))`, which mixes two different entries. That doesn't give a fixed point.
- [x] Because it's the one place where row label and column label are the same, so both sides talk about the same entry
  Right. On the diagonal, `e(a)(a)` appears on both sides of the equation. That's what turns "row `a` is `d`" into "some entry is a fixed point of `f`". It's the self-reference at the heart of every diagonal argument.
:::

::: question
Here's the theorem used "backwards": if some `f` from `B` to `B` has **no** fixed point, what can we conclude?
- [x] No table with entries in `B` has every row
  Right. That's the contrapositive, and it's how we'll always use the theorem: find an `f` with no fixed point, and conclude that no table can be complete.
- [ ] Every table with entries in `B` has every row
  The theorem only goes one way. A missing fixed point rules tables *out*; it never rules them in.
- [ ] `B` must be empty
  `B` can be anything. It's the function `f` that lacks a fixed point.
:::

## Instance 1: Cantor, for any labels 🔢

Take `B` to be the bits and `f` to be flip. Flip has no fixed point, so:

> For **any** set of labels `A`, no table can list every function from `A` to bits.

For `A` = the whole numbers, that's Cantor's theorem. In Lean, this is a two-line consequence of Lawvere's theorem:

@proof cantor_again See Cantor's theorem, derived from Lawvere's, in Lean

::: question
What if `A` has just 3 elements, as in the small table above?
- [x] It says 3 rows can't hold all 8 functions from `A` to bits, which we saw directly
  Right. The theorem covers finite and infinite tables alike.
- [ ] The theorem doesn't apply to finite sets
  Nothing in the proof needed `A` to be infinite.
:::

## Instance 2: the liar and Russell's paradox 🗣️

Now take `B` to be *statements*, and `f` to be "not". A fixed point of "not" would be a statement `P` with `P` equivalent to `¬P`: a liar! The liar lemma from chapter 1 says there's no such statement. So "not" has no fixed point, and Lawvere gives:

> For any set `A`, no table can list every **property** of `A`s (where a property says, of each `a`, some statement about it).

Here's a famous instance. In 1901, Bertrand Russell considered set theory as it was then understood, where every property was supposed to define a set: "the set of all `x` with property `P`". Make a table whose rows and columns are both sets, where the entry in row `a`, column `x` is the statement "`x` is a member of `a`".

::: question
If "every property defines a set" were true, which Lawvere assumption would hold?
- [x] The table has every row: every property is "being a member of" some set
  Right. The row for set `a` is the property "is a member of `a`". Saying every property defines a set means every property appears as a row. Lawvere says that's impossible.
- [ ] "Not" would have a fixed point
  That's the *conclusion* Lawvere would draw from a complete table. The assumption is about the table having every row.
:::

::: question
Follow Lawvere's recipe: step 1 applies "not" along the diagonal. What property does that give?
- [ ] "`x` is a member of `x`"
  That's the diagonal itself. Step 1 applies `f` ("not") to it.
- [x] "`x` is **not** a member of itself"
  Right. That's Russell's famous property. If it defined a set `R`, then step 3 looks at "is `R` a member of `R`?", and gets: `R ∈ R` if and only if `R ∉ R`. A liar!
- [ ] "`x` is a member of every set"
  Step 1 only ever looks at the diagonal entry "`x` is a member of `x`", and applies `f` to it.
:::

@proof no_property_list See the "no list of all properties" theorem in Lean

::: question
The barber from chapter 1 is the same argument. What plays the role of the table entry in row `a`, column `x`?
- [x] "`a` shaves `x`"
  Right. Rows and columns are villagers. The barber's rule says their row equals the flipped diagonal ("shaves `x` exactly when `x` doesn't shave `x`"). Looking at the barber's own column gives the liar, so no such barber exists.
- [ ] "`x` is the barber"
  The entry should depend on both the row villager and the column villager. What relationship does the story talk about?
:::

::: aside Mathematicians' fix for Russell's paradox
Russell's paradox broke the early foundations of set theory. Modern set theory (ZFC, which we'll meet later) avoids it by *not* letting every property define a set. You can only carve a set out of an existing set, as in "the members of `S` with property `P`". Lawvere's theorem shows that some such restriction is unavoidable.
:::

## Instance 3: when nothing goes wrong 😌

Lawvere's theorem only gives a contradiction when some `f` has no fixed point. Let's check an instance where that doesn't happen.

::: question
Suppose `B` has just one possible value, say the entry `"ok"`. Then there's only one function from `A` to `B`: the one that says `"ok"` everywhere. Can a table have every row?
- [x] Yes: every row is the all-`"ok"` row, and that's the only function there is
  Right. And Lawvere's conclusion is also fine: the only `f` from `B` to `B` sends `"ok"` to `"ok"`, which is a fixed point. No contradiction, because every `f` has a fixed point.
- [ ] No: Lawvere's theorem rules it out
  Lawvere only rules out complete tables when some `f` has no fixed point. With a single possible entry, every `f` fixes it.
:::

The lesson: the diagonal argument is powered by a **fixed-point-free** function like flip or "not". Without one, there's nothing to contradict.

::: aside Using the theorem forwards: quines
Read forwards, Lawvere's theorem *produces* fixed points: if the table does have every row, a fixed point exists. There's a famous computational version of this. For programs, a suitable "table" does have every row, and the fixed points it produces are programs that can refer to their own source code. That's why **quines** (programs that print their own source) exist in every mainstream language. Gödel's self-referential sentence works the same way; we'll build our own version in chapter 9, using a simpler trick.
:::

::: unlock Lawvere's fixed-point theorem
Take a table whose rows and columns share labels. If it has every possible row, then every function on the entries has a fixed point: apply the function along the diagonal, find that row, and look at its diagonal entry. So if some function on the entries has **no** fixed point (flipping a bit, negating a statement), no such table can have every row.
:::

## Preview: programs in the table 🔮

Here's how this will play out for programs. Make a table whose rows are programs and whose columns are inputs. Since programs are just strings, the inputs can be programs too, so rows and columns share labels. The entry in row `p`, column `x` records whether program `p` **halts** when given input `x`.

::: question
Suppose some program could compute this table's entries. Then we could write a program that, on input `x`, loops forever if `x` halts on `x`, and halts otherwise. That's "flip" applied along the diagonal. What goes wrong?
- [x] That program is itself a row, and at its own diagonal entry it halts exactly when it doesn't
  Right. It's Lawvere's step 3 exactly: the flipped-diagonal program is some row `t`, and entry `(t, t)` would be a fixed point of "flip halting", which doesn't exist. So no program computes the halting table. That's the **halting problem**, and it's chapter 6.
- [ ] Nothing: the program just loops
  The trouble is when you run it on *its own* source. That's the diagonal entry for its own row.
:::

To make this precise, we first need to say exactly what programs, halting, and "computing" a property mean. That's the next two chapters.

[[On to programs]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise lawvere-order Rebuild Lawvere's proof
Put together a proof of Lawvere's theorem: **if a table `e` has every row, then `f` has a fixed point.** Click steps to add them in order. Two of the available steps don't belong in this proof. Any order in which every step is justified by the steps before it will be accepted.
--- hint
A step can only use facts that come *before* it. Which steps don't depend on anything at all?
--- hint
The row `d` has to be defined before you can find it in the table, and you have to find it (as row `a`) before you can look at its diagonal entry `e(a)(a)`.
--- solution
One valid proof:

1. Suppose the table `e` has every row.
2. Define `d(x) = f(e(x)(x))`.
3. Because the table has every row, `d` is row `a` for some label `a`.
4. The diagonal entry of row `a`: `e(a)(a) = d(a)`, because row `a` is `d`.
5. By the definition of `d`, `d(a) = f(e(a)(a))`.
6. So `f(e(a)(a)) = e(a)(a)`: a fixed point.

Steps 1 and 2 can be swapped, and step 5 (unfolding `d` at `a`) can go anywhere after `d` is defined, as long as it's before the conclusion. That gives 7 valid orders in all. The two red herrings: looking at column 0 relates two different entries, and "`f` has no fixed point" is the Cantor direction, not this one.
:::

::: exercise russell-order Prove Russell's paradox
Show that not every property can define a set. This is Lawvere's argument with "not" as the function without a fixed point. Two of the steps don't belong.
--- hint
Follow Lawvere's recipe: take the diagonal ("`x` is a member of `x`"), flip it with "not", find its row (the set `R`), and look at the diagonal entry for `R`.
--- solution
The flipped property "`x` is not a member of itself" defines a set `R` (by the assumption), and asking whether `R ∈ R` gives a liar. The unflipped property leads nowhere, and `R` doesn't contain every set.
:::
