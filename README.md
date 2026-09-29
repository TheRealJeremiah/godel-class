# Unprovable! 🐍

An interactive course on Gödel's incompleteness theorems: the mathematics explained step by step
in plain English, illustrated with JavaScript, and **checked by Lean**. Its style is modelled on
[Busy Beavers!](https://busy-beavers.tigyog.app/).

* 12 chapters, 153 questions, 177 steps (about 4 hours)
* Every Lean snippet in the course is cut from the verified Lean 4 project in [`lean/`](lean/);
  key definitions are shown, proofs are folded behind a toggle
* Version history: `v1` (tag) was a Lean-syntax-heavy first version; `v2` refocuses on the
  mathematics (see [`docs/OUTLINE-v2.md`](docs/OUTLINE-v2.md) and [`docs/REVIEW-v1.md`](docs/REVIEW-v1.md))
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

## Deploy

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which checks
the content, re-checks every Lean proof, builds the site, and publishes it to GitHub Pages. One-time
setup: in the GitHub repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Check the proofs

The Lean project needs only Lean 4 (toolchain pinned in `lean/lean-toolchain`), no Mathlib:

```bash
npm run check:lean     # = cd lean && lake build
npm run check:content    # every chapter parses, every snippet/figure/exercise exists
npm run check:exercises  # every coding exercise's worked solution passes its tests
```

## Layout

| Path | What |
|---|---|
| `lean/GodelCourse/*.lean` | The proof: basics, diagonalization and Lawvere, machines, deciding/recognizing (Post's theorem), halting, enumeration, formal systems, Gödel, Rosser, second theorem |
| `src/content/chapters/*.md` | Chapter text, in Markdown plus a few directives (see `src/lib/parse.ts`) |
| `src/figures/` | Interactive figures (Cantor table, toy machine, string enumerator, race, ...) |
| `src/components/`, `src/pages/` | React UI |
| `docs/CURRICULUM.md` | Research notes: which variant is proved, what's taught, question design |

### Writing content

~~~md
## Section heading

Markdown text, `inline code`, fenced ```lean / ```js blocks.

@snippet godel_key        <!-- Lean code between `-- #snippet godel_key` and `-- #end` -->
@proof godel_first        <!-- the same, but folded behind a "See the proof in Lean" button -->
@figure race              <!-- an interactive figure -->

::: question
What does `g(g)` search for?
- [ ] A wrong option
  Feedback shown when this is picked.
- [x] The right option
  Feedback for the right answer.
:::

::: theorem Name
A plain-English statement, in a highlighted box.
:::

::: unlock Concept name
Summary box.
:::

::: aside Wait, why...?
Collapsible aside.
:::

[[Continue button label]]
~~~
