/**
 * Helpers available to every test script. A test script defines
 * `function __run(code)`, which loads the learner's code with `__load`
 * and runs tests with `__test`. It runs in a Web Worker.
 */
export const PRELUDE = String.raw`
const __show = (v, top = true) => {
  if (typeof v === 'string') return top ? v : JSON.stringify(v)
  if (v === undefined) return 'undefined'
  if (Object.prototype.toString.call(v) === '[object Generator]') return '[a paused run: call .next() on it]'
  if (typeof v === 'function') return '[function ' + (v.name || 'anonymous') + ']'
  if (Array.isArray(v)) return '[' + v.map((x) => __show(x, false)).join(', ') + ']'
  if (v && typeof v === 'object') return '{ ' + Object.keys(v).map((k) => k + ': ' + __show(v[k], false)).join(', ') + ' }'
  return String(v)
}
let __logs = 0
console.log = (...args) => {
  if (__logs++ < 100) postMessage({ type: 'log', text: args.map((a) => __show(a)).join(' ') })
}
// Compile the learner's code, with 'env' in scope, and return the named functions.
const __load = (code, env, names) => {
  const keys = Object.keys(env)
  let fns
  try {
    const ret = '\n;return {' + names.map((n) => n + ': typeof ' + n + ' === "undefined" ? undefined : ' + n).join(', ') + '};'
    fns = new Function(...keys, code + ret)(...keys.map((k) => env[k]))
  } catch (err) {
    postMessage({ type: 'error', message: 'Your code has an error: ' + ((err && err.message) || err) })
    return null
  }
  for (const n of names) {
    if (typeof fns[n] !== 'function') {
      postMessage({ type: 'error', message: 'Define a function called ' + n + '.' })
      return null
    }
  }
  return fns
}
// Run one test. fn returns { ok, msg }. 'hang' explains a timeout on this test.
const __test = (label, hang, fn) => {
  postMessage({ type: 'start', label, hang })
  let r
  try {
    r = fn()
  } catch (err) {
    r = { ok: false, msg: 'Your code threw an error: ' + ((err && err.message) || err) }
  }
  postMessage({ type: 'result', label, ok: !!r.ok, msg: r.msg || '' })
}
// Step a paused run at most 'cap' times.
const __steps = (run, cap) => {
  for (let i = 0; i < cap; i++) {
    const s = run.next()
    if (s.done) return { halted: true, steps: i + 1, value: s.value }
  }
  return { halted: false }
}
const __info = (text) => postMessage({ type: 'info', text })
self.onmessage = (e) => {
  try {
    __run(e.data.code)
  } catch (err) {
    postMessage({ type: 'error', message: 'The grader hit an error: ' + ((err && err.message) || err) })
  }
  postMessage({ type: 'done' })
}
`
