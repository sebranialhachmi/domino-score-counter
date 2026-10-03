import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, STRINGS } from '../i18n/strings.js'
import { sounds } from './sound.js'
import { PREFS_KEY } from './game.js'

export const DEFAULT_PREFS = {
  lang: 'ar',
  theme: 'midnight',
  sounds: true,
  haptics: true,
  keepAwake: true,
}

function loadPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch {
    return DEFAULT_PREFS
  }
}

const PrefsContext = createContext(null)

const VIBRATION = { tap: 8, add: 15, error: [20, 40, 20], win: [30, 60, 30, 60, 60] }

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs)

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs])

  const language = LANGUAGES.find((l) => l.code === prefs.lang) ?? LANGUAGES[0]

  useEffect(() => {
    document.documentElement.lang = language.code
    document.documentElement.dir = language.dir
    document.documentElement.dataset.theme = prefs.theme
  }, [language, prefs.theme])

  const t = useCallback(
    (key, vars) => {
      const str = STRINGS[language.code][key] ?? STRINGS.en[key] ?? key
      // Each inserted value is wrapped in a Unicode first-strong isolate so an
      // Arabic team name inside an English sentence (or vice versa) keeps its order.
      return vars ? str.replace(/\{(\w+)\}/g, (_, k) => `\u2068${vars[k] ?? ''}\u2069`) : str
    },
    [language],
  )

  // One call for both sound and vibration, each respecting its own setting.
  const feedback = useCallback(
    (kind) => {
      if (prefs.sounds) {
        try {
          sounds[kind]?.()
        } catch {
          // ignore
        }
      }
      if (prefs.haptics) {
        try {
          navigator.vibrate?.(VIBRATION[kind] ?? 8)
        } catch {
          // ignore
        }
      }
    },
    [prefs.sounds, prefs.haptics],
  )

  const value = useMemo(
    () => ({
      prefs,
      setPref: (key, val) => setPrefs((p) => ({ ...p, [key]: val })),
      resetPrefs: () => setPrefs(DEFAULT_PREFS),
      language,
      t,
      feedback,
      formatDate: (ts, opts = { dateStyle: 'medium' }) =>
        ts ? new Intl.DateTimeFormat(language.locale, opts).format(new Date(ts)) : '—',
      formatNumber: (n, opts) => new Intl.NumberFormat(language.locale, opts).format(n),
      formatDuration: (ms) => {
        if (!ms) return '—'
        const mins = Math.max(1, Math.round(ms / 60000))
        return mins < 60
          ? t('duration.minutes', { n: mins })
          : t('duration.hours', { h: Math.floor(mins / 60), m: mins % 60 })
      },
    }),
    [prefs, language, t, feedback],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  return useContext(PrefsContext)
}

// Keeps the screen awake while `active` (Screen Wake Lock API, where supported).
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
      } catch {
        // denied (battery saver, unsupported) — nothing to do
      }
    }
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}
