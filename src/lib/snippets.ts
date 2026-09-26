/**
 * Lean snippets shown in the course are cut straight out of the verified
 * Lean project in /lean, between `-- #snippet name` and `-- #end` markers,
 * so the course can never drift from code that `lake build` accepts.
 */

export interface Snippet {
  name: string
  file: string
  code: string
}

export function extractSnippets(files: Record<string, string>): Map<string, Snippet> {
  const out = new Map<string, Snippet>()
  for (const [path, src] of Object.entries(files)) {
    const file = path.replace(/^.*\/lean\//, '')
    const lines = src.split('\n')
    let name: string | null = null
    let buf: string[] = []
    for (const line of lines) {
      const start = line.match(/^-- #snippet\s+(\S+)/)
      if (start) {
        name = start[1]
        buf = []
      } else if (/^-- #end/.test(line)) {
        if (name) {
          if (out.has(name)) throw new Error(`Duplicate snippet ${name}`)
          out.set(name, { name, file, code: buf.join('\n').replace(/\s+$/, '') })
        }
        name = null
      } else if (name) {
        buf.push(line)
      }
    }
  }
  return out
}

/** A Lean source file with the snippet markers removed. */
export function stripMarkers(src: string): string {
  return src
    .split('\n')
    .filter((l) => !/^-- #(snippet|end)/.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
