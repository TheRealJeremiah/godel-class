import type { ReactNode } from 'react'
import { renderInline } from '../lib/highlight'

export type Tone = 'good' | 'bad' | 'info'

export function Feedback({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <div className={`ex-feedback ${tone}`}>{children}</div>
}

/** Inline Markdown (for `code` in step text and messages). */
export const md = (s: string) => <span dangerouslySetInnerHTML={{ __html: renderInline(s) }} />
