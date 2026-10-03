export const STORAGE_KEY = 'domino-scoreboard:v1'

export const MAX_ENTRY_DIGITS = 4

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode) — the game still works in memory.
  }
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function computeTotals(rounds) {
  return rounds.reduce((acc, r) => [acc[0] + r.scores[0], acc[1] + r.scores[1]], [0, 0])
}

// The winner is the team that reached the target; if both crossed it in the
// same round, the higher total wins. An exact tie keeps the game going.
export function computeWinner(totals, target) {
  const [a, b] = totals
  if (a < target && b < target) return null
  if (a === b) return null
  return a > b ? 0 : 1
}

export function entryToNumber(value) {
  return value === '' ? 0 : Number(value)
}

// Light haptic tick on devices that support it.
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // ignore
  }
}
