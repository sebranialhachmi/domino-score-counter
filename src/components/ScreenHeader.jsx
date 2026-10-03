import Icon from './Icon.jsx'
import { usePrefs } from '../lib/prefs.jsx'

export default function ScreenHeader({ title, onBack, children }) {
  const { t } = usePrefs()
  return (
    <header className="flex min-h-11 shrink-0 items-center gap-2 px-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 active:scale-90"
        >
          <Icon name="chevron" className="h-5 w-5 rtl:rotate-180" strokeWidth={2.5} />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-xl font-black">{title}</h1>
      {children}
    </header>
  )
}
