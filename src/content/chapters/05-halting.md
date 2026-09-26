---
id: halting
title: The halting problem
subtitle: Turing's troll, machine-checked
emoji: 🛑
blurb: Alan Turing showed in 1936 that no program can decide whether programs halt. We prove it in Lean using a diagonal "troll" program, and see exactly which abilities of a computer the proof needs.
---

Wouldn't it be nice if your editor could warn you about every infinite loop? It would need a function `halts(code, input)` that always answers correctly. In 1936, Alan Turing proved that no such function can exist, *in any programming language*. In this chapter, we'll prove it in Lean, for every `Computer` at once.

[[Let's troll a tester]]

## Programs that read themselves 🪞

Since programs take strings as input, and programs *are* strings, we can run a program on its own source code. Consider this JavaScript function:

```js
function f(s) {
  if (s.includes("froot")) while (true) {}
}
```

::: question
What does `f` do when given its own source code as input?
- [ ] It halts
  Look at the source code of `f`: it contains the string `"froot"`!
- [x] It loops forever
  Right. Its own source contains `"froot"` (inside the `includes` call), so it enters the infinite loop. You could replace `"froot"` with any string and the same would happen.
:::

Self-application gives us the **diagonal** of the halting table from chapter 3: program `x` on input `x`. Here's that property in Lean:

@snippet halts_on_self

A halting tester for this special case would be a program `d` with `M.Decides d M.HaltsOnSelf`: on every input `x`, `d` returns `true` if `x` halts on `x`, and `false` if it doesn't.

::: question
Why focus on programs run on *themselves*? Wouldn't a general tester `halts(p, x)` be more natural?
- [ ] Because self-application is the only interesting case
  Most interesting programs don't read their own source! Self-application is chosen for a different reason.
- [x] It's the diagonal: it lets us use Cantor's trick. And a general tester would give us one for this case anyway
  Right. If you had a general `halts(p, x)`, you could get `haltsOnSelf(x)` by calling `halts(x, x)`. So proving that no program decides `HaltsOnSelf` shows that no *general* tester exists either.
- [ ] Because programs can only take themselves as input
  Programs can take any string as input. We choose self-application because it's the diagonal.
:::

## Turing's troll 👺

Now suppose someone hands us a program `d` and claims it decides `HaltsOnSelf`. Turing's idea is to build a **troll**: a program that asks `d` about itself, then does the opposite.

```js
function troll(x) {
  if (d(x)) {
    while (true) {}   // d says "x halts on x": so loop forever
  }
  return true;        // d says "x loops on x": so halt
}
```

Any real programming language lets you write this. So we assume our `Computer` can too, as a named ability:

@snippet has_troll

`HasTroll` says there's a way to build `troll d` from any program `d`, which behaves as the JavaScript says: if `d` returns `true` on `x`, then the troll loops on `x`, and if `d` returns `false`, then the troll halts.

::: question
What if `d` itself loops forever on `x`? What does the troll do on `x`?
- [ ] It halts
  The troll's first move is to call `d(x)`. If that never returns, the troll never gets past the `if`.
- [x] It loops forever (though `HasTroll` doesn't even promise that)
  In JavaScript, the call `d(x)` never returns, so the troll is stuck forever. `HasTroll` doesn't say anything about this case, and it doesn't need to: a genuine tester `d` never loops.
- [ ] It returns `false`
  The troll only ever returns `true`, and only when `d` returns `false`.
:::

## Trolling the troll 👺🪞

Now the crucial move: **run the troll on its own source code.** Let `t = troll d`. Does `t` halt on `t`?

@figure halting-table

::: question
Suppose `t` halts on `t`. Since `d` is a correct tester, what does `d` return on `t`?
- [x] `true`
  Right: `d` correctly reports that `t` halts on `t`.
- [ ] `false`
  `d` is assumed to be a correct tester, and `t` does halt on `t` in this case.
- [ ] It loops
  A correct tester always returns an answer.
:::

::: question
And then, reading the source of `troll`, what does `t` actually do on `t`?
- [ ] It halts, as we supposed
  Look at the troll again: when `d` says `true`, the troll enters `while (true) {}`.
- [x] It loops forever, contradicting our supposition
  Exactly. If `t` halts on `t`, then `d` says so, and then `t` loops on `t`. Contradiction!
:::

::: question
So `t` doesn't halt on `t`. Then `d` returns `false` on `t`. What does `t` do on `t`?
- [x] It halts, another contradiction!
  Right. When `d` says `false`, the troll returns `true`, so it halts. Either way we get a contradiction. The only way out: the program `d` can't exist.
- [ ] It loops, which is fine
  Look at the troll's code: when `d` says `false`, it skips the loop and returns `true`.
:::

## The proof in Lean ✓

Here's exactly that argument, checked by Lean:

@snippet halting_problem

The structure should look familiar: it's a `by_cases` on the question "does the troll halt on itself?", with a contradiction in each case.

::: question
In the first case, `h : M.HaltsOnSelf t` and we derive `loops : M.run t t = .loops`. Why does `exact h loops` finish the proof?
- [ ] Because `h` and `loops` are the same thing
  They're opposites! One says the troll halts on itself, the other says it loops.
- [x] Because `HaltsOnSelf t` means `M.run t t ≠ .loops`, which is a function that turns `loops` into `False`
  Right. `≠` is `¬ (· = ·)`, and `¬` is a function into `False`. So `h loops : False`. Nice, this is the chapter 1 trick: "not is a function".
- [ ] Because `exact` can prove anything
  `exact` only accepts a term of exactly the right type. Here, `h loops` really does have type `False`.
:::

::: question
In the second case, where does `(hd t).2 h` come from?
- [ ] It's the troll's specification
  The troll's spec is `T.halts_if_no`. `hd` is something else.
- [x] From `d` being a correct tester: since `t` doesn't halt on itself, `d` must return `false` on `t`
  Right. `hd t` is a pair: `.1` covers the case where the property holds, and `.2` covers the case where it doesn't. Feeding `.2` the fact `h : ¬ M.HaltsOnSelf t` gives `M.run d t = .returns false`.
- [ ] It's an axiom of Lean
  No axioms here. It's our hypothesis `hd : M.Decides d M.HaltsOnSelf`, applied to `t`.
:::

We can also package the argument to make the liar hiding inside it explicit:

@snippet troll_iff

::: question
Given `troll_is_a_liar`, which theorem from chapter 2 immediately gives a contradiction?
- [ ] `and_swap`
  `and_swap` flips an `∧`. We need something that refutes `X ↔ ¬ X`.
- [x] `no_liar`
  Right! `no_liar (M.HaltsOnSelf (T.troll d))` refutes exactly this. The troll *is* a liar sentence, made real as a program: "I halt if and only if I don't halt". Here's the whole theorem again as a one-liner:

  @snippet halting_via_liar
- [ ] `cantor`
  Cantor's theorem is about tables of bit-streams. Close in spirit, but here we have a literal `X ↔ ¬ X`, which is `no_liar`'s job.
:::

::: unlock The halting problem (Turing, 1936)
For any computer that can build trolls, no program decides whether programs halt on their own source code. Proof: given a tester `d`, build `troll d` and run it on itself. It halts if and only if it doesn't.
:::

## Poking at the proof 🔧

::: question
Here's a patched tester, `d2`, which fixes the bug that `troll d` exposed:

```js
function d2(x) {
  if (x === trollSourceFor(d)) return !d(x);  // patch the known bug
  return d(x);
}
```
Is `d2` a correct tester?
- [ ] Yes, the one bug is patched
  The bug that `troll d` found is patched, but `d2` is a new program with a new troll, `troll d2`, that exposes a new bug.
- [x] No: `troll d2` will expose a new bug
  Right. The theorem applies to *every* program, including `d2`. Patching one counterexample just creates another. (Sound familiar? It's the "add `diag` to the list" fix from chapter 3.)
:::

::: question
Does the theorem mean we can't prove that any *particular* program halts or loops?
- [ ] Yes: halting is undecidable, so we can never know
  We proved plenty of halting facts in chapter 4! Specific programs can be analyzed just fine.
- [x] No: it only rules out a *single* program that answers correctly for *every* input
  Right. For any particular program we may well be able to figure it out, as we did for the toy machines. What's impossible is one mechanical tester that always works.
:::

Lean itself is a programming language, and every Lean function must provably terminate (that's why Lean sometimes asks you for a termination proof). So in Lean-the-language, every program halts!

::: question
In a language where *every* program halts on every input, is there a program that decides `HaltsOnSelf`?
- [x] Yes: `fun _ => true`
  Right! If everything halts, "always say yes" is a perfect tester. So there's no contradiction, which means such a language **can't build trolls**. Indeed, a troll must loop forever sometimes, and nothing in this language can. That's why we made `HasTroll` an explicit assumption: the theorem really does depend on it.
- [ ] No: the halting problem applies to every language
  Only to languages with the troll-building ability. In a language where everything halts, the tester that always says `true` is perfectly correct.
:::

## Which axioms did we use? ⚖️

Lean can report every axiom that a theorem depends on. For `halting_problem`, it reports `propext`, `Classical.choice`, and `Quot.sound`: Lean's standard classical axioms. They sneak in through `by_cases`, which splits on whether `t` halts on itself without knowing which case is actually true.

::: question
Why does the proof need classical logic (`by_cases`) at all?
- [x] Because we can't *compute* whether the troll halts on itself, so we split on it abstractly
  Right, and that's rather poetic: the proof reasons by cases on the very question it shows is undecidable. But it's not *necessary*: the one-liner `halting_problem'` goes through `no_liar` instead, and Lean reports that it uses **no axioms at all**. The `by_cases` version just reads more naturally.
- [ ] Because Lean requires classical logic for every proof
  Plenty of Lean proofs use no axioms at all. You'll see some very important ones in chapter 8!
:::

[[Halt! On to formal systems]]
