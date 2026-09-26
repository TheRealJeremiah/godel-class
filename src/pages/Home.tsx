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

const teaser = `-- Chapter 9, in one Lean statement. In English: if S is effective,
-- consistent, and checks computations, then Gödel's sentence is
-- unprovable in S, and true.
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
      <h2 className="home-sub">Gödel's incompleteness theorem, explained step by step, and checked by a computer</h2>

      <p>
        In 1931, Kurt Gödel showed that any consistent formal system strong enough to talk about computer programs
        has statements it can neither prove nor disprove. It's one of the most famous results in all of mathematics,
        and one of the most misquoted. In this course we'll work through a complete proof of it, one idea at a time.
      </p>
      <p>
        You'll need to be comfortable reading code and following a basic proof (by contradiction, or by induction).
        You don't need to know anything about Gödel, the halting problem, or computability: we build all of that from
        scratch. Every idea comes in plain English first, then a little JavaScript to make it concrete, and you'll
        answer {questions} questions along the way to make sure each step really sinks in.
      </p>
      <p>
        Behind the scenes, every theorem has been checked by the <strong>Lean</strong> proof assistant. You'll see the
        key Lean definitions as we go; the Lean proofs are folded away, one click from the argument they check. You
        never need to read them, but they're always there, and none of it is pseudo-code.
      </p>

      <div className="teaser" dangerouslySetInnerHTML={{ __html: highlight(teaser, 'lean') }} />

      <div className="home-actions">
        <a className="btn primary big" href={`#/c/${chapters[0].id}`}>
          Start chapter 1 →
        </a>
        <span className="home-meta">
          {chapters.length} chapters · {total} steps · about 4 hours
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
          <strong>Formal systems</strong> (ch. 1). Axioms, proofs, checkers, and the gap between <em>true</em> and{' '}
          <em>provable</em>.
        </li>
        <li>
          <strong>The one trick</strong> (ch. 2–3). Cantor's diagonal argument, and Lawvere's theorem that explains
          why the liar, Russell's paradox and Cantor are all the same argument.
        </li>
        <li>
          <strong>Aim it at programs</strong> (ch. 4–6). Deciding versus recognizing, Post's theorem, and Turing's
          halting problem. Conclusion: no program can even recognize the programs that loop.
        </li>
        <li>
          <strong>Aim it at proofs</strong> (ch. 7–9). A formal system's proofs can be searched by a program, so it
          can't settle every question about looping. Then Gödel's sentence: "I am not provable".
        </li>
        <li>
          <strong>Sharpen it</strong> (ch. 10–12). Rosser's trick, the second incompleteness theorem, and what it all
          means for mathematics and for Lean itself.
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
