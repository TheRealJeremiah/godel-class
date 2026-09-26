/**
 * Parser for the course's chapter format: Markdown plus a few directives.
 *
 *   ## Heading                      section heading (appears in the chapter TOC)
 *   @snippet name                   a Lean snippet, verified by `lake build`
 *   @proof name [Button label]      a Lean snippet, collapsed behind a button
 *   @figure name                    an interactive figure (see src/figures)
 *   [[Button label]]                a "continue" gate
 *   ::: question                    a multiple-choice gate:
 *   Prompt markdown ...
 *   - [x] correct option              [x] correct, [ ] wrong, [~] neither
 *     Feedback markdown (indented)
 *   :::
 *   ::: aside Title  / ::: unlock Title / ::: note / ::: theorem Title
 *                                   (containers, closed by :::)
 */

export type Block =
  | { kind: 'md'; src: string }
  | { kind: 'heading'; text: string; slug: string }
  | { kind: 'snippet'; name: string }
  | { kind: 'proof'; name: string; label: string }
  | { kind: 'figure'; name: string }
  | { kind: 'aside'; title: string; body: Block[] }
  | { kind: 'unlock'; title: string; body: Block[] }
  | { kind: 'note'; body: Block[] }
  | { kind: 'theorem'; title: string; body: Block[] }
  | { kind: 'continue'; label: string; gate: number }
  | { kind: 'question'; prompt: Block[]; options: Option[]; gate: number }

export type Verdict = 'correct' | 'wrong' | 'neutral'

export interface Option {
  label: string
  verdict: Verdict
  feedback: Block[]
}

export interface ChapterMeta {
  id: string
  title: string
  subtitle: string
  emoji: string
  blurb: string
}

export interface Chapter extends ChapterMeta {
  blocks: Block[]
  gateCount: number
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

function parseFrontmatter(src: string): { meta: Record<string, string>; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) throw new Error('Chapter is missing frontmatter')
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: src.slice(m[0].length) }
}

interface Ctx {
  gate: number
  allowGates: boolean
  where: string
}

function parseBlocks(lines: string[], ctx: Ctx): Block[] {
  const blocks: Block[] = []
  let buf: string[] = []
  const flush = () => {
    const src = buf.join('\n').trim()
    if (src) blocks.push({ kind: 'md', src })
    buf = []
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Code fences pass straight through to Markdown.
    if (/^\s*```/.test(line)) {
      buf.push(line)
      i++
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) buf.push(lines[i++])
      if (i < lines.length) buf.push(lines[i++])
      continue
    }

    let m: RegExpMatchArray | null
    if ((m = line.match(/^##\s+(.*)$/))) {
      flush()
      blocks.push({ kind: 'heading', text: m[1].trim(), slug: slugify(m[1]) })
    } else if ((m = line.match(/^@snippet\s+(\S+)\s*$/))) {
      flush()
      blocks.push({ kind: 'snippet', name: m[1] })
    } else if ((m = line.match(/^@proof\s+(\S+)\s*(.*)$/))) {
      flush()
      blocks.push({ kind: 'proof', name: m[1], label: m[2].trim() || 'See the proof in Lean' })
    } else if ((m = line.match(/^@figure\s+(\S+)\s*$/))) {
      flush()
      blocks.push({ kind: 'figure', name: m[1] })
    } else if ((m = line.match(/^\[\[(.+)\]\]\s*$/))) {
      flush()
      if (!ctx.allowGates) throw new Error(`${ctx.where}: gate inside a container`)
      blocks.push({ kind: 'continue', label: m[1].trim(), gate: ctx.gate++ })
    } else if ((m = line.match(/^:::\s*(\w+)\s*(.*)$/))) {
      flush()
      const type = m[1]
      const title = m[2].trim()
      const body: string[] = []
      i++
      let inFence = false
      while (i < lines.length) {
        if (/^\s*```/.test(lines[i])) inFence = !inFence
        if (!inFence && /^:::\s*$/.test(lines[i])) break
        body.push(lines[i++])
      }
      if (i >= lines.length) throw new Error(`${ctx.where}: unclosed ::: ${type}`)
      const inner: Ctx = { gate: 0, allowGates: false, where: ctx.where }
      if (type === 'question') {
        if (!ctx.allowGates) throw new Error(`${ctx.where}: question inside a container`)
        blocks.push(parseQuestion(body, ctx.gate++, ctx.where))
      } else if (type === 'aside') {
        blocks.push({ kind: 'aside', title, body: parseBlocks(body, inner) })
      } else if (type === 'unlock') {
        blocks.push({ kind: 'unlock', title, body: parseBlocks(body, inner) })
      } else if (type === 'note') {
        blocks.push({ kind: 'note', body: parseBlocks(body, inner) })
      } else if (type === 'theorem') {
        blocks.push({ kind: 'theorem', title, body: parseBlocks(body, inner) })
      } else {
        throw new Error(`${ctx.where}: unknown container ::: ${type}`)
      }
    } else {
      buf.push(line)
    }
    i++
  }
  flush()
  return blocks
}

function parseQuestion(lines: string[], gate: number, where: string): Block {
  const prompt: string[] = []
  const options: { label: string; verdict: Verdict; fb: string[] }[] = []
  let inFence = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence
    const m = !inFence && line.match(/^- \[( |x|~)\]\s+(.*)$/)
    if (m) {
      const verdict: Verdict = m[1] === 'x' ? 'correct' : m[1] === '~' ? 'neutral' : 'wrong'
      options.push({ label: m[2].trim(), verdict, fb: [] })
    } else if (options.length === 0) {
      prompt.push(line)
    } else {
      options[options.length - 1].fb.push(line.replace(/^ {1,4}/, ''))
    }
  }
  const w = `${where} (question #${gate + 1})`
  if (options.length < 2) throw new Error(`${w}: needs at least two options`)
  if (!options.some((o) => o.verdict !== 'wrong')) throw new Error(`${w}: no correct option`)
  const inner: Ctx = { gate: 0, allowGates: false, where: w }
  return {
    kind: 'question',
    gate,
    prompt: parseBlocks(prompt, inner),
    options: options.map((o) => ({
      label: o.label,
      verdict: o.verdict,
      feedback: parseBlocks(o.fb, inner),
    })),
  }
}

export function parseChapter(src: string, where = 'chapter'): Chapter {
  const { meta, body } = parseFrontmatter(src.replace(/\r\n/g, '\n'))
  for (const k of ['id', 'title', 'subtitle', 'emoji', 'blurb']) {
    if (!meta[k]) throw new Error(`${where}: frontmatter is missing "${k}"`)
  }
  const ctx: Ctx = { gate: 0, allowGates: true, where: meta.id }
  const blocks = parseBlocks(body.split('\n'), ctx)
  return {
    id: meta.id,
    title: meta.title,
    subtitle: meta.subtitle,
    emoji: meta.emoji,
    blurb: meta.blurb,
    blocks,
    gateCount: ctx.gate,
  }
}

/** Every block (recursively), for validation. */
export function* walk(blocks: Block[]): Generator<Block> {
  for (const b of blocks) {
    yield b
    if (b.kind === 'aside' || b.kind === 'unlock' || b.kind === 'note' || b.kind === 'theorem')
      yield* walk(b.body)
    if (b.kind === 'question') {
      yield* walk(b.prompt)
      for (const o of b.options) yield* walk(o.feedback)
    }
  }
}
