# Unprovable! 🐍

An interactive, code-first course on Gödel's incompleteness theorems, **proved in Lean**,
one question at a time. Its style is modelled on [Busy Beavers!](https://busy-beavers.tigyog.app/).

* 11 chapters, 126 questions, 149 steps (about 3–4 hours)
* Every Lean snippet in the course is cut from the verified Lean 4 project in [`lean/`](lean/)
* Progress is saved in the browser; works offline; light and dark themes

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Build a single self-contained file (open `dist/index.html` directly, or host it anywhere):

```bash
npm run build
```

## Check the proofs

The Lean project needs only Lean 4 (toolchain pinned in `lean/lean-toolchain`), no Mathlib:

```bash
npm run check:lean     # = cd lean && lake build
npm run check:content  # every chapter parses, every snippet/figure exists
```

## Layout

| Path | What |
|---|---|
| `lean/GodelCourse/*.lean` | The proof: basics, diagonalization, machines, halting, enumeration, formal systems, Gödel, Rosser, second theorem |
| `src/content/chapters/*.md` | Chapter text, in Markdown plus a few directives (see `src/lib/parse.ts`) |
| `src/figures/` | Interactive figures (Cantor table, toy machine, string enumerator, race, ...) |
| `src/components/`, `src/pages/` | React UI |
| `docs/CURRICULUM.md` | Research notes: which variant is proved, what's taught, question design |

### Writing content

~~~md
## Section heading

Markdown text, `inline code`, fenced ```lean / ```js blocks.

@snippet godel_key        <!-- Lean code between `-- #snippet godel_key` and `-- #end` -->
@figure race              <!-- an interactive figure -->

::: question
What does `g(g)` search for?
- [ ] A wrong option
  Feedback shown when this is picked.
- [x] The right option
  Feedback for the right answer.
:::

::: unlock Concept name
Summary box.
:::

::: aside Wait, why...?
Collapsible aside.
:::

[[Continue button label]]
~~~
