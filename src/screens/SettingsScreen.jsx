import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import Toggle from '../components/Toggle.jsx'
import { LANGUAGES } from '../i18n/strings.js'
import { usePrefs } from '../lib/prefs.jsx'

const VERSION = '2.0.0'
const THEMES = ['midnight', 'black']

export default function SettingsScreen({ onClearHistory, onResetAll }) {
  const { t, prefs, setPref, language } = usePrefs()
  const [page, setPage] = useState('main')

  if (page === 'language') return <LanguageScreen onBack={() => setPage('main')} />

  return (
    <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <ScreenHeader title={t('settings.title')} />

      <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2">
        <Group title={t('settings.general')}>
          <Row icon="globe" label={t('settings.language')} onClick={() => setPage('language')}>
            <span className="text-sm text-slate-400">
              {language.flag} {language.label}
            </span>
            <Icon name="chevron" className="h-4 w-4 text-slate-500 ltr:rotate-180" />
          </Row>
          <Row icon="palette" label={t('settings.theme')}>
            <div className="flex rounded-xl bg-white/5 p-0.5" role="radiogroup" aria-label={t('settings.theme')}>
              {THEMES.map((th) => (
                <button
                  key={th}
                  type="button"
                  role="radio"
                  aria-checked={prefs.theme === th}
                  onClick={() => setPref('theme', th)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    prefs.theme === th ? 'bg-teal-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  {t(`settings.theme.${th}`)}
                </button>
              ))}
            </div>
          </Row>
        </Group>

        <Group title={t('settings.feedback')}>
          <Row icon="volume" label={t('settings.sounds')} hint={t('settings.soundsHint')}>
            <Toggle label={t('settings.sounds')} checked={prefs.sounds} onChange={(v) => setPref('sounds', v)} />
          </Row>
          <Row icon="vibrate" label={t('settings.haptics')} hint={t('settings.hapticsHint')}>
            <Toggle label={t('settings.haptics')} checked={prefs.haptics} onChange={(v) => setPref('haptics', v)} />
          </Row>
          <Row icon="sun" label={t('settings.keepAwake')} hint={t('settings.keepAwakeHint')}>
            <Toggle label={t('settings.keepAwake')} checked={prefs.keepAwake} onChange={(v) => setPref('keepAwake', v)} />
          </Row>
        </Group>

        <Group title={t('settings.data')}>
          <Row
            icon="archive"
            label={t('settings.clearHistory')}
            danger
            onClick={() => confirm(t('settings.confirmClearHistory')) && onClearHistory()}
          />
          <Row
            icon="reset"
            label={t('settings.resetAll')}
            danger
            onClick={() => confirm(t('settings.confirmResetAll')) && onResetAll()}
          />
        </Group>

        <Group title={t('settings.about')}>
          <div className="flex items-center gap-3 px-3 py-3">
            <img src="/domino.svg" alt="" className="h-10 w-10 -rotate-12" />
            <div className="min-w-0">
              <div dir="ltr" className="font-extrabold text-start">
                {t('appName')}
              </div>
              <div className="text-xs text-slate-400">
                {t('appTagline')} · {t('settings.version', { v: VERSION })}
              </div>
              <div className="mt-1 text-xs text-slate-500">{t('settings.aboutText')}</div>
            </div>
          </div>
        </Group>
      </div>
    </div>
  )
}

function LanguageScreen({ onBack }) {
  const { t, prefs, setPref } = usePrefs()
  return (
    <div className="flex h-full flex-col gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <ScreenHeader title={t('settings.language')} onBack={onBack} />
      <div className="glass divide-y divide-white/5 overflow-hidden rounded-3xl" role="radiogroup" aria-label={t('settings.language')}>
        {LANGUAGES.map((lang) => {
          const checked = prefs.lang === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setPref('lang', lang.code)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition hover:bg-white/3"
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-100">{lang.label}</span>
                <span className="block text-xs text-slate-500">{lang.native}</span>
              </span>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                  checked ? 'border-teal-400 bg-teal-400 text-slate-950' : 'border-white/20'
                }`}
              >
                {checked && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3.5} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Group({ title, children }) {
  return (
    <section>
      <h2 className="mb-1.5 px-2 text-xs font-bold tracking-wide text-slate-500">{title}</h2>
      <div className="glass divide-y divide-white/5 overflow-hidden rounded-3xl">{children}</div>
    </section>
  )
}

function Row({ icon, label, hint, onClick, danger, children }) {
  const content = (
    <>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          danger ? 'bg-rose-500/12 text-rose-300' : 'bg-white/6 text-slate-300'
        }`}
      >
        <Icon name={icon} className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-bold ${danger ? 'text-rose-300' : 'text-slate-100'}`}>{label}</span>
        {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
      </span>
      {children}
    </>
  )
  const cls = 'flex w-full items-center gap-3 px-3 py-3 text-start'
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} transition hover:bg-white/3 active:bg-white/5`}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  )
}
