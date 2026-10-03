import Icon from './Icon.jsx'
import { usePrefs } from '../lib/prefs.jsx'

const TABS = [
  { id: 'game', icon: 'domino' },
  { id: 'saved', icon: 'archive' },
  { id: 'stats', icon: 'chart' },
  { id: 'settings', icon: 'settings' },
]

export default function TabBar({ tab, onChange, badge }) {
  const { t } = usePrefs()
  return (
    <nav
      aria-label={t('appName')}
      className="glass mx-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] grid shrink-0 grid-cols-4 rounded-2xl p-1"
    >
      {TABS.map(({ id, icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] short:py-1 font-bold transition active:scale-95 ${
              active ? 'bg-white/8 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name={icon} className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{t(`tab.${id}`)}</span>
            {id === 'saved' && badge > 0 && (
              <span className="absolute top-1 end-[calc(50%-1.25rem)] h-2 w-2 rounded-full bg-orange-400" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
