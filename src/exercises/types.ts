import type { ComponentType } from 'react'
import type { ExerciseState } from '../lib/progress'

export interface WidgetProps {
  state: ExerciseState
  update: (patch: Partial<ExerciseState>) => void
  /** Report a graded attempt: `correct` tells the shell whether it was solved. */
  attempt: (correct: boolean) => void
}

export type ExerciseKind = 'order' | 'code'

export interface ExerciseDef {
  kind: ExerciseKind
  Widget: ComponentType<WidgetProps>
}

export const kindLabel: Record<ExerciseKind, string> = {
  order: 'Order the proof',
  code: 'Code',
}

/** A small seeded random number generator, for stable shuffles. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
