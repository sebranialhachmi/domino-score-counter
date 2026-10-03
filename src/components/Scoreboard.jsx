import { TEAM_STYLES } from './teamStyles.js'

export default function Scoreboard({ teams, totals, target, winnerIndex }) {
  const leader = totals[0] === totals[1] ? null : totals[0] > totals[1] ? 0 : 1

  return (
    <section className="grid grid-cols-2 gap-3">
      {teams.map((name, i) => {
        const style = TEAM_STYLES[i]
        const progress = Math.min(100, (totals[i] / target) * 100)
        const remaining = Math.max(0, target - totals[i])
        const digits = String(totals[i]).length
        const size = digits >= 4 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl'
        return (
          <div
            key={i}
            className={`overflow-hidden rounded-3xl border p-4 text-center ${style.card} ${
              winnerIndex === i ? 'ring-4 ring-amber-400' : ''
            }`}
          >
            <div className="mb-1 h-5">
              {leader === i && winnerIndex === null && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-900">
                  متقدم
                </span>
              )}
              {winnerIndex === i && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-900">
                  🏆 الفائز
                </span>
              )}
            </div>
            <h2 className="truncate text-base font-bold text-slate-200" title={name}>
              {name}
            </h2>
            <div
              key={totals[i]}
              className={`animate-bump my-1 ${size} leading-tight font-black tabular-nums ${style.text}`}
            >
              {totals[i]}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${style.bar} ${progress === 0 ? 'opacity-0' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {remaining > 0 ? `باقي ${remaining}` : 'وصل للهدف'}
            </p>
          </div>
        )
      })}
    </section>
  )
}
