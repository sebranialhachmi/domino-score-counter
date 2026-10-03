import { useEffect, useMemo, useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import RoundInput from './components/RoundInput.jsx'
import RoundsTable from './components/RoundsTable.jsx'
import WinnerModal from './components/WinnerModal.jsx'

const STORAGE_KEY = 'domino-scoreboard:v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export default function App() {
  const saved = useMemo(loadState, [])
  const [settings, setSettings] = useState(saved?.settings ?? null)
  const [rounds, setRounds] = useState(saved?.rounds ?? [])
  const [dismissedWin, setDismissedWin] = useState(false)
  const [editingSetup, setEditingSetup] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, rounds }))
    } catch {
      // Storage unavailable (private mode) — the game still works in memory.
    }
  }, [settings, rounds])

  const totals = useMemo(
    () =>
      rounds.reduce(
        (acc, r) => [acc[0] + r.scores[0], acc[1] + r.scores[1]],
        [0, 0],
      ),
    [rounds],
  )

  // The winner is the team that reached the target; if both crossed it in the
  // same round, the higher total wins. An exact tie keeps the game going.
  const winnerIndex = useMemo(() => {
    if (!settings) return null
    const [a, b] = totals
    const t = settings.target
    if (a < t && b < t) return null
    if (a === b) return null
    return a > b ? 0 : 1
  }, [totals, settings])

  // Re-show the celebration whenever the winning state changes.
  useEffect(() => {
    setDismissedWin(false)
  }, [winnerIndex])

  const startGame = (newSettings) => {
    setSettings(newSettings)
    setRounds([])
    setEditingSetup(false)
  }

  // Apply new names/target but keep the rounds already played.
  const continueGame = (newSettings) => {
    setSettings(newSettings)
    setEditingSetup(false)
  }

  const addRound = (scores) => {
    setRounds((prev) => [...prev, { id: newId(), scores }])
  }

  const updateRound = (id, scores) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, scores } : r)))
  }

  const deleteRound = (id) => {
    setRounds((prev) => prev.filter((r) => r.id !== id))
  }

  const restart = () => setRounds([])

  const backToSetup = () => setEditingSetup(true)

  if (!settings || editingSetup) {
    return (
      <SetupScreen
        initial={settings}
        onStart={startGame}
        onContinue={settings && rounds.length > 0 ? continueGame : null}
        onCancel={settings ? () => setEditingSetup(false) : null}
      />
    )
  }

  const gameOver = winnerIndex !== null

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src="/domino.svg" alt="" className="h-8 w-8" />
          <h1 className="text-xl font-extrabold">حاسبة الدومينو</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            الهدف: {settings.target}
          </span>
          <button
            type="button"
            onClick={backToSetup}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 active:scale-95"
            aria-label="الإعدادات"
            title="الإعدادات"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <Scoreboard teams={settings.teams} totals={totals} target={settings.target} winnerIndex={winnerIndex} />

      <RoundInput teams={settings.teams} onAdd={addRound} disabled={gameOver} />

      {gameOver && dismissedWin && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm">
          <span className="font-semibold text-amber-200">
            🏆 فاز {settings.teams[winnerIndex]}
          </span>
          <button
            type="button"
            onClick={restart}
            className="rounded-xl bg-amber-400 px-3 py-1.5 font-bold text-slate-900 active:scale-95"
          >
            لعبة جديدة
          </button>
        </div>
      )}

      <RoundsTable teams={settings.teams} rounds={rounds} onUpdate={updateRound} onDelete={deleteRound} />

      {rounds.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (confirm('هل تريد مسح جميع الجولات وبدء لعبة جديدة؟')) restart()
          }}
          className="mx-auto mt-2 text-sm font-semibold text-slate-400 underline-offset-4 hover:text-rose-300 hover:underline"
        >
          إعادة تعيين اللعبة
        </button>
      )}

      {gameOver && !dismissedWin && (
        <WinnerModal
          winner={settings.teams[winnerIndex]}
          loser={settings.teams[1 - winnerIndex]}
          winnerScore={totals[winnerIndex]}
          loserScore={totals[1 - winnerIndex]}
          onNewGame={restart}
          onChangeSettings={backToSetup}
          onClose={() => setDismissedWin(true)}
        />
      )}
    </div>
  )
}
