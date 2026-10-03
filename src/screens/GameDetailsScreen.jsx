import Icon from '../components/Icon.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { TEAM_STYLES } from '../components/teamStyles.js'
import { summarizeGame } from '../lib/game.js'
import { usePrefs } from '../lib/prefs.jsx'

export default function GameDetailsScreen({ game, isCurrent, onBack, onResume, onRematch, onDelete }) {
  const { t, formatDate, formatDuration, formatNumber } = usePrefs()
  const { totals, winnerIndex, duration, perTeam } = summarizeGame(game)
  const finished = winnerIndex !== null

  let running = [0, 0]
  const rows = game.rounds.map((r, i) => {
    running = [running[0] + r.scores[0], running[1] + r.scores[1]]
    return { r, n: i + 1, running }
  })

  const info = [
    { icon: 'calendar', label: t('details.date'), value: formatDate(game.startedAt, { day: 'numeric', month: 'short' }) },
    { icon: 'clock', label: t('details.duration'), value: formatDuration(duration) },
    { icon: 'layers', label: t('details.rounds'), value: game.rounds.length },
    { icon: 'target', label: t('details.target'), value: game.target },
  ]

  const metrics = [
    { key: 'points', fmt: (p) => p.total },
    { key: 'roundsWon', fmt: (p) => p.roundsScored },
    { key: 'avgRound', fmt: (p) => (p.roundsScored ? formatNumber(p.avg, { maximumFractionDigits: 1 }) : '—') },
    { key: 'bestRound', fmt: (p) => p.best || '—' },
  ]

  return (
    <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <ScreenHeader title={t('details.title')} onBack={onBack} />

      <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {/* Final score */}
        <section className="glass relative overflow-hidden rounded-3xl p-4">
          {finished && <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-400/15 to-transparent" />}
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            {[0, 1].map((i) => (
              <div key={i} className={`min-w-0 ${i === 1 ? 'order-3' : ''}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${TEAM_STYLES[i].dot}`} />
                  <span className="truncate text-sm font-bold text-slate-300">{game.teams[i]}</span>
                </div>
                <div className={`mt-1 text-5xl font-black ${winnerIndex === i ? 'text-white' : 'text-slate-400'}`}>{totals[i]}</div>
                {winnerIndex === i && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-slate-900">
                    <Icon name="crown" className="h-3 w-3" strokeWidth={2.5} />
                    {t('card.winner')}
                  </span>
                )}
              </div>
            ))}
            <span className="order-2 text-sm font-bold text-slate-600">{t('common.vs')}</span>
          </div>
        </section>

        {/* Match facts */}
        <section className="grid grid-cols-4 gap-2">
          {info.map(({ icon, label, value }) => (
            <div key={label} className="glass flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-center">
              <Icon name={icon} className="h-4.5 w-4.5 text-slate-400" />
              <span className="w-full truncate text-sm font-extrabold text-slate-100">{value}</span>
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </section>

        {/* Per-team comparison (a table: two columns of numbers, read side by side) */}
        <section className="glass rounded-3xl p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-200">{t('details.perTeam')}</h2>
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="py-1 text-start font-semibold" />
                {[0, 1].map((i) => (
                  <th key={i} className="w-[30%] py-1 font-semibold">
                    <span className="flex items-center justify-center gap-1">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${TEAM_STYLES[i].dot}`} />
                      <span className="truncate">{game.teams[i]}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(({ key, fmt }) => (
                <tr key={key} className="border-t border-white/5">
                  <td className="py-2 text-slate-400">{t(`details.${key}`)}</td>
                  {perTeam.map((p, i) => (
                    <td key={i} className="py-2 text-center font-extrabold text-slate-100 tabular-nums">
                      {fmt(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Rounds */}
        <section className="glass rounded-3xl p-2">
          <h2 className="px-2 pt-1 pb-2 text-sm font-bold text-slate-200">
            {t('details.roundsList')} <span className="text-slate-500">({game.rounds.length})</span>
          </h2>
          <ol className="space-y-1">
            {rows.map(({ r, n, running }) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl bg-white/3 px-2.5 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/6 text-xs font-black text-slate-400 tabular-nums">
                  {n}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {[0, 1]
                    .filter((i) => r.scores[i] > 0)
                    .map((i) => (
                      <span key={i} className={`rounded-full px-2 py-0.5 text-xs font-bold ${TEAM_STYLES[i].soft}`}>
                        <span dir="ltr">+{r.scores[i]}</span> {game.teams[i]}
                      </span>
                    ))}
                </div>
                <span dir="ltr" className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
                  {running[0]} – {running[1]}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Actions */}
      <div className={`grid shrink-0 gap-2 ${isCurrent ? '' : 'grid-cols-[1fr_auto]'}`}>
        {finished ? (
          <PrimaryButton icon="reset" label={t('details.rematch')} onClick={onRematch} />
        ) : (
          <PrimaryButton icon="play" label={isCurrent ? t('details.goToGame') : t('details.resume')} onClick={onResume} />
        )}
        {!isCurrent && (
          <button
            type="button"
            onClick={() => confirm(t('details.confirmDelete')) && onDelete()}
            aria-label={t('details.delete')}
            title={t('details.delete')}
            className="grid w-14 place-items-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300 active:scale-95"
          >
            <Icon name="trash" className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

function PrimaryButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-400 to-emerald-400 py-3.5 font-black text-slate-950 shadow-lg shadow-teal-500/25 active:scale-[0.98]"
    >
      <Icon name={icon} className="h-5 w-5" strokeWidth={2.5} />
      {label}
    </button>
  )
}
