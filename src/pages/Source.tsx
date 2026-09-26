import { leanSources } from '../lib/course'
import { stripMarkers } from '../lib/snippets'
import { highlight } from '../lib/highlight'

const ORDER = [
  'Basics',
  'Diagonal',
  'Machines',
  'Halting',
  'Enumerate',
  'FormalSystems',
  'Incompleteness',
  'Rosser',
  'Second',
]

const files = Object.entries(leanSources)
  .map(([path, src]) => ({ file: path.replace(/^.*\/lean\//, ''), src: stripMarkers(src) }))
  .sort(
    (a, b) =>
      ORDER.indexOf(a.file.replace(/^.*\/|\.lean$/g, '')) - ORDER.indexOf(b.file.replace(/^.*\/|\.lean$/g, '')),
  )

export function Source({ file }: { file: string }) {
  const shown = file ? files.filter((f) => f.file === file) : files
  return (
    <main className="page wide">
      <h1>The complete Lean proof ✓</h1>
      <p>
        This is every line of Lean in the course, exactly as <code>lake build</code> checks it. Nothing here
        depends on any library, only Lean 4 itself.
      </p>
      <nav className="file-tabs">
        <a href="#/source" className={!file ? 'on' : ''}>
          All files
        </a>
        {files.map((f) => (
          <a
            key={f.file}
            href={`#/source/${encodeURIComponent(f.file)}`}
            className={f.file === file ? 'on' : ''}
          >
            {f.file.replace('GodelCourse/', '')}
          </a>
        ))}
      </nav>
      {shown.map((f) => (
        <section key={f.file} className="source-file">
          <h2>{f.file}</h2>
          <div className="code-block" dangerouslySetInnerHTML={{ __html: highlight(f.src, 'lean') }} />
        </section>
      ))}
    </main>
  )
}
