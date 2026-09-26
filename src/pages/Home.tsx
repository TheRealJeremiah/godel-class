import { useEffect } from 'react'
import { chapters } from '../lib/course'
import { useProgress } from '../lib/progress'
import { Hero } from '../components/Hero'
import { highlight } from '../lib/highlight'

function ChapterCard({ i }: { i: number }) {
  const c = chapters[i]
  const p = useProgress(c.id)
  const done = Math.min(p.passed, c.gateCount)
  const status = done === 0 ? 'Start' : done === c.gateCount ? 'Done ✓' : 'Continue'
  return (
    <a className="chapter-card" href={`#/c/${c.id}`}>
      <div className="card-top">
        <span className="card-num">{i + 1}.</span>
        <span className="card-title">
          {c.title} <span className="emoji">{c.emoji}</span>
        </span>
      </div>
      <div className="card-sub">{c.subtitle}</div>
      <p className="card-blurb">{c.blurb}</p>
      <div className="card-foot">
        <div className="mini-bar">
          <div style={{ width: `${(done / c.gateCount) * 100}%` }} />
        </div>
        <span className="mini-count">
          {done}/{c.gateCount}
        </span>
        <span className={`card-status ${done === c.gateCount ? 'complete' : ''}`}>{status}</span>
      </div>
    </a>
  )
}

const teaser = `-- Chapter 8, in one screen:
theorem godel_first (E : S.Effective)
    (hcon : S.Consistent) (hph : S.ProvesHalting) :
    ¬ S.Provable (S.godelSentence E) ∧
      ¬ M.Halts (S.godelProgram E) (S.godelProgram E)`

export function Home() {
  useEffect(() => {
    document.title = 'Unprovable! Gödel in Lean'
  }, [])
  const total = chapters.reduce((n, c) => n + c.gateCount, 0)
  const questions = chapters.reduce(
    (n, c) => n + c.blocks.filter((b) => b.kind === 'question').length,
    0,
  )

  return (
    <main className="home">
      <Hero />
      <h1 className="home-title">Unprovable!</h1>
      <h2 className="home-sub">Gödel's incompleteness theorem, proved in Lean, one question at a time</h2>

      <p>
        In 1931, Kurt Gödel showed that any reasonable system for doing mathematics has statements it can
        neither prove nor disprove. It's one of the most famous results in all of mathematics, and one of the
        most misquoted. In this course, you and I will <em>actually prove it</em>, line by line, in the Lean
        proof assistant.
      </p>
      <p>
        The only prerequisite is that you're comfortable reading code. No Lean experience needed: we'll
        learn it as we go. I prefer <code>Provable φ</code> over squiggles like ⊢ φ, source-code strings over
        Gödel numbering, and programs over arithmetic. We'll do examples first and abstraction later, and
        you'll answer {questions} questions along the way to make sure every step really sinks in.
      </p>

      <div className="teaser" dangerouslySetInnerHTML={{ __html: highlight(teaser, 'lean') }} />

      <p>
        Every Lean snippet you'll see is cut straight from a real Lean 4 project that ships with this course.
        None of it is pseudo-code, and Lean has checked all of it. The proof we'll build is the{' '}
        <strong>computational</strong> version of Gödel's theorem, as told by Turing, Kleene and Rosser: a
        system that could settle every question about programs would solve the halting problem.
      </p>

      <div className="home-actions">
        <a className="btn primary big" href={`#/c/${chapters[0].id}`}>
          Start chapter 1 →
        </a>
        <span className="home-meta">
          {chapters.length} chapters · {total} steps · about 3–4 hours
        </span>
      </div>

      <h2 className="home-h">What's in the course?</h2>
      <div className="chapter-grid">
        {chapters.map((_, i) => (
          <ChapterCard key={i} i={i} />
        ))}
      </div>

      <h2 className="home-h">The plan, in one picture</h2>
      <ol className="roadmap">
        <li>
          <strong>Learn to read Lean</strong> (ch. 1–2). Statements are types, proofs are programs.
        </li>
        <li>
          <strong>Learn the one trick</strong> (ch. 3). Diagonalization: to escape a list, disagree with row{' '}
          <code>n</code> at position <code>n</code>.
        </li>
        <li>
          <strong>Aim the trick at programs</strong> (ch. 4–5). No program can decide halting.
        </li>
        <li>
          <strong>Aim it at proofs</strong> (ch. 6–8). Proofs can be listed, so a complete system would decide
          halting. Then build the sentence that says “I am not provable”.
        </li>
        <li>
          <strong>Sharpen it</strong> (ch. 9–11). Rosser's trick, the second incompleteness theorem, and what it
          all means for Lean itself.
        </li>
      </ol>

      <h2 className="home-h">Check it yourself ✓</h2>
      <p>
        The whole proof is in the <code>lean/</code> folder of this project, with no dependencies beyond Lean 4
        itself. To have Lean re-check every theorem in the course:
      </p>
      <div className="code-block" dangerouslySetInnerHTML={{ __html: highlight('cd lean && lake build', 'text') }} />
      <p>
        Or <a href="#/source">read the complete Lean proof</a> right here.
      </p>

      <footer className="home-foot">
        Inspired by the wonderful{' '}
        <a href="https://busy-beavers.tigyog.app/" target="_blank" rel="noopener">
          Busy Beavers!
        </a>{' '}
        course. Progress is saved in this browser only.
      </footer>
    </main>
  )
}
