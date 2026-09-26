import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { Marked } from 'marked'

let hl: HighlighterCore | null = null

/** The Lean 4 grammar embeds a Markdown grammar inside comments that Shiki
 *  doesn't ship, which silently disables comment highlighting. Drop it. */
function withoutEmbeddedMarkdown<T>(grammar: T): T {
  return JSON.parse(
    JSON.stringify(grammar, (_k, v) =>
      Array.isArray(v) ? v.filter((p) => !(p && p.include === 'source.lean4.markdown')) : v,
    ),
  )
}

export async function initHighlighter(): Promise<void> {
  hl = await createHighlighterCore({
    themes: [import('@shikijs/themes/one-light'), import('@shikijs/themes/one-dark-pro')],
    langs: [
      import('@shikijs/langs/lean4').then((m) => m.default.map(withoutEmbeddedMarkdown)),
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/typescript'),
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
}

const LANG_ALIASES: Record<string, string> = { lean: 'lean4', js: 'javascript', ts: 'typescript' }

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlight(code: string, lang: string): string {
  const l = LANG_ALIASES[lang] ?? lang
  if (hl && hl.getLoadedLanguages().includes(l)) {
    return hl.codeToHtml(code, {
      lang: l,
      themes: { light: 'one-light', dark: 'one-dark-pro' },
      defaultColor: false,
    })
  }
  return `<pre class="shiki plain"><code>${escapeHtml(code)}</code></pre>`
}

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const l = (lang ?? 'text').trim()
      return `<div class="code-block" data-lang="${escapeHtml(l)}">${highlight(text, l)}</div>`
    },
    link({ href, text }) {
      const external = /^https?:/.test(href)
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`
    },
  },
})

const cache = new Map<string, string>()

export function renderMarkdown(src: string): string {
  let html = cache.get(src)
  if (html === undefined) {
    html = marked.parse(src, { async: false }) as string
    cache.set(src, html)
  }
  return html
}

export function renderInline(src: string): string {
  return marked.parseInline(src, { async: false }) as string
}
