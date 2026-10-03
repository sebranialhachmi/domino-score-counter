import { useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { EmptyState } from './SavedGamesScreen.jsx'
import { computeStats } from '../lib/game.js'
import { usePrefs } from '../lib/prefs.jsx'

export default function StatsScreen({ games }) {
  const { t, formatDate, formatDuration, formatNumber } = usePrefs()
  const stats = useMemo(() => computeStats(games), [games])

  if (stats.games === 0) {
    return (
      <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <ScreenHeader title={t('stats.title')} />
        <EmptyState icon="chart" title={t('stats.empty')} hint={t('stats.emptyHint')} />
      </div>
    )
  }

  const tiles = [
    { label: t('stats.games'), value: formatNumber(stats.games) },
    { label: t('stats.completed'), value: formatNumber(stats.completed) },
    { label: t('stats.rounds'), value: formatNumber(stats.rounds) },
    { label: t('stats.avgRound'), value: formatNumber(stats.avgRound, { maximumFractionDigits: 1 }) },
  ]

  const highlights = [
    stats.bestRound && {
      icon: 'trophy',
      label: t('stats.bestRound'),
      value: stats.bestRound.points,
      sub: t('stats.bestRoundBy', { name: stats.bestRound.name, date: formatDate(stats.bestRound.at) }),
    },
    stats.biggestWin && {
      icon: 'target',
      label: t('stats.biggestWin'),
      value: `+${stats.biggestWin.margin}`,
      ltr: true,
      sub: t('stats.bestRoundBy', { name: stats.biggestWin.name, date: formatDate(stats.biggestWin.at) }),
    },
    stats.longest && {
      icon: 'layers',
      label: t('stats.longestGame'),
      value: t('stats.longestGameValue', { n: stats.longest.rounds }),
      sub: formatDate(stats.longest.at),
    },
    stats.avgDuration && {
      icon: 'clock',
      label: t('stats.avgDuration'),
      value: formatDuration(stats.avgDuration),
    },
  ].filter(Boolean)

  return (
    <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <ScreenHeader title={t('stats.title')} />

      <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {/* Stat tiles: label on top, value below in proportional figures */}
        <section className="grid grid-cols-2 gap-2">
          {tiles.map(({ label, value }) => (
            <div key={label} className="glass rounded-2xl p-3.5">
              <div className="text-xs font-semibold text-slate-400">{label}</div>
              <div className="mt-1 text-3xl font-black text-white">{value}</div>
            </div>
          ))}
        </section>

        {highlights.length > 0 && (
          <section className="glass rounded-3xl p-2">
            <h2 className="px-2 pt-1 pb-2 text-sm font-bold text-slate-200">{t('stats.highlights')}</h2>
            <ul className="space-y-1">
              {highlights.map(({ icon, label, value, sub, ltr }) => (
                <li key={label} className="flex items-center gap-3 rounded-xl bg-white/3 px-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-300">
                    <Icon name={icon} className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-300">{label}</div>
                    {sub && <div className="truncate text-xs text-slate-500">{sub}</div>}
                  </div>
                  <span dir={ltr ? 'ltr' : undefined} className="shrink-0 text-xl font-black text-white">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="glass rounded-3xl p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-200">{t('stats.leaderboard')}</h2>
            <span className="text-[11px] text-slate-500">{t('stats.leaderboardHint')}</span>
          </div>
          {stats.leaderboard.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">{t('stats.noWinners')}</p>
          ) : (
            <ol className="space-y-3">
              {stats.leaderboard.map((team, idx) => {
                const rate = team.played ? team.wins / team.played : 0
                const pct = formatNumber(rate, { style: 'percent', maximumFractionDigits: 0 })
                return (
                  <li key={team.name} className="flex items-center gap-3">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${
                        idx === 0 ? 'bg-amber-400 text-slate-900' : 'bg-white/6 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-bold text-slate-100">{team.name}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          <span className="font-extrabold text-slate-100">{team.wins}</span> {t('stats.wins')} ·{' '}
                          {team.played} {t('stats.played')}
                        </span>
                      </div>
                      {/* Win-rate meter: fill and track are steps of the same teal ramp */}
                      <div
                        className="mt-1.5 flex items-center gap-2"
                        title={`${t('stats.winRate')}: ${pct}`}
                        role="meter"
                        aria-label={`${team.name} — ${t('stats.winRate')}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(rate * 100)}
                      >
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-teal-900/50">
                          <div
                            className="h-full rounded-full bg-teal-600 transition-[width] duration-700"
                            style={{ width: `${rate * 100}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-end text-xs font-bold text-slate-300 tabular-nums">{pct}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
