import { useRef, useState } from 'react'
import { TEAM_STYLES } from './teamStyles.js'

export function parseScore(value) {
  if (value === '' || value === null || value === undefined) return 0
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 ? n : NaN
}

export default function RoundInput({ teams, onAdd, disabled }) {
  const [values, setValues] = useState(['', ''])
  const [error, setError] = useState('')
  const firstRef = useRef(null)

  const setValue = (i, v) => {
    setValues((prev) => prev.map((x, j) => (j === i ? v : x)))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const scores = values.map(parseScore)
    if (scores.some(Number.isNaN)) {
      setError('النقاط يجب أن تكون أرقاماً صحيحة موجبة')
      return
    }
    if (scores[0] === 0 && scores[1] === 0) {
      setError('أدخل نقاط فريق واحد على الأقل')
      return
    }
    onAdd(scores)
    setValues(['', ''])
    firstRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4"
    >
      <h3 className="mb-3 text-sm font-bold text-slate-300">نقاط الجولة الحالية</h3>
      <div className="grid grid-cols-2 gap-3">
        {teams.map((name, i) => (
          <label key={i} className="block min-w-0">
            <span className="mb-1 flex items-center gap-1.5 truncate text-xs font-semibold text-slate-400">
              <span className={`h-2 w-2 shrink-0 rounded-full ${TEAM_STYLES[i].dot}`} />
              <span className="truncate">{name}</span>
            </span>
            <input
              ref={i === 0 ? firstRef : undefined}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="0"
              value={values[i]}
              disabled={disabled}
              onChange={(e) => setValue(i, e.target.value)}
              className={`w-full rounded-2xl border-2 border-slate-700 bg-slate-950 px-3 py-3 text-center text-3xl font-black tabular-nums outline-none placeholder:text-slate-700 disabled:opacity-40 ${TEAM_STYLES[i].ring}`}
            />
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={disabled}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xl font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        إضافة
      </button>
    </form>
  )
}
