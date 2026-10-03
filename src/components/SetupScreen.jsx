import { useState } from 'react'
import Icon from './Icon.jsx'
import { TEAM_STYLES } from './teamStyles.js'

const PRESETS = [100, 150, 200, 250, 500]
const STEP = 25
const MIN_TARGET = 25
const MAX_TARGET = 2000

export default function SetupScreen({ initial, onStart, onContinue, onCancel }) {
  const [names, setNames] = useState([initial?.teams?.[0] ?? '', initial?.teams?.[1] ?? ''])
  const [target, setTarget] = useState(initial?.target ?? 200)

  const build = () => ({
    teams: [names[0].trim() || 'الفريق الأول', names[1].trim() || 'الفريق الثاني'],
    target,
  })

  const step = (delta) => setTarget((t) => Math.min(MAX_TARGET, Math.max(MIN_TARGET, t + delta)))

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="text-center">
        <div className="glass mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl">
          <img src="/domino.svg" alt="" className="h-12 w-12 -rotate-12" />
        </div>
        <h1 className="text-3xl font-black">حاسبة نقاط الدومينو</h1>
        <p className="mt-1.5 text-sm text-slate-400">سمِّ الفريقين وحدد نقاط الفوز ثم ابدأ</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onStart(build())
        }}
        className="glass space-y-6 rounded-3xl p-5"
      >
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <label key={i} className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className={`h-2 w-2 rounded-full ${TEAM_STYLES[i].dot}`} />
                {i === 0 ? 'الفريق الأول' : 'الفريق الثاني'}
              </span>
              <input
                type="text"
                value={names[i]}
                maxLength={24}
                enterKeyHint="next"
                onChange={(e) => setNames((n) => n.map((v, j) => (j === i ? e.target.value : v)))}
                placeholder={i === 0 ? 'مثال: أحمد ومحمد' : 'مثال: علي وخالد'}
                className={`w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3.5 text-lg font-semibold outline-none placeholder:text-slate-600 focus:ring-2 ${TEAM_STYLES[i].ring}`}
              />
            </label>
          ))}
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold text-slate-400">نقاط الفوز</span>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTarget(p)}
                aria-pressed={target === p}
                className={`rounded-xl py-2.5 text-base font-extrabold tabular-nums transition active:scale-95 ${
                  target === p
                    ? 'bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Custom target without the system keyboard */}
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/4 p-1.5">
            <StepButton label="زيادة" icon="plus" onClick={() => step(STEP)} disabled={target >= MAX_TARGET} />
            <div className="flex-1 text-center">
              <div className="text-3xl font-black text-white tabular-nums">{target}</div>
              <div className="text-[11px] text-slate-500">رقم مخصص (±{STEP})</div>
            </div>
            <StepButton label="إنقاص" icon="minus" onClick={() => step(-STEP)} disabled={target <= MIN_TARGET} />
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-l from-teal-400 to-emerald-400 py-4 text-xl font-black text-slate-950 shadow-lg shadow-teal-500/25 transition active:scale-[0.98]"
          >
            {onContinue ? 'بدء لعبة جديدة' : 'ابدأ اللعب'}
          </button>
          {onContinue && (
            <button
              type="button"
              onClick={() => onContinue(build())}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-bold text-slate-100 transition hover:bg-white/10 active:scale-[0.98]"
            >
              حفظ ومتابعة اللعبة الحالية
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-200">
              رجوع بدون تغيير
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function StepButton({ label, icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-xl bg-white/8 text-slate-200 transition active:scale-90 disabled:opacity-30"
    >
      <Icon name={icon} className="h-5 w-5" strokeWidth={2.5} />
    </button>
  )
}
