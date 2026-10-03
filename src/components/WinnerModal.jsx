import { useMemo } from 'react'

const COLORS = ['#f59e0b', '#10b981', '#38bdf8', '#f43f5e', '#a78bfa', '#facc15', '#ffffff']

function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.8 + Math.random() * 2.5,
        size: 6 + Math.random() * 8,
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

export default function WinnerModal({ winner, loser, winnerScore, loserScore, onNewGame, onChangeSettings, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <Confetti />
      <div className="animate-pop-in relative w-full max-w-sm rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 p-6 text-center shadow-2xl shadow-amber-500/20">
        <div className="animate-trophy mb-2 text-7xl">🏆</div>
        <p className="text-sm font-bold text-amber-300">مبروك الفوز!</p>
        <h2 id="winner-title" className="mt-1 text-3xl font-black break-words text-white">
          {winner}
        </h2>

        <div className="my-5 flex items-center justify-center gap-4 rounded-2xl bg-slate-950/60 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-4xl font-black text-amber-300 tabular-nums">{winnerScore}</div>
            <div className="truncate text-xs text-slate-400">{winner}</div>
          </div>
          <div className="text-slate-600">—</div>
          <div className="min-w-0 flex-1">
            <div className="text-4xl font-black text-slate-400 tabular-nums">{loserScore}</div>
            <div className="truncate text-xs text-slate-500">{loser}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewGame}
          autoFocus
          className="w-full rounded-2xl bg-amber-400 py-4 text-xl font-black text-slate-950 shadow-lg shadow-amber-400/30 transition active:scale-[0.98]"
        >
          بدء لعبة جديدة
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onChangeSettings}
            className="rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-700"
          >
            تغيير الفرق
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-700"
          >
            مراجعة الجولات
          </button>
        </div>
      </div>
    </div>
  )
}
