import Icon from './Icon.jsx'
import { TEAM_STYLES } from './teamStyles.js'

const QUICK_VALUES = [10, 25, 50]
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const KEY =
  'grid h-[clamp(2.25rem,6.2dvh,3.5rem)] place-items-center rounded-2xl bg-white/6 text-2xl font-bold text-slate-100 transition select-none active:scale-95 active:bg-white/15 disabled:opacity-30'

export default function Keypad({
  teams,
  selected,
  onSelect,
  entries,
  onDigit,
  onBackspace,
  onClear,
  onQuick,
  onSubmit,
  editingNumber,
  onCancelEdit,
  disabled,
  shake,
}) {
  const editing = editingNumber !== null

  return (
    <section className="glass shrink-0 rounded-3xl p-2.5 short:p-2" aria-label="لوحة إدخال النقاط">
      {editing && (
        <div className="mb-2 flex items-center justify-between rounded-2xl bg-sky-500/15 px-3 py-1.5 text-sm">
          <span className="font-bold text-sky-200">تعديل الجولة رقم {editingNumber}</span>
          <button type="button" onClick={onCancelEdit} className="flex items-center gap-1 font-semibold text-slate-300">
            <Icon name="close" className="h-4 w-4" />
            إلغاء
          </button>
        </div>
      )}

      {/* Team selector + current entry for each team */}
      <div className={`grid grid-cols-2 gap-2 ${shake ? 'animate-shake' : ''}`}>
        {teams.map((name, i) => {
          const active = selected === i
          const style = TEAM_STYLES[i]
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={active}
              disabled={disabled}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-2xl border-2 px-3 py-1.5 transition short:py-0.5 disabled:opacity-40 ${
                active ? `${style.border} bg-white/6` : 'border-transparent bg-white/3'
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                <span className={`truncate text-xs font-bold ${active ? 'text-slate-100' : 'text-slate-400'}`}>{name}</span>
              </span>
              <span
                dir="ltr"
                className={`text-2xl font-black whitespace-nowrap tabular-nums ${
                  entries[i] ? style.text : active ? 'text-slate-500' : 'text-slate-700'
                }`}
              >
                {entries[i] || '0'}
                {active && <span className="ms-0.5 inline-block h-5 w-0.5 animate-pulse bg-current align-middle" />}
              </span>
            </button>
          )
        })}
      </div>

      {/* Numpad — digits stay in phone order (left-to-right) */}
      <div dir="ltr" className="mt-2 grid grid-cols-3 gap-2 short:gap-1.5">
        {DIGITS.map((d) => (
          <button key={d} type="button" className={KEY} onClick={() => onDigit(d)} disabled={disabled}>
            {d}
          </button>
        ))}
        <button type="button" className={`${KEY} text-base text-slate-400`} onClick={onClear} disabled={disabled} aria-label="مسح">
          C
        </button>
        <button type="button" className={KEY} onClick={() => onDigit('0')} disabled={disabled}>
          0
        </button>
        <button type="button" className={`${KEY} text-slate-300`} onClick={onBackspace} disabled={disabled} aria-label="حذف رقم">
          <Icon name="backspace" className="h-6 w-6" />
        </button>
      </div>

      {/* Primary action + quick values */}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="flex h-[clamp(2.75rem,7dvh,3.75rem)] flex-[1.8] items-center justify-center gap-1.5 rounded-2xl px-2 whitespace-nowrap bg-gradient-to-l from-teal-400 to-emerald-400 text-lg font-black text-slate-950 shadow-lg shadow-teal-500/25 transition active:scale-[0.97] disabled:opacity-40"
        >
          <Icon name={editing ? 'check' : 'plus'} className="h-5 w-5" strokeWidth={3} />
          {editing ? 'حفظ' : 'أضف نقاط'}
        </button>
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onQuick(v)}
            disabled={disabled}
            dir="ltr"
            className={`h-[clamp(2.75rem,7dvh,3.75rem)] min-w-0 flex-1 rounded-2xl border border-white/10 text-[15px] font-extrabold transition active:scale-95 disabled:opacity-40 ${TEAM_STYLES[selected].soft}`}
          >
            +{v}
          </button>
        ))}
      </div>
    </section>
  )
}
