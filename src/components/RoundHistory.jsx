import { useState } from 'react'
import Icon from './Icon.jsx'
import SwipeRow from './SwipeRow.jsx'
import { TEAM_STYLES } from './teamStyles.js'

export default function RoundHistory({ teams, rounds, editingId, onEdit, onDelete }) {
  const [openId, setOpenId] = useState(null)

  // Running totals after each round, so each row shows how the score evolved.
  let running = [0, 0]
  const rows = rounds.map((round, idx) => {
    running = [running[0] + round.scores[0], running[1] + round.scores[1]]
    return { round, number: idx + 1, running }
  })

  return (
    <section className="glass flex min-h-28 flex-1 flex-col short:min-h-24 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-sm font-bold text-slate-200">
          سجل الجولات
          {rounds.length > 0 && <span className="ms-1.5 text-slate-500">({rounds.length})</span>}
        </h3>
        {rounds.length > 0 && <span className="text-[11px] text-slate-500">اسحب الجولة أو المسها للتعديل والحذف</span>}
      </div>

      {rounds.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 pb-4 text-center">
          <span className="text-3xl opacity-70 short:hidden">🁫</span>
          <p className="text-sm text-slate-400">لا توجد جولات بعد</p>
          <p className="text-xs text-slate-500 short:hidden">اختر الفريق وأدخل النقاط من اللوحة بالأسفل</p>
        </div>
      ) : (
        <ol className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-2 pb-2">
          {[...rows].reverse().map(({ round, number, running }) => (
            <li key={round.id} className="animate-row-in">
              <SwipeRow
                open={openId === round.id}
                onOpenChange={(o) => setOpenId(o ? round.id : null)}
                actions={
                  <>
                    <ActionButton
                      label="تعديل"
                      icon="edit"
                      className="bg-sky-500/90 text-white"
                      onClick={() => {
                        setOpenId(null)
                        onEdit(round)
                      }}
                    />
                    <ActionButton
                      label="حذف"
                      icon="trash"
                      className="bg-rose-500/90 text-white"
                      onClick={() => {
                        setOpenId(null)
                        onDelete(round)
                      }}
                    />
                  </>
                }
              >
                <RoundRow
                  teams={teams}
                  round={round}
                  number={number}
                  running={running}
                  editing={editingId === round.id}
                />
              </SwipeRow>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function RoundRow({ teams, round, number, running, editing }) {
  const scored = [0, 1].filter((i) => round.scores[i] > 0)
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 short:py-1.5 ${
        editing ? 'bg-[#0f2638] ring-1 ring-inset ring-sky-400/70' : 'bg-[#0d1424]'
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/6 text-sm font-black text-slate-300 tabular-nums">
        {number}
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {scored.map((i) => (
          <span
            key={i}
            className={`flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold ${TEAM_STYLES[i].soft}`}
          >
            <span className="truncate">{teams[i]}</span>
            <span dir="ltr" className="font-black tabular-nums">
              +{round.scores[i]}
            </span>
          </span>
        ))}
      </div>

      <div dir="ltr" className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
        <span className={TEAM_STYLES[0].text}>{running[0]}</span>
        <span className="mx-1">–</span>
        <span className={TEAM_STYLES[1].text}>{running[1]}</span>
      </div>
    </div>
  )
}

function ActionButton({ label, icon, className, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold active:scale-95 ${className}`}
    >
      <Icon name={icon} className="h-4.5 w-4.5" />
      {label}
    </button>
  )
}
