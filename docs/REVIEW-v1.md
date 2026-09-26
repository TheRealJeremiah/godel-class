# Review of v1: gaps to fix in the next version

A review of the v1 curriculum for concepts that are missing an introduction, hard to
understand, or too code-heavy. Line numbers refer to the `v1` tag.

## 1. Foundational gaps that affect several chapters

- [ ] **Basic Lean syntax is never taught.** Needs a "Reading Lean as a JavaScript developer" primer:
  - `f x y` means `f(x, y)`; `A → B → C` means "takes two arguments" (first used: `table i n`, ch. 3)
  - `fun x => ...` lambdas (Lawvere section; toy machine, ch. 4)
  - definitions by cases `| 0, s => s` / `| fuel + 1, s => ...` (`04-programs.md:17`)
  - `inductive`, `structure`, `.loops` / `.returns true` (`04-programs.md:95-97`)
  - `namespace Computer` + `def Halts` ⇒ callable as `M.Halts` (used in every later proof)
  - `⟨a, b⟩`, `.1` / `.2`, `{A B : Type}`, `let`, `<;>`, `≠`
  - ch. 1 uses `intro` / `exact` / `contradiction` / "the goal" (`01-lean.md:123`) before ch. 2 introduces goals; `have` is never explained
- [ ] **Mathematical induction is never introduced**, but it's used for invariants (ch. 4) and `every_string_listed` (ch. 6).
- [ ] **"Axiom" means two different things, and neither is defined**: Lean's kernel axioms (`propext`, `Classical.choice`, `Quot.sound`, `05-halting.md:192`) versus a formal system's starting assumptions ("add as a new axiom", ch. 7–8).
- [ ] **What "G is true" means is never pinned down.** "True" for an S-sentence only ever means its Lean counterpart (`¬ M.Halts g g`). Say so explicitly.
- [ ] **Properties as functions** (`P : Code → Prop`) are never introduced, but `Decides`, `Recognizes`, `M.HaltsOnSelf` and `fun x => S.Provable (…)` depend on them.
- [ ] **Structures that bundle a contract** (fields that are proofs, like `HasTroll`, `HasRace`, `Effective`; `Stmt` as a type-valued field) are never explained. Analogy: an interface plus its tests.

## 2. Concepts used before they're introduced

- [ ] Peano arithmetic, ZFC, Robinson arithmetic: named from ch. 1 (`01-lean.md:193`, `06-formal.md:108`), never described.
- [ ] The Collatz conjecture appears in ch. 2 (`02-tactics.md:57`) before it's explained.
- [ ] "Disprove" is never defined as "prove `S.neg φ`".
- [ ] `ρ` is used in ch. 9's prompts (`09-rosser.md:70`) before it's named; `findNo` / `findYes` appear in the JavaScript sketch before they're defined.
- [ ] The hypothesis-map figure first appears in ch. 7 (`07-take-one.md:137`) with rows for theorems not yet seen.
- [ ] The "true statements" question at the end of ch. 6 needs the next chapter's theorem to answer.
- [ ] `LogicalSystem.Con` is an arbitrary sentence; its meaning comes only from `formalized_first`. Say so.

## 3. Likely to be hard to understand

- [ ] Why `run` is a Lean function even though it can't be computed (`04-programs.md:97`) is only explained in question feedback; it needs prose.
- [ ] The link between chapter 6's search (a Lean function) and `Effective` (an assumption about `M`'s programs) is never explained, nor why only the diagonal searches are needed.
- [ ] The Lawvere section (ch. 3) is the most abstract part and nothing depends on it. Make it an aside.
- [ ] `apply M.halting_problem T` on a `False` goal (ch. 7) is a non-obvious step that the prose skips.
- [ ] ω-consistency (`08-godel.md:207`) gets one sentence; label it clearly as not needed.
- [ ] Chapter 9's "consistent guessing" aside is compressed; expand or cut.
- [ ] Chapter 10 moves quickly (8 questions) over its big leap: S reasoning about its own proofs. The derivability-conditions aside is dense.
- [ ] Greek letters (φ, ψ, ρ, ω, Σ₁, ε₀) go against the "less γs, more gs" promise. Rename φ to `s` / `stmt` in the Lean code and prose.

## 4. Too code-heavy for what it teaches

- [ ] Chapter 6 enumeration (`06-formal.md:130-176`): four snippets, including the full `nthString_indexOf` proof and `searchUpTo`, using `::`, `Option`, `==` vs `=`, `||`, and a hidden `[DecidableEq Stmt]`. Keep `nthString` and the statement of `every_string_listed`; move the rest into an aside.
- [ ] `take_one` (ch. 7) is the longest proof (~25 lines). Show one case and fold away the mirror image.
- [ ] `obtain_demo` (ch. 2) is an unrelated arithmetic example; use a Gödel-flavoured one.
- [ ] The first ch. 1 snippet introduces `rfl`, `by decide` and `⟨7, rfl⟩` at once; stage them.
- [ ] Questions that test Lean library trivia rather than the method: `congrFun` (ch. 3), `resolve_right` (ch. 7), `(hout ρ ρ false hrun).2` (ch. 9). Reframe as "what fact do we need here?".

## Suggested order

1. Lean primer and an induction section (§1, first two items).
2. Paragraphs on axioms, truth vs `M`-facts, properties, and structures-as-contracts.
3. Slim the ch. 6 enumeration and the ch. 7 walkthrough; make Lawvere an aside.
4. Rename φ; introduce ρ and the named systems; fix forward references.
