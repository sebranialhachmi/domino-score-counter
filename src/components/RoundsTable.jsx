import { useState } from 'react'
import { TEAM_STYLES } from './teamStyles.js'
import { parseScore } from './RoundInput.jsx'

export default function RoundsTable({ teams, rounds, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(['', ''])

  const startEdit = (round) => {
    setEditingId(round.id)
    setDraft(round.scores.map(String))
  }

  const saveEdit = () => {
    const scores = draft.map(parseScore)
    if (scores.some(Number.isNaN)) return
    onUpdate(editingId, scores)
    setEditingId(null)
  }

  const handleDelete = (round, number) => {
    if (confirm(`حذف الجولة رقم ${number}؟`)) {
      onDelete(round.id)
      if (editingId === round.id) setEditingId(null)
    }
  }

  if (rounds.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-800 p-6 text-center text-slate-500">
        لا توجد جولات بعد — أضف نقاط أول جولة 🎲
      </section>
    )
  }

  // Running totals after each round, so the table shows how the score evolved.
  let running = [0, 0]
  const rows = rounds.map((r, idx) => {
    running = [running[0] + r.scores[0], running[1] + r.scores[1]]
    return { round: r, number: idx + 1, running }
  })

  const draftInvalid = draft.map(parseScore).some(Number.isNaN)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold text-slate-300">سجل الجولات</h3>
        <span className="text-xs text-slate-500">{rounds.length} جولة</span>
      </div>
      <table className="w-full table-fixed text-center">
        <thead>
          <tr className="text-xs text-slate-400">
            <th className="w-10 py-2 font-semibold">#</th>
            {teams.map((name, i) => (
              <th key={i} className="truncate px-1 py-2 font-semibold">
                <span className={`me-1 inline-block h-2 w-2 rounded-full ${TEAM_STYLES[i].dot}`} />
                {name}
              </th>
            ))}
            <th className="w-24 py-2 font-semibold">
              <span className="sr-only">إجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...rows].reverse().map(({ round, number, running }) => {
            const editing = editingId === round.id
            return (
              <tr key={round.id} className={`border-t border-slate-800 ${editing ? 'bg-slate-800/60' : ''}`}>
                <td className="py-2 text-sm font-bold text-slate-500">{number}</td>
                {[0, 1].map((i) => (
                  <td key={i} className="px-1 py-2">
                    {editing ? (
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={draft[i]}
                        autoFocus={i === 0}
                        onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? e.target.value : x)))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !draftInvalid) saveEdit()
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className={`w-full rounded-lg border border-slate-600 bg-slate-950 px-1 py-1.5 text-center text-lg font-bold tabular-nums outline-none ${TEAM_STYLES[i].ring}`}
                      />
                    ) : (
                      <div>
                        <div className={`text-lg font-extrabold tabular-nums ${round.scores[i] > 0 ? TEAM_STYLES[i].text : 'text-slate-600'}`}>
                          {round.scores[i] > 0 ? `+${round.scores[i]}` : '0'}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">= {running[i]}</div>
                      </div>
                    )}
                  </td>
                ))}
                <td className="py-2">
                  <div className="flex items-center justify-center gap-1">
                    {editing ? (
                      <>
                        <IconButton label="حفظ" onClick={saveEdit} disabled={draftInvalid} className="text-emerald-400">
                          <path d="M5 12l5 5L20 7" />
                        </IconButton>
                        <IconButton label="إلغاء" onClick={() => setEditingId(null)} className="text-slate-400">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton label="تعديل" onClick={() => startEdit(round)} className="text-sky-300">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                        </IconButton>
                        <IconButton label="حذف" onClick={() => handleDelete(round, number)} className="text-rose-400">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function IconButton({ label, onClick, disabled, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition hover:bg-slate-700/60 active:scale-90 disabled:opacity-30 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}
