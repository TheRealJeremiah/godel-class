import { useSyncExternalStore } from 'react'

/** Per-chapter progress, remembered in this browser only. */
export interface Answer {
  choice: number
  /** Whether the learner's first attempt at this question was right. */
  firstTry: boolean
}

export interface ChapterProgress {
  passed: number
  answers: Record<number, Answer>
}

const KEY = 'unprovable:v1:'
const listeners = new Set<() => void>()
const memo = new Map<string, ChapterProgress>()

function read(id: string): ChapterProgress {
  const hit = memo.get(id)
  if (hit) return hit
  let p: ChapterProgress = { passed: 0, answers: {} }
  try {
    const raw = localStorage.getItem(KEY + id)
    if (raw) p = { passed: 0, answers: {}, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable: progress lives in memory only */
  }
  memo.set(id, p)
  return p
}

export function getProgress(id: string): ChapterProgress {
  return read(id)
}

export function setProgress(id: string, p: ChapterProgress): void {
  memo.set(id, p)
  try {
    localStorage.setItem(KEY + id, JSON.stringify(p))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function resetProgress(id: string): void {
  setProgress(id, { passed: 0, answers: {} })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProgress(id: string): ChapterProgress {
  return useSyncExternalStore(subscribe, () => read(id))
}

/** Small persisted preferences (sound, theme). */
export function usePref<T extends string>(name: string, fallback: T): [T, (v: T) => void] {
  const get = (): T => {
    try {
      return (localStorage.getItem(KEY + 'pref:' + name) as T) ?? fallback
    } catch {
      return fallback
    }
  }
  const value = useSyncExternalStore(subscribe, get)
  const set = (v: T) => {
    try {
      localStorage.setItem(KEY + 'pref:' + name, v)
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l())
  }
  return [value, set]
}
