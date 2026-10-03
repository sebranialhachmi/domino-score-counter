// Tiny synthesized sound effects (Web Audio) — no audio files to download.
let ctx = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, { start = 0, duration = 0.06, volume = 0.05, type = 'sine' } = {}) {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export const sounds = {
  tap: () => tone(660, { duration: 0.04, volume: 0.03, type: 'triangle' }),
  add: () => {
    tone(523, { duration: 0.08 })
    tone(784, { start: 0.07, duration: 0.12 })
  },
  error: () => tone(180, { duration: 0.15, volume: 0.06, type: 'square' }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { start: i * 0.12, duration: 0.25, volume: 0.06 })),
}
