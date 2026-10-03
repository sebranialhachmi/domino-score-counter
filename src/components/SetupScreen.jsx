import { useState } from 'react'

const PRESETS = [100, 150, 200, 500]

export default function SetupScreen({ initial, onStart, onContinue, onCancel }) {
  const [teamA, setTeamA] = useState(initial?.teams?.[0] ?? '')
  const [teamB, setTeamB] = useState(initial?.teams?.[1] ?? '')
  const [target, setTarget] = useState(String(initial?.target ?? 100))

  const targetNum = Number(target)
  const targetValid = Number.isInteger(targetNum) && targetNum > 0

  const build = () => ({
    teams: [teamA.trim() || 'الفريق الأول', teamB.trim() || 'الفريق الثاني'],
    target: targetNum,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (targetValid) onStart(build())
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <img src="/domino.svg" alt="" className="mx-auto mb-3 h-16 w-16 rotate-12" />
        <h1 className="text-3xl font-black">حاسبة نقاط الدومينو</h1>
        <p className="mt-2 text-slate-400">أدخل أسماء الفريقين وحدد نقاط الفوز</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/40"
      >
        <div className="space-y-4">
          <TeamField
            label="الفريق الأول"
            color="bg-sky-500"
            value={teamA}
            onChange={setTeamA}
            placeholder="مثال: أحمد ومحمد"
          />
          <TeamField
            label="الفريق الثاني"
            color="bg-rose-500"
            value={teamB}
            onChange={setTeamB}
            placeholder="مثال: علي وخالد"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-bold text-slate-300">حد النقاط للفوز</span>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTarget(String(p))}
                className={`rounded-xl py-3 text-lg font-extrabold transition active:scale-95 ${
                  targetNum === p
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-3 text-sm text-slate-400">
            <span className="shrink-0">أو رقم مخصص:</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-center text-lg font-bold text-slate-100 outline-none focus:border-emerald-400"
            />
          </label>
          {!targetValid && <p className="mt-2 text-sm text-rose-400">أدخل رقماً صحيحاً أكبر من صفر</p>}
        </div>

        <button
          type="submit"
          disabled={!targetValid}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-xl font-black text-slate-950 shadow-lg shadow-emerald-500/30 transition active:scale-[0.98] disabled:opacity-40"
        >
          {onContinue ? 'بدء لعبة جديدة' : 'ابدأ اللعب'}
        </button>

        {onContinue && (
          <button
            type="button"
            disabled={!targetValid}
            onClick={() => onContinue(build())}
            className="w-full rounded-2xl bg-slate-800 py-3 font-bold text-slate-100 transition hover:bg-slate-700 active:scale-[0.98] disabled:opacity-40"
          >
            حفظ ومتابعة اللعبة الحالية
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-200"
          >
            رجوع بدون تغيير
          </button>
        )}
      </form>
    </div>
  )
}

function TeamField({ label, color, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        {label}
      </span>
      <input
        type="text"
        value={value}
        maxLength={30}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg outline-none placeholder:text-slate-600 focus:border-emerald-400"
      />
    </label>
  )
}
