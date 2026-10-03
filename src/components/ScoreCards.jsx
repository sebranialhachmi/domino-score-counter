import Icon from './Icon.jsx'
import { TEAM_STYLES } from './teamStyles.js'
import { usePrefs } from '../lib/prefs.jsx'

export default function ScoreCards({ teams, totals, target, winnerIndex, selected, onSelect }) {
  const { t } = usePrefs()
  const leader = totals[0] === totals[1] ? null : totals[0] > totals[1] ? 0 : 1

  return (
    <section className="grid shrink-0 grid-cols-2 gap-3 pt-3">
      {teams.map((name, i) => {
        const style = TEAM_STYLES[i]
        const progress = Math.min(100, (totals[i] / target) * 100)
        const remaining = Math.max(0, target - totals[i])
        const isSelected = selected === i
        const long = String(totals[i]).length >= 4
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={isSelected}
            aria-label={t('card.aria', { name, score: totals[i], target })}
            className={`glass relative rounded-3xl px-3.5 pt-4 pb-3 text-start short:pt-3 short:pb-2.5 transition active:scale-[0.98] ${
              isSelected ? `ring-2 ${style.ring}` : ''
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b ${style.glow} to-transparent opacity-60`}
            />

            {(winnerIndex === i || (winnerIndex === null && leader === i)) && (
              <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-l from-amber-300 to-yellow-400 px-2.5 py-0.5 text-[11px] font-extrabold whitespace-nowrap text-slate-900 shadow-lg shadow-amber-500/30">
                <Icon name="crown" className="h-3 w-3" strokeWidth={2.5} />
                {winnerIndex === i ? t('card.winner') : t('card.leading')}
              </span>
            )}

            <div className="relative flex items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
              <h2 className="truncate text-sm font-bold text-slate-300" title={name}>
                {name}
              </h2>
            </div>

            <div className="relative mt-1 text-start">
              <span dir="ltr" className="inline-flex items-baseline gap-1">
              <span
                key={totals[i]}
                className={`animate-bump leading-none font-black text-white ${
                  long ? 'text-[clamp(1.875rem,min(10vw,6.5dvh),3rem)]' : 'text-[clamp(2.25rem,min(13vw,8dvh),3.75rem)]'
                }`}
              >
                {totals[i]}
              </span>
              <span className="text-base font-bold text-white/35 tabular-nums">/{target}</span>
              </span>
            </div>

            <div
              className="relative mt-3 h-2.5 overflow-hidden short:mt-2 rounded-full bg-white/8"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={target}
              aria-valuenow={Math.min(totals[i], target)}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-l transition-[width] duration-700 ease-out ${style.bar} ${
                  progress === 0 ? 'opacity-0' : ''
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className={`relative mt-1.5 text-xs font-semibold ${remaining > 0 ? 'text-slate-400' : style.text}`}>
              {remaining > 0 ? t('card.remaining', { n: remaining }) : t('card.reached')}
            </p>
          </button>
        )
      })}
    </section>
  )
}
