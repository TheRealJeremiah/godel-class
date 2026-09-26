import { useEffect, useSyncExternalStore } from 'react'
import { chapters } from './lib/course'
import { ChapterView } from './components/ChapterView'
import { Home } from './pages/Home'
import { Glossary } from './pages/Glossary'
import { Cheatsheet } from './pages/Cheatsheet'
import { Source } from './pages/Source'
import { TopBar } from './components/TopBar'

function useHash(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('hashchange', cb)
      return () => window.removeEventListener('hashchange', cb)
    },
    () => location.hash,
  )
}

export function App() {
  const hash = useHash()
  const path = hash.replace(/^#\/?/, '')
  const [section, ...rest] = path.split('/')
  const arg = decodeURIComponent(rest.join('/'))

  useEffect(() => {
    if (section !== 'c') window.scrollTo(0, 0)
  }, [section, arg])

  if (section === 'c') {
    const ch = chapters.find((c) => c.id === arg)
    if (ch) return <ChapterView key={ch.id} chapter={ch} />
  }
  const page =
    section === 'glossary' ? (
      <Glossary />
    ) : section === 'cheatsheet' ? (
      <Cheatsheet />
    ) : section === 'source' ? (
      <Source file={arg} />
    ) : (
      <Home />
    )
  return (
    <>
      <TopBar />
      {page}
    </>
  )
}
