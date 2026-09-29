import { useState, type ComponentType, type ReactNode } from 'react'
import { CodeEditor } from '../components/CodeEditor'
import { Feedback, md, type Tone } from './Feedback'
import { runInWorker, type WorkerMessage } from './runCode'
import type { WidgetProps } from './types'
import { PRELUDE } from './prelude'

export interface CodeConfig {
  /** The code the editor starts with. */
  starter: string
  /** A test script defining `function __run(code)` (see PRELUDE). */
  tests: string
  /** Shown when every test passes (inline Markdown). */
  success: string
  /** Accessible name for the editor. */
  label: string
  timeoutMs?: number
}

interface TestRow {
  label: string
  hang: string
  msg: string
  status: 'pass' | 'fail' | 'running' | 'timeout'
}

export function codeExercise(cfg: CodeConfig): ComponentType<WidgetProps> {
  const timeout = cfg.timeoutMs ?? 3000
  const script = PRELUDE + cfg.tests

  return function CodeWidget({ state, update, attempt }: WidgetProps) {
    const [code, setCode] = useState(state.draft ?? cfg.starter)
    const [rows, setRows] = useState<TestRow[]>([])
    const [message, setMessage] = useState<{ tone: Tone; text: ReactNode } | null>(null)
    const [running, setRunning] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [infos, setInfos] = useState<string[]>([])

    const run = async () => {
      update({ draft: code })
      setRunning(true)
      setMessage(null)
      setLogs([])
      setInfos([])
      const results: TestRow[] = []
      const logLines: string[] = []
      const infoLines: string[] = []
      let error: string | null = null
      const how = await runInWorker(script, code, timeout, (m: WorkerMessage) => {
        if (m.type === 'log') {
          logLines.push(String(m.text))
          setLogs([...logLines])
        } else if (m.type === 'info') {
          infoLines.push(String(m.text))
        } else if (m.type === 'error') {
          error = String(m.message)
        } else if (m.type === 'start') {
          results.push({ label: String(m.label), hang: String(m.hang ?? ''), msg: '', status: 'running' })
          setRows([...results])
        } else if (m.type === 'result') {
          const r = results[results.length - 1]
          r.status = m.ok ? 'pass' : 'fail'
          r.msg = String(m.msg ?? '')
          setRows([...results])
        }
      })
      setRunning(false)
      setInfos(infoLines)

      if (how === 'timeout') {
        const hung = results[results.length - 1]
        if (hung) hung.status = 'timeout'
        setRows([...results])
        attempt(false)
        const secs = timeout / 1000
        setMessage({
          tone: 'bad',
          text: hung ? (
            <>
              Still running after {secs} seconds on test <code>{hung.label}</code>. {hung.hang && md(hung.hang)} (The
              grader can't know whether your code will ever finish, so it gives up after a time limit.)
            </>
          ) : (
            `Your code ran for more than ${secs} seconds before any test started. Is there an endless loop outside your function?`
          ),
        })
        return
      }
      if (error) {
        setMessage({ tone: 'info', text: error })
        return
      }
      const failed = results.find((r) => r.status !== 'pass')
      const ok = results.length > 0 && !failed
      attempt(ok)
      setMessage(ok ? { tone: 'good', text: md(cfg.success) } : { tone: 'bad', text: md(failed?.msg || 'Some tests failed.') })
    }

    return (
      <div className="ex-widget">
        <CodeEditor value={code} onChange={setCode} onBlur={() => update({ draft: code })} label={cfg.label} />
        <div className="ex-row">
          <button className="btn small primary" onClick={run} disabled={running}>
            {running ? 'Running…' : '▶ Run the tests'}
          </button>
          <button
            className="linkish"
            onClick={() => {
              setCode(cfg.starter)
              update({ draft: cfg.starter })
              setRows([])
              setMessage(null)
              setLogs([])
            }}
          >
            reset code
          </button>
        </div>
        {logs.length > 0 && (
          <div className="ex-console">
            <div className="ex-console-label">console.log output</div>
            <pre className="mono">{logs.join('\n')}</pre>
          </div>
        )}
        {rows.length > 0 && (
          <div className="ex-tests">
            {rows.map((r, i) => (
              <span key={i} className={`ex-test ${r.status}`}>
                {r.status === 'pass' ? '✓' : r.status === 'running' ? '…' : r.status === 'timeout' ? '⏱' : '✗'} {r.label}
              </span>
            ))}
          </div>
        )}
        {message && <Feedback tone={message.tone}>{message.text}</Feedback>}
        {!running &&
          infos.map((t, i) => (
            <div key={i} className="ex-meta">
              {md(t)}
            </div>
          ))}
      </div>
    )
  }
}
