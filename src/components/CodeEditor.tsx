import { useRef } from 'react'
import { highlight } from '../lib/highlight'

interface Props {
  value: string
  onChange: (code: string) => void
  onBlur?: () => void
  lang?: string
  label?: string
}

/**
 * A lightweight code editor: a transparent <textarea> laid exactly over a
 * syntax-highlighted copy of the same text. Typing, selection, undo and paste
 * are all the browser's own; the highlighting just follows along underneath.
 */
export function CodeEditor({ value, onChange, onBlur, lang = 'js', label = 'Code editor' }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insert = (text: string, a: number, b: number, caret: number) => {
    onChange(value.slice(0, a) + text + value.slice(b))
    requestAnimationFrame(() => ref.current?.setSelectionRange(caret, caret))
  }

  return (
    <div className="code-editor">
      {/* The trailing newline keeps the layers the same height when the code ends in a blank line. */}
      <div className="ce-layer ce-highlight" aria-hidden dangerouslySetInnerHTML={{ __html: highlight(value + '\n', lang) }} />
      <textarea
        ref={ref}
        className="ce-layer ce-input"
        value={value}
        aria-label={label}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          const t = e.currentTarget
          const { selectionStart: a, selectionEnd: b } = t
          if (e.key === 'Tab' && !e.shiftKey) {
            // Tab indents; Esc then Tab still moves focus out, for keyboard users.
            e.preventDefault()
            insert('  ', a, b, a + 2)
          } else if (e.key === 'Enter') {
            // Keep the current line's indentation.
            const lineStart = value.lastIndexOf('\n', a - 1) + 1
            const indent = value.slice(lineStart).match(/^ */)![0]
            const extra = value.slice(0, a).trimEnd().endsWith('{') ? '  ' : ''
            e.preventDefault()
            insert('\n' + indent + extra, a, b, a + 1 + indent.length + extra.length)
          } else if (e.key === 'Escape') {
            t.blur()
          }
        }}
      />
    </div>
  )
}
