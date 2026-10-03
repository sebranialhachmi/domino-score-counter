import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import ScoreCards from './components/ScoreCards.jsx'
import RoundHistory from './components/RoundHistory.jsx'
import Keypad from './components/Keypad.jsx'
import WinnerModal from './components/WinnerModal.jsx'
import Toast from './components/Toast.jsx'
import Icon from './components/Icon.jsx'
import {
  MAX_ENTRY_DIGITS,
  computeTotals,
  computeWinner,
  entryToNumber,
  haptic,
  loadState,
  newId,
  saveState,
} from './lib/game.js'

const EMPTY_ENTRIES = ['', '']

export default function App() {
  const saved = useMemo(loadState, [])
  const [settings, setSettings] = useState(saved?.settings ?? null)
  const [rounds, setRounds] = useState(saved?.rounds ?? [])
  const [dismissedWin, setDismissedWin] = useState(false)
  const [editingSetup, setEditingSetup] = useState(false)

  // Keypad state: one pending entry per team, and which team the keys type into.
  const [entries, setEntries] = useState(EMPTY_ENTRIES)
  const [selected, setSelected] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => saveState({ settings, rounds }), [settings, rounds])

  const totals = useMemo(() => computeTotals(rounds), [rounds])
  const winnerIndex = settings ? computeWinner(totals, settings.target) : null
  const gameOver = winnerIndex !== null
  const editingNumber = editingId ? rounds.findIndex((r) => r.id === editingId) + 1 || null : null

  // Re-show the celebration whenever the winning state changes.
  useEffect(() => setDismissedWin(false), [winnerIndex])

  const showToast = useCallback((next) => {
    clearTimeout(toastTimer.current)
    setToast(next)
    toastTimer.current = setTimeout(() => setToast(null), next.duration ?? 4000)
  }, [])

  const resetEntry = () => {
    setEntries(EMPTY_ENTRIES)
    setEditingId(null)
  }

  const updateEntry = useCallback(
    (fn) => {
      haptic()
      setEntries((prev) => prev.map((v, i) => (i === selected ? fn(v) : v)))
    },
    [selected],
  )

  const pressDigit = useCallback(
    (d) =>
      updateEntry((v) => {
        if (v.length >= MAX_ENTRY_DIGITS) return v
        return v === '0' || v === '' ? (d === '0' ? '' : d) : v + d
      }),
    [updateEntry],
  )
  const pressBackspace = useCallback(() => updateEntry((v) => v.slice(0, -1)), [updateEntry])
  const pressClear = useCallback(() => updateEntry(() => ''), [updateEntry])
  const pressQuick = (n) =>
    updateEntry((v) => String(Math.min(10 ** MAX_ENTRY_DIGITS - 1, entryToNumber(v) + n)))

  const submit = useCallback(() => {
    const scores = entries.map(entryToNumber)
    if (scores[0] === 0 && scores[1] === 0) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      haptic(30)
      return
    }
    haptic(15)
    if (editingId) {
      setRounds((prev) => prev.map((r) => (r.id === editingId ? { ...r, scores } : r)))
      showToast({ message: 'تم حفظ التعديل' })
    } else {
      setRounds((prev) => [...prev, { id: newId(), scores }])
    }
    resetEntry()
  }, [entries, editingId, showToast])

  const startEdit = (round) => {
    setEditingId(round.id)
    setEntries(round.scores.map((s) => (s > 0 ? String(s) : '')))
    setSelected(round.scores[0] > 0 || round.scores[1] === 0 ? 0 : 1)
  }

  const deleteRound = (round) => {
    const index = rounds.findIndex((r) => r.id === round.id)
    setRounds((prev) => prev.filter((r) => r.id !== round.id))
    if (editingId === round.id) resetEntry()
    showToast({
      message: `حُذفت الجولة ${index + 1}`,
      action: {
        label: 'تراجع',
        run: () =>
          setRounds((prev) => {
            const next = [...prev]
            next.splice(index, 0, round)
            return next
          }),
      },
    })
  }

  const restart = () => {
    setRounds([])
    resetEntry()
  }

  const keypadDisabled = gameOver && !editingId
  const setupOpen = !settings || editingSetup
  const modalOpen = gameOver && !dismissedWin

  // Physical keyboard support (desktop / tablets with keyboards).
  useEffect(() => {
    if (setupOpen || modalOpen) return
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape' && editingId) return resetEntry()
      if (keypadDisabled) return
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key)
      else if (e.key === 'Backspace') pressBackspace()
      else if (e.key === 'Enter') submit()
      else if (e.key === 'Tab') {
        e.preventDefault()
        setSelected((s) => 1 - s)
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setupOpen, modalOpen, keypadDisabled, editingId, pressDigit, pressBackspace, submit])

  if (setupOpen) {
    return (
      <SetupScreen
        initial={settings}
        onStart={(s) => {
          setSettings(s)
          restart()
          setEditingSetup(false)
        }}
        onContinue={
          settings && rounds.length > 0
            ? (s) => {
                setSettings(s)
                setEditingSetup(false)
              }
            : null
        }
        onCancel={settings ? () => setEditingSetup(false) : null}
      />
    )
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col gap-3 px-3 short:gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/domino.svg" alt="" className="h-7 w-7 -rotate-12" />
          <h1 className="truncate text-lg font-extrabold max-[359px]:hidden">حاسبة الدومينو</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
            الهدف <span className="text-teal-300 tabular-nums">{settings.target}</span>
          </span>
          <HeaderButton
            label="لعبة جديدة"
            icon="reset"
            disabled={rounds.length === 0}
            onClick={() => {
              if (confirm('بدء لعبة جديدة ومسح جميع الجولات؟')) restart()
            }}
          />
          <HeaderButton label="الإعدادات" icon="settings" onClick={() => setEditingSetup(true)} />
        </div>
      </header>

      <ScoreCards
        teams={settings.teams}
        totals={totals}
        target={settings.target}
        winnerIndex={winnerIndex}
        selected={selected}
        onSelect={(i) => !keypadDisabled && setSelected(i)}
      />

      <RoundHistory
        teams={settings.teams}
        rounds={rounds}
        editingId={editingId}
        onEdit={startEdit}
        onDelete={deleteRound}
      />

      {gameOver && dismissedWin && !editingId && (
        <div className="glass flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm">
          <span className="truncate font-bold text-amber-200">🏆 فاز {settings.teams[winnerIndex]}</span>
          <button
            type="button"
            onClick={restart}
            className="shrink-0 rounded-xl bg-amber-400 px-3 py-1.5 font-extrabold text-slate-900 active:scale-95"
          >
            لعبة جديدة
          </button>
        </div>
      )}

      <Keypad
        teams={settings.teams}
        selected={selected}
        onSelect={setSelected}
        entries={entries}
        onDigit={pressDigit}
        onBackspace={pressBackspace}
        onClear={pressClear}
        onQuick={pressQuick}
        onSubmit={submit}
        editingNumber={editingNumber}
        onCancelEdit={resetEntry}
        disabled={keypadDisabled}
        shake={shake}
      />

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {modalOpen && (
        <WinnerModal
          winner={settings.teams[winnerIndex]}
          loser={settings.teams[1 - winnerIndex]}
          winnerScore={totals[winnerIndex]}
          loserScore={totals[1 - winnerIndex]}
          roundsCount={rounds.length}
          onNewGame={restart}
          onChangeSettings={() => setEditingSetup(true)}
          onClose={() => setDismissedWin(true)}
        />
      )}
    </div>
  )
}

function HeaderButton({ label, icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-90 disabled:opacity-30"
    >
      <Icon name={icon} className="h-4.5 w-4.5" />
    </button>
  )
}
