import { useCallback, useEffect, useRef, useState } from 'react'
import GameScreen from './screens/GameScreen.jsx'
import SavedGamesScreen from './screens/SavedGamesScreen.jsx'
import GameDetailsScreen from './screens/GameDetailsScreen.jsx'
import StatsScreen from './screens/StatsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import TabBar from './components/TabBar.jsx'
import Toast from './components/Toast.jsx'
import { PrefsProvider, usePrefs } from './lib/prefs.jsx'
import { clearAllStorage, loadHistory, loadState, newId, saveHistory, saveState } from './lib/game.js'

function freshGame(settings = null) {
  return { settings, rounds: [], gameId: newId(), startedAt: Date.now() }
}

export default function App() {
  return (
    <PrefsProvider>
      <Shell />
    </PrefsProvider>
  )
}

function Shell() {
  const { t, resetPrefs } = usePrefs()
  const [game, setGame] = useState(() => loadState() ?? freshGame())
  const [history, setHistory] = useState(loadHistory)
  const [tab, setTab] = useState('game')
  const [detailsId, setDetailsId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => saveState(game), [game])
  useEffect(() => saveHistory(history), [history])

  // The current game is mirrored into the saved-games list as soon as it has a
  // round, so it is never lost when a new game starts or the app closes.
  useEffect(() => {
    setHistory((prev) => {
      const rest = prev.filter((g) => g.id !== game.gameId)
      if (!game.settings || game.rounds.length === 0) {
        return rest.length === prev.length ? prev : rest
      }
      const entry = {
        id: game.gameId,
        teams: game.settings.teams,
        target: game.settings.target,
        rounds: game.rounds,
        startedAt: game.startedAt,
        updatedAt: Date.now(),
      }
      return [entry, ...rest].sort((a, b) => b.startedAt - a.startedAt)
    })
  }, [game])

  const showToast = useCallback((next) => {
    clearTimeout(toastTimer.current)
    setToast(next)
    toastTimer.current = setTimeout(() => setToast(null), next.duration ?? 4000)
  }, [])

  const setRounds = useCallback((fn) => setGame((g) => ({ ...g, rounds: fn(g.rounds) })), [])
  const startGame = useCallback((settings) => setGame(freshGame(settings)), [])
  const updateSettings = useCallback((settings) => setGame((g) => ({ ...g, settings })), [])
  const restart = useCallback(() => setGame((g) => freshGame(g.settings)), [])

  const openGame = (next) => {
    setGame(next)
    setDetailsId(null)
    setTab('game')
  }

  const resumeGame = (saved) => {
    openGame({
      settings: { teams: saved.teams, target: saved.target },
      rounds: saved.rounds,
      gameId: saved.id,
      startedAt: saved.startedAt,
    })
    showToast({ message: t('details.resumed') })
  }

  const rematch = (saved) => openGame(freshGame({ teams: saved.teams, target: saved.target }))

  const deleteGame = (id) => {
    const index = history.findIndex((g) => g.id === id)
    const removed = history[index]
    setHistory((prev) => prev.filter((g) => g.id !== id))
    setDetailsId(null)
    showToast({
      message: t('details.deleted'),
      action: {
        label: t('common.undo'),
        run: () =>
          setHistory((prev) => {
            const next = [...prev]
            next.splice(index, 0, removed)
            return next
          }),
      },
    })
  }

  const clearHistory = () => {
    setHistory((prev) => prev.filter((g) => g.id === game.gameId))
    showToast({ message: t('settings.historyCleared') })
  }

  const resetAll = () => {
    clearAllStorage()
    resetPrefs()
    setHistory([])
    setGame(freshGame())
    setDetailsId(null)
    setTab('game')
  }

  const changeTab = (next) => {
    setTab(next)
    if (next !== 'saved') setDetailsId(null)
  }

  const detailsGame = detailsId ? history.find((g) => g.id === detailsId) : null

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {/* The game stays mounted so a half-typed entry survives tab switches. */}
        <div className={tab === 'game' ? 'h-full' : 'hidden'}>
          <GameScreen
            active={tab === 'game'}
            game={game}
            setRounds={setRounds}
            startGame={startGame}
            updateSettings={updateSettings}
            restart={restart}
            showToast={showToast}
          />
        </div>

        {tab === 'saved' &&
          (detailsGame ? (
            <GameDetailsScreen
              game={detailsGame}
              isCurrent={detailsGame.id === game.gameId}
              onBack={() => setDetailsId(null)}
              onResume={() => (detailsGame.id === game.gameId ? setTab('game') : resumeGame(detailsGame))}
              onRematch={() => rematch(detailsGame)}
              onDelete={() => deleteGame(detailsGame.id)}
            />
          ) : (
            <SavedGamesScreen games={history} currentId={game.gameId} onOpen={setDetailsId} />
          ))}

        {tab === 'stats' && <StatsScreen games={history} />}

        {tab === 'settings' && <SettingsScreen onClearHistory={clearHistory} onResetAll={resetAll} />}
      </main>

      <TabBar tab={tab} onChange={changeTab} />

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
