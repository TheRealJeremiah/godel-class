import { parseChapter, type Chapter } from './parse'
import { extractSnippets, type Snippet } from './snippets'

const chapterSources = import.meta.glob('../content/chapters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const leanSources = import.meta.glob('../../lean/GodelCourse/*.lean', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Chapters are ordered by their file name prefix (01-, 02-, ...). */
export const chapters: Chapter[] = Object.keys(chapterSources)
  .sort()
  .map((path) => parseChapter(chapterSources[path], path))

export const snippets: Map<string, Snippet> = extractSnippets(leanSources)

export function chapterIndex(id: string): number {
  return chapters.findIndex((c) => c.id === id)
}
