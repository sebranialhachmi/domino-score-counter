import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { TEAM_STYLES } from '../components/teamStyles.js'
import { summarizeGame } from '../lib/game.js'
import { usePrefs } from '../lib/prefs.jsx'

const FILTERS = ['all', 'completed', 'unfinished']

export default function SavedGamesScreen({ games, currentId, onOpen }) {
  const { t } = usePrefs()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => games.map((g) => ({ game: g, ...summarizeGame(g) })), [games])

  const visible = items.filter(({ game, winnerIndex }) => {
    if (filter === 'completed' && winnerIndex === null) return false
    if (filter === 'unfinished' && winnerIndex !== null) return false
    const q = query.trim().toLowerCase()
    return !q || game.teams.some((n) => n.toLowerCase().includes(q))
  })

  return (
    <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <ScreenHeader title={t('saved.title')}>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-400 tabular-nums">{games.length}</span>
      </ScreenHeader>

      {games.length === 0 ? (
        <EmptyState icon="archive" title={t('saved.empty')} hint={t('saved.emptyHint')} />
      ) : (
        <>
          <label className="glass flex shrink-0 items-center gap-2 rounded-2xl px-3">
            <Icon name="search" className="h-4.5 w-4.5 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('saved.search')}
              aria-label={t('saved.search')}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-500"
            />
          </label>

          <div className="grid shrink-0 grid-cols-3 gap-1 rounded-2xl bg-white/4 p-1" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-xl py-1.5 text-xs font-bold transition ${
                  filter === f ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(`saved.${f}`)}
              </button>
            ))}
          </div>

          <ul className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2">
            {visible.length === 0 && <li className="py-10 text-center text-sm text-slate-500">{t('saved.noMatch')}</li>}
            {visible.map((item) => (
              <li key={item.game.id}>
                <GameCard item={item} isCurrent={item.game.id === currentId} onOpen={() => onOpen(item.game.id)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function GameCard({ item, isCurrent, onOpen }) {
  const { t, formatDate } = usePrefs()
  const { game, totals, winnerIndex, endedAt } = item
  const status =
    winnerIndex !== null
      ? { label: t('saved.status.completed'), cls: 'bg-teal-400/15 text-teal-200' }
      : isCurrent
        ? { label: t('saved.current'), cls: 'bg-sky-400/15 text-sky-200' }
        : { label: t('saved.status.unfinished'), cls: 'bg-white/8 text-slate-300' }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-start transition active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1 space-y-1">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${TEAM_STYLES[i].dot}`} />
            <span className={`min-w-0 flex-1 truncate text-sm ${winnerIndex === i ? 'font-extrabold text-white' : 'font-semibold text-slate-300'}`}>
              {game.teams[i]}
              {winnerIndex === i && ' 🏆'}
            </span>
            <span className={`text-lg font-black tabular-nums ${winnerIndex === i ? 'text-white' : 'text-slate-400'}`}>
              {totals[i]}
            </span>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px] whitespace-nowrap text-slate-500">
          <span className={`rounded-full px-2 py-0.5 font-bold ${status.cls}`}>{status.label}</span>
          <span>{formatDate(endedAt)}</span>
          <span>·</span>
          <span>
            {game.rounds.length} {t('common.rounds')}
          </span>
          <span>·</span>
          <span>
            {t('common.target')} {game.target}
          </span>
        </div>
      </div>
      <Icon name="chevron" className="h-4 w-4 shrink-0 text-slate-500 ltr:rotate-180" />
    </button>
  )
}

export function EmptyState({ icon, title, hint }) {
  return (
    <div className="glass flex flex-1 flex-col items-center justify-center gap-2 rounded-3xl p-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-400">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <p className="font-bold text-slate-200">{title}</p>
      <p className="max-w-60 text-sm text-slate-500">{hint}</p>
    </div>
  )
}
