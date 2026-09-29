/**
 * Validates the course content: every chapter parses, every question has a
 * right answer, and every `@snippet` / `@figure` refers to something real.
 * Run with `npm run check:content`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseChapter, walk } from '../src/lib/parse.ts'
import { extractSnippets } from '../src/lib/snippets.ts'

const root = new URL('..', import.meta.url).pathname
const chapterDir = join(root, 'src/content/chapters')
const leanDir = join(root, 'lean/GodelCourse')

const leanFiles: Record<string, string> = {}
for (const f of readdirSync(leanDir)) leanFiles[`/lean/GodelCourse/${f}`] = readFileSync(join(leanDir, f), 'utf8')
const snippets = extractSnippets(leanFiles)

const figureSrc = readFileSync(join(root, 'src/figures/index.tsx'), 'utf8')
const figureNames = new Set([...figureSrc.matchAll(/^\s+'?([\w-]+)'?: \w+,$/gm)].map((m) => m[1]))

const exerciseSrc = readFileSync(join(root, 'src/exercises/index.tsx'), 'utf8')
const exerciseNames = new Set([...exerciseSrc.matchAll(/^\s+'([\w-]+)': \{ kind:/gm)].map((m) => m[1]))

let errors = 0
let exerciseCount = 0
let questions = 0
let gates = 0
const used = new Set<string>()
const ids = new Set<string>()

for (const file of readdirSync(chapterDir).sort()) {
  try {
    const ch = parseChapter(readFileSync(join(chapterDir, file), 'utf8'), file)
    if (ids.has(ch.id)) throw new Error(`duplicate chapter id ${ch.id}`)
    ids.add(ch.id)
    let q = 0
    for (const b of walk(ch.blocks)) {
      if (b.kind === 'snippet' || b.kind === 'proof') {
        used.add(b.name)
        if (!snippets.has(b.name)) throw new Error(`unknown snippet "${b.name}"`)
      }
      if (b.kind === 'figure' && !figureNames.has(b.name)) throw new Error(`unknown figure "${b.name}"`)
      if (b.kind === 'question') q++
      if (b.kind === 'exercise') {
        if (!exerciseNames.has(b.id)) throw new Error(`unknown exercise "${b.id}"`)
        exerciseCount++
      }
    }
    questions += q
    gates += ch.gateCount
    console.log(`✓ ${file.padEnd(20)} ${String(q).padStart(3)} questions, ${String(ch.gateCount).padStart(3)} steps`)
  } catch (e) {
    errors++
    console.error(`✗ ${file}: ${(e as Error).message}`)
  }
}

const unused = [...snippets.keys()].filter((n) => !used.has(n))
if (unused.length) console.log(`(Lean snippets not shown in any chapter: ${unused.join(', ')})`)
console.log(
  `\n${ids.size} chapters, ${questions} questions, ${gates} steps, ${exerciseCount} exercises, ${snippets.size} Lean snippets`,
)
if (errors) {
  console.error(`${errors} chapter(s) failed`)
  process.exit(1)
}
