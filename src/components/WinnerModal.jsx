import { useMemo } from 'react'

const COLORS = ['#2dd4bf', '#fb923c', '#facc15', '#5eead4', '#fdba74', '#ffffff']

function Confetti({ count = 80 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.8 + Math.random() * 2.5,
        size: 6 + Math.random() * 7,
        drift: `${(Math.random() - 0.5) * 160}px`,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': p.drift,
          }}
        />
      ))}
    </div>
  )
}

export default function WinnerModal({
  winner,
  loser,
  winnerScore,
  loserScore,
  roundsCount,
  onNewGame,
  onChangeSettings,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <Confetti />
      <div className="glass animate-pop-in relative w-full max-w-sm overflow-hidden rounded-[2rem] p-6 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-400/25 to-transparent" />
        <div className="animate-trophy relative mb-1 text-7xl">🏆</div>
        <p className="relative text-sm font-bold text-amber-300">مبروك الفوز!</p>
        <h2 id="winner-title" className="relative mt-1 text-3xl font-black break-words text-white">
          {winner}
        </h2>

        <div className="relative my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-white/5 p-4">
          <div className="min-w-0">
            <div className="text-4xl font-black text-amber-300 tabular-nums">{winnerScore}</div>
            <div className="truncate text-xs text-slate-400">{winner}</div>
          </div>
          <div className="text-slate-600">—</div>
          <div className="min-w-0">
            <div className="text-4xl font-black text-slate-400 tabular-nums">{loserScore}</div>
            <div className="truncate text-xs text-slate-500">{loser}</div>
          </div>
          <div className="col-span-3 mt-1 text-xs text-slate-500">في {roundsCount} جولة</div>
        </div>

        <button
          type="button"
          onClick={onNewGame}
          autoFocus
          className="relative w-full rounded-2xl bg-gradient-to-l from-teal-400 to-emerald-400 py-4 text-xl font-black text-slate-950 shadow-lg shadow-teal-500/30 transition active:scale-[0.98]"
        >
          بدء لعبة جديدة
        </button>
        <div className="relative mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onChangeSettings}
            className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/10"
          >
            تغيير الفرق
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/10"
          >
            مراجعة الجولات
          </button>
        </div>
      </div>
    </div>
  )
}
