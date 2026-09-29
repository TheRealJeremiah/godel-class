---
id: halting
title: The halting problem
subtitle: Turing's troll, and why looping can't even be recognized
emoji: 🛑
blurb: Alan Turing showed in 1936 that no program can decide whether programs halt. We prove it with a diagonal "troll" program, then combine it with Post's theorem to reach the fact that Gödel's theorem really rests on - no program can even recognize the programs that loop.
---

Wouldn't it be nice if your editor could warn you about every infinite loop? It would need a program that looks at any code and correctly answers "does this halt?". In 1936, Alan Turing proved that no such program can exist, in *any* programming language. It's the diagonal argument from chapter 3, aimed at programs.

[[Let's troll a tester]]

## Programs that read themselves 🪞

Programs take strings as input, and programs *are* strings. So we can run a program on its own source code. For example:

```js
function f(s) {
  if (s.includes("froot")) while (true) {}
}
```

::: question
What does `f` do when given its own source code as input?
- [ ] It halts
  Look closely at the source code of `f`. Does it contain `"froot"`?
- [x] It loops forever
  Right. Its own source contains the string `"froot"` (inside the `includes` call), so it enters the infinite loop.
:::

Running a program on itself is exactly the **diagonal** of the table from the end of chapter 3: row `x`, column `x`. So we'll focus on this property:

@snippet halts_on_self

::: theorem The halting problem (Turing, 1936)
No program decides, for every program `x`, whether `x` halts when run on its own source code.
:::

::: question
Why is it enough to show there's no tester for programs run on *themselves*? Wouldn't a general tester `halts(p, x)` be more useful?
- [x] Because a general tester would give a self-tester, just by calling `halts(x, x)`. So if self-testing is impossible, general testing is too
  Right. The special case is easier to argue about, and it's enough: if no program can handle the diagonal, no program can handle the whole table.
- [ ] Because programs can only take themselves as input
  Programs can take any string as input. We choose self-application because it's the diagonal.
:::

## Turing's troll 👺

Suppose someone hands us a program `d` and claims that it decides `HaltsOnSelf`. Turing's idea is to build a **troll**: a program that asks `d` about its input, and then does the opposite.

```js
function troll(x) {
  if (d(x)) while (true) {}   // d says "x halts on x": so loop forever
}                              // d says "x loops on x": so halt
```

That's exactly `haltIfNo(d)` from chapter 5! In Lean:

@snippet troll_def

Now the crucial move: **run the troll on its own source code.** Call the troll `t`. Does `t` halt on `t`?

@figure halting-table

::: question
Suppose `t` halts on `t`. Since `d` is a correct tester, what does `d(t)` return?
- [x] `true`
  Right: `d` correctly reports that `t` halts on `t`.
- [ ] `false`
  We're assuming `d` is correct, and in this case `t` does halt on `t`.
:::

::: question
Then what does `t` actually do on `t`?
- [ ] It halts, as we supposed
  Read the troll's code: when `d` says `true`, it enters `while (true) {}`.
- [x] It loops forever, contradicting our supposition
  Exactly. If `t` halts on `t`, then `d` says so, and then `t` loops on `t`.
:::

::: question
So suppose instead that `t` loops on `t`. What happens?
- [x] `d(t)` returns `false`, so the troll skips the loop and halts: contradiction again
  Right. Either way, `t` does the opposite of what `d` predicts. So `t` halts on `t` if and only if it doesn't.
- [ ] `t` loops, which is consistent
  If `t` loops on `t`, then `d(t)` is `false`, and the troll's `if` is skipped. So it halts.
:::

**Proof of the halting problem.** Suppose `d` decides `HaltsOnSelf`, and build the troll `t`. By the two cases above, `t` halts on `t` if and only if `t` doesn't halt on `t`. That's a statement equivalent to its own negation, which the liar lemma rules out. So `d` can't exist. ∎

@proof troll_iff See "the troll is a liar" in Lean

@proof halting_problem See the halting problem in Lean

::: question
How does this match Lawvere's theorem from chapter 3?
- [x] Rows are programs, the entry is "halts?", and the troll is the flipped diagonal. It must be some row, but it disagrees with its own diagonal entry
  Right. "Flip halting" has no fixed point, just like "flip a bit". The troll is the diagonal row, and since it's a program, it *must* be a row of the table. The contradiction lands on its own diagonal entry.
- [ ] It doesn't: the halting problem is a different kind of argument
  It's the same argument! Go back to the "Preview" at the end of chapter 3.
:::

::: unlock The halting problem
No program decides whether programs halt on their own source. Given a would-be tester `d`, the troll "if `d` says I halt, loop; otherwise halt", run on itself, halts if and only if it doesn't.
:::

::: question
The argument shows `d` gives the wrong answer on some input. Which input?
- [ ] We can't know: just "some" input
  The argument is very specific about where `d` fails.
- [x] The troll's own source code
  Right. Every would-be tester is wrong about its own troll. So the proof doesn't just say "a bug exists somewhere"; it tells you exactly which input to try.
:::

## Poking at the proof 🔧

::: question
Here's a patched tester that fixes the one input the troll exposed:

```js
function d2(x) {
  if (x === trollSource) return !d(x);   // patch the known bug
  return d(x);
}
```

Is `d2` a correct tester?
- [ ] Yes, the bug is patched
  The old troll is handled. But `d2` is a new program...
- [x] No: the troll built from `d2` exposes a new bug
  Right. The theorem applies to every program, including `d2`. Patching one counterexample just creates another, exactly like adding `diag` to Cantor's list.
:::

::: question
Does the theorem mean we can never prove that a *particular* program halts or loops?
- [ ] Yes: halting is undecidable, so we can never know
  We proved plenty of halting facts in chapter 4!
- [x] No: it only rules out a single program that answers correctly for *every* input
  Right. Particular programs can often be analyzed. What's impossible is one mechanical method that always works.
:::

::: question
In a language where every program always halts (Lean's own functions are like this), is there a program that decides `HaltsOnSelf`?
- [x] Yes: always answer `true`
  Right! If everything halts, "always yes" is correct. So there's no contradiction, which means such a language **can't build a troll**: a troll has to loop sometimes. That's why the halting theorem needs the "guards" ability from chapter 5.
- [ ] No: the halting problem applies to every language
  Only to languages that can loop. If every program halts, the question has a trivial answer.
:::

## Halting is recognizable, but looping isn't 🔦

Now let's combine Turing's theorem with Post's theorem from chapter 5. First: is "halts on itself" **recognizable**? Of course: just run it!

```js
function selfRun(x) {
  run(x, x);   // an interpreter: run program x on input x
}              // halts exactly when x halts on x
```

Every real language can do this, since you can write an interpreter for any language in any other. That's our third ability:

@snippet has_self_runner

::: question
What does `selfRun` do on a program `x` that loops on its own source?
- [x] It loops forever too
  Right. It halts exactly when `x` halts on `x`, and loops otherwise. That's precisely what it means to recognize "halts on itself".
- [ ] It returns `false`
  `selfRun` never answers `false`: it just runs `x`. If `x` runs forever, so does `selfRun`.
:::

::: theorem Looping is not recognizable
No program halts on exactly those programs that **loop** on their own source code.
:::

**Proof.** Suppose some program recognized looping. Then:

1. "Halts on itself" is recognizable, by `selfRun`.
2. Its opposite, "loops on itself", is recognizable, by assumption.
3. By Post's theorem, "halts on itself" would be decidable.
4. But the halting problem says it isn't. Contradiction. ∎

@proof looping_not_recognizable See this theorem in Lean

@figure landscape-full

::: question
Where does "`x` loops on itself" sit on the map?
- [ ] In the overlap: it's decidable
  If it were decidable, then so would halting be, and Turing says it isn't.
- [x] In the right circle only: its opposite (halting) is recognizable, but it isn't
  Right. Halting is in the left circle only, and looping is in the right circle only.
:::

::: question
Here's the practical meaning. Could any program **list** every program that loops on its own source?
- [ ] Yes, with enough cleverness
  Listing is the same as recognizing (chapter 5), and looping isn't recognizable.
- [x] No: listing equals recognizing, and looping can't be recognized
  Right. There's no mechanical way to churn out all the looping programs. Any list of looping programs, produced by a program, must miss some.
:::

::: question
Here's the connection to formal systems. Suppose a formal system's proofs can be checked by a program. Then a program can list every theorem of the form "`x` loops on itself". Can those theorems cover *every* program that really loops (without any false ones)?
- [x] No: that list would be a program listing all the looping programs, which is impossible
  Exactly. If a system proves only true "loops" statements, it must miss some true ones. That's already an incompleteness theorem! We'll make it precise in the next two chapters.
- [ ] Yes, if the system is strong enough
  No strength is enough. Any such system gives a program that lists looping programs, and no program can list all of them correctly.
:::

::: unlock Looping is not recognizable
Halting is recognizable (just run the program), but not decidable (Turing). So by Post's theorem, **looping is not even recognizable**: no program can list all the looping programs. Any mechanical source of "this program loops" facts, including a formal system, must miss some.
:::

[[On to formal systems]]

## Exercises ✏️

Optional practice problems, like the ones at the end of a textbook chapter. They're graded as you go, but they don't block your progress.

::: exercise troll Troll any halting tester
Write Turing's troll as a program. Here programs are generator functions, and `d(p, x)` is a would-be halting tester that predicts whether program `p` halts on input `x`. Your troll, run on itself, must do the opposite of whatever `d` predicts. It will be tested against several different testers.
--- hint
The troll asks `d` about its own input run on itself: `d(x, x)`. Then it does the opposite.
--- hint
To loop forever in a generator, write `while (true) yield`. To halt, just reach the end of the function.
--- solution
```js
function* troll(x) {
  if (d(x, x)) while (true) yield   // d says "x halts on x": loop forever
}                                   // d says "x loops on x": halt
```

Run on itself, the troll halts exactly when `d` says it doesn't. Whatever strategy `d` uses, it's wrong about this one program.
:::

::: exercise halting-order Prove the halting problem
Put together Turing's proof that no program decides halting. Two of the steps don't belong.
--- hint
Build the troll from `d`, run it on itself, and look at both cases.
--- solution
The two cases can come in either order. The red herrings: waiting to see whether `t` halts might take forever, and a patched `d` is just a new program with its own troll.
:::
