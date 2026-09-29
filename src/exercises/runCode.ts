/**
 * Runs learner-written JavaScript in a Web Worker, so it can't freeze the page,
 * and stops it after a time limit. (We can't tell in advance whether it halts:
 * that's the halting problem!)
 */
export type WorkerMessage = { type: string; [k: string]: unknown }

export function runInWorker(
  harness: string,
  code: string,
  timeoutMs: number,
  onMessage: (m: WorkerMessage) => void,
): Promise<'done' | 'timeout'> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([harness], { type: 'text/javascript' }))
    const worker = new Worker(url)
    const finish = (how: 'done' | 'timeout') => {
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolve(how)
    }
    const timer = setTimeout(() => finish('timeout'), timeoutMs)
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      onMessage(e.data)
      if (e.data.type === 'done' || e.data.type === 'error') finish('done')
    }
    worker.onerror = (e) => {
      onMessage({ type: 'error', message: e.message })
      finish('done')
    }
    worker.postMessage({ code })
  })
}
