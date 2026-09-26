import { useState } from 'react'
import type { Block } from '../lib/parse'
import { highlight, renderMarkdown } from '../lib/highlight'
import { snippets } from '../lib/course'
import { figures } from '../figures'

export function Markdown({ src, className }: { src: string; className?: string }) {
  return <div className={className ?? 'md'} dangerouslySetInnerHTML={{ __html: renderMarkdown(src) }} />
}

export function Snippet({ name }: { name: string }) {
  const s = snippets.get(name)
  if (!s) return <div className="error">Missing Lean snippet “{name}”</div>
  return (
    <figure className="snippet">
      <div className="code-block" dangerouslySetInnerHTML={{ __html: highlight(s.code, 'lean') }} />
      <figcaption>
        <span className="check" aria-hidden>
          ✓
        </span>{' '}
        Checked by Lean · <a href={`#/source/${encodeURIComponent(s.file)}`}>{s.file}</a>
      </figcaption>
    </figure>
  )
}

function Aside({ title, body }: { title: string; body: Block[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`aside ${open ? 'open' : ''}`}>
      <button className="aside-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="chev" aria-hidden>
          ▸
        </span>
        {title}
      </button>
      {open && (
        <div className="aside-body">
          <Blocks blocks={body} />
        </div>
      )}
    </div>
  )
}

/** Renders non-interactive blocks. Gates are rendered by ChapterView. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'md':
            return <Markdown key={i} src={b.src} />
          case 'heading':
            return (
              <h2 key={i} id={b.slug} className="section-heading">
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text).replace(/^<p>|<\/p>\s*$/g, '') }} />
              </h2>
            )
          case 'snippet':
            return <Snippet key={i} name={b.name} />
          case 'figure': {
            const F = figures[b.name]
            return F ? <F key={i} /> : <div key={i} className="error">Missing figure “{b.name}”</div>
          }
          case 'aside':
            return <Aside key={i} title={b.title} body={b.body} />
          case 'unlock':
            return (
              <div key={i} className="unlock">
                <div className="unlock-title">
                  <span aria-hidden>🔐</span> Unlocked: {b.title}
                </div>
                <Blocks blocks={b.body} />
              </div>
            )
          case 'note':
            return (
              <div key={i} className="note">
                <Blocks blocks={b.body} />
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
