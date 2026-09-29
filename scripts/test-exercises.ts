/**
 * Runs every coding exercise's test script, in a sandbox with a time limit:
 *   - the worked solution in the chapter must pass every test;
 *   - the starter code must not pass.
 * Run with `npm run check:exercises`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { parseChapter, walk, type Block } from '../src/lib/parse.ts'
import { PRELUDE } from '../src/exercises/prelude.ts'
import * as code from '../src/exercises/code.ts'
import type { CodeConfig } from '../src/exercises/CodeExercise.tsx'
import * as proofs from '../src/exercises/proofs.ts'
import type { Step } from '../src/exercises/OrderExercise.tsx'

const root = new URL('..', import.meta.url).pathname
const registry = readFileSync(join(root, 'src/exercises/index.tsx'), 'utf8')
const configFor = new Map<string, CodeConfig>()
for (const m of registry.matchAll(/'([\w-]+)': \{ kind: 'code', Widget: codeExercise\(code\.(\w+)\) \}/g)) {
  configFor.set(m[1], (code as Record<string, CodeConfig>)[m[2]])
}

interface Outcome {
  error?: string
  timedOut: boolean
  results: { label: string; ok: boolean; msg: string }[]
}

function runTests(cfg: CodeConfig, userCode: string): Outcome {
  const out: Outcome = { timedOut: false, results: [] }
  const ctx = vm.createContext({
    self: {},
    console: {},
    postMessage: (m: { type: string; label?: string; ok?: boolean; msg?: string; message?: string }) => {
      if (m.type === 'result') out.results.push({ label: m.label!, ok: !!m.ok, msg: m.msg ?? '' })
      if (m.type === 'error') out.error = m.message
    },
    __CODE: userCode,
  })
  try {
    vm.runInContext(PRELUDE + cfg.tests, ctx)
    vm.runInContext('self.onmessage({ data: { code: __CODE } })', ctx, { timeout: (cfg.timeoutMs ?? 3000) + 2000 })
  } catch (e) {
    if (String(e).includes('timed out')) out.timedOut = true
    else out.error = String(e)
  }
  return out
}

const firstJs = (blocks: Block[]): string | null => {
  for (const b of walk(blocks)) {
    if (b.kind === 'md') {
      const m = b.src.match(/```js\n([\s\S]*?)```/)
      if (m) return m[1]
    }
  }
  return null
}

let failures = 0
for (const file of readdirSync(join(root, 'src/content/chapters')).sort()) {
  const ch = parseChapter(readFileSync(join(root, 'src/content/chapters', file), 'utf8'), file)
  for (const b of walk(ch.blocks)) {
    if (b.kind !== 'exercise' || !configFor.has(b.id)) continue
    const cfg = configFor.get(b.id)!
    const solution = firstJs(b.solution)
    if (!solution) {
      console.error(`✗ ${b.id}: the solution has no js code block`)
      failures++
      continue
    }
    const good = runTests(cfg, solution)
    const goodOk = !good.error && !good.timedOut && good.results.length > 0 && good.results.every((r) => r.ok)
    const starter = runTests(cfg, cfg.starter)
    const starterFails = starter.timedOut || !!starter.error || starter.results.some((r) => !r.ok)
    if (goodOk && starterFails) {
      console.log(`✓ ${b.id.padEnd(18)} solution passes ${good.results.length} tests; starter code does not`)
    } else {
      failures++
      if (!goodOk) {
        const bad = good.results.find((r) => !r.ok)
        console.error(`✗ ${b.id}: solution failed: ${good.error ?? (good.timedOut ? 'timed out' : bad?.msg ?? 'no tests ran')}`)
      }
      if (!starterFails) console.error(`✗ ${b.id}: the starter code passes every test`)
    }
  }
}
// Proof exercises: the listed order must be valid, and there must be red herrings.
const orders = (steps: Step[]): number => {
  const req = steps.filter((s) => !s.distractor)
  const go = (placed: Set<string>): number =>
    placed.size === req.length
      ? 1
      : req
          .filter((s) => !placed.has(s.id) && (s.deps ?? []).every((d) => placed.has(d)))
          .reduce((n, s) => n + go(new Set([...placed, s.id])), 0)
  return go(new Set())
}
for (const [name, steps] of Object.entries(proofs) as [string, Step[]][]) {
  const req = steps.filter((s) => !s.distractor)
  const problems: string[] = []
  const ids = new Set<string>()
  req.forEach((s, i) => {
    if (ids.has(s.id)) problems.push(`duplicate id ${s.id}`)
    ids.add(s.id)
    if (!s.missing) problems.push(`${s.id} has no "missing" message`)
    for (const d of s.deps ?? []) if (!req.slice(0, i).some((r) => r.id === d)) problems.push(`${s.id} depends on ${d}, listed later or unknown`)
  })
  if (steps.length - req.length !== 2) problems.push(`has ${steps.length - req.length} red herrings, expected 2`)
  if (problems.length) {
    failures++
    console.error(`✗ proof ${name}: ${problems.join('; ')}`)
  } else {
    console.log(`✓ proof ${name.padEnd(17)} ${req.length} steps, ${orders(steps)} valid order(s)`)
  }
}

if (failures) {
  console.error(`\n${failures} problem(s)`)
  process.exit(1)
}
console.log('\nAll exercises check out.')
