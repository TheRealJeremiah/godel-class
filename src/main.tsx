import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initHighlighter } from './lib/highlight'
import './styles.css'

const root = createRoot(document.getElementById('root')!)

// Load the syntax highlighter first so every code block renders coloured.
// If it fails for any reason, the course still works with plain code.
initHighlighter()
  .catch((e) => console.warn('Syntax highlighting unavailable:', e))
  .finally(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
