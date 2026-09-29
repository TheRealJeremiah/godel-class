import { createContext } from 'react'

/** Which chapter a block is being rendered in (used by exercises to save progress). */
export const ChapterContext = createContext<{ chapterId: string; chapterNum: number } | null>(null)
