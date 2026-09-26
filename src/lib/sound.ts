/** Tiny synthesized "pops and dings" — no audio files needed. */
let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain = 0.08) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function ready(): boolean {
  if (!enabled) return false
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return true
  } catch {
    return false
  }
}

export const sounds = {
  correct() {
    if (!ready()) return
    tone(880, 0, 0.18, 'sine')
    tone(1318.5, 0.09, 0.3, 'sine')
  },
  wrong() {
    if (!ready()) return
    tone(196, 0, 0.22, 'triangle', 0.1)
    tone(155.6, 0.12, 0.3, 'triangle', 0.1)
  },
  pop() {
    if (!ready()) return
    tone(520, 0, 0.08, 'sine', 0.06)
  },
  fanfare() {
    if (!ready()) return
    ;[523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, i * 0.1, 0.35, 'sine', 0.07))
  },
}
