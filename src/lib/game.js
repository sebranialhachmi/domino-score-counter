export const STORAGE_KEY = 'domino-scoreboard:v1'
export const HISTORY_KEY = 'domino-scoreboard:history:v1'
export const PREFS_KEY = 'domino-scoreboard:prefs:v1'

export const MAX_ENTRY_DIGITS = 4

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode) — the app still works in memory.
  }
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Current game: { settings, rounds, gameId, startedAt }. Older saves only had
// settings + rounds, so fill in the identity fields.
export function loadState() {
  const s = read(STORAGE_KEY)
  if (!s) return null
  return {
    ...s,
    gameId: s.gameId ?? newId(),
    startedAt: s.startedAt ?? s.rounds?.[0]?.at ?? Date.now(),
  }
}

export const saveState = (state) => write(STORAGE_KEY, state)

export const loadHistory = () => read(HISTORY_KEY) ?? []
export const saveHistory = (games) => write(HISTORY_KEY, games)

export function clearAllStorage() {
  try {
    ;[STORAGE_KEY, HISTORY_KEY, PREFS_KEY].forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
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

// Summary used by the saved-games list, match details and statistics.
export function summarizeGame(game) {
  const totals = computeTotals(game.rounds)
  const winnerIndex = computeWinner(totals, game.target)
  const lastAt = game.rounds.reduce((m, r) => Math.max(m, r.at ?? 0), 0)
  const duration = lastAt && game.startedAt ? Math.max(0, lastAt - game.startedAt) : null
  const perTeam = [0, 1].map((i) => {
    const scored = game.rounds.map((r) => r.scores[i]).filter((s) => s > 0)
    return {
      total: totals[i],
      roundsScored: scored.length,
      best: scored.length ? Math.max(...scored) : 0,
      avg: scored.length ? totals[i] / scored.length : 0,
    }
  })
  return { totals, winnerIndex, duration, perTeam, endedAt: lastAt || game.updatedAt || game.startedAt }
}

const normalize = (name) => name.trim().toLowerCase()

export function computeStats(games) {
  const summaries = games.map((g) => ({ game: g, ...summarizeGame(g) }))
  const completed = summaries.filter((s) => s.winnerIndex !== null)
  const allRounds = summaries.flatMap((s) => s.game.rounds.map((r) => ({ r, s })))
  const roundPoints = allRounds.map(({ r }) => r.scores[0] + r.scores[1])

  let bestRound = null
  for (const { r, s } of allRounds) {
    for (const i of [0, 1]) {
      if (!bestRound || r.scores[i] > bestRound.points) {
        bestRound = { points: r.scores[i], name: s.game.teams[i], at: r.at ?? s.endedAt }
      }
    }
  }

  let biggestWin = null
  for (const s of completed) {
    const margin = s.totals[s.winnerIndex] - s.totals[1 - s.winnerIndex]
    if (!biggestWin || margin > biggestWin.margin) {
      biggestWin = { margin, name: s.game.teams[s.winnerIndex], at: s.endedAt }
    }
  }

  const longest = summaries.reduce(
    (m, s) => (!m || s.game.rounds.length > m.rounds ? { rounds: s.game.rounds.length, at: s.endedAt } : m),
    null,
  )

  const durations = completed.map((s) => s.duration).filter((d) => d)

  // Leaderboard keyed by team name (case/space-insensitive), first spelling wins.
  const teams = new Map()
  for (const s of summaries) {
    s.game.teams.forEach((name, i) => {
      const key = normalize(name)
      const entry = teams.get(key) ?? { name, played: 0, wins: 0, points: 0 }
      entry.points += s.totals[i]
      if (s.winnerIndex !== null) {
        entry.played += 1
        if (s.winnerIndex === i) entry.wins += 1
      }
      teams.set(key, entry)
    })
  }
  const leaderboard = [...teams.values()]
    .filter((t) => t.played > 0)
    .sort((a, b) => b.wins - a.wins || b.wins / b.played - a.wins / a.played || b.points - a.points)

  return {
    games: summaries.length,
    completed: completed.length,
    rounds: allRounds.length,
    avgRound: roundPoints.length ? roundPoints.reduce((a, b) => a + b, 0) / roundPoints.length : 0,
    bestRound: bestRound?.points ? bestRound : null,
    biggestWin,
    longest: longest?.rounds ? longest : null,
    avgDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    leaderboard,
  }
}
