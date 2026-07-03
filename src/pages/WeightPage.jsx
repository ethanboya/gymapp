import { useEffect, useState } from 'react'
import { buildLineChartPath } from '../utils/chartPath'
import { getThemeClasses } from '../utils/theme'

const ENABLED_KEY = 'gym-app-bodyweight-enabled'
const ENTRIES_KEY = 'gym-app-bodyweight-entries-v1'

function loadEnabled() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ENABLED_KEY) === 'true'
}

function loadEntries() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ENTRIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function WeightPage({ isDarkTheme }) {
  const { mutedTextClass, headingTextClass, panelClass, nestedCardClass, inputClass, buttonSecondaryClass, buttonAccentClass, buttonDangerClass } = getThemeClasses(isDarkTheme)

  const [isEnabled, setIsEnabled] = useState(loadEnabled)
  const [entries, setEntries] = useState(loadEntries)
  const [date, setDate] = useState(todayString)
  const [weight, setWeight] = useState('')

  useEffect(() => {
    window.localStorage.setItem(ENABLED_KEY, String(isEnabled))
  }, [isEnabled])

  useEffect(() => {
    window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  }, [entries])

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
  const chartEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))

  const addEntry = () => {
    const numericWeight = Number(weight)
    if (!date || !numericWeight || numericWeight <= 0) return

    setEntries((current) => [...current.filter((entry) => entry.date !== date), { id: `weight-${Date.now()}`, date, weight: numericWeight }])
    setWeight('')
  }

  const removeEntry = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  if (!isEnabled) {
    return (
      <section className={panelClass}>
        <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Bodyweight</p>
        <h2 className={`mt-3 text-2xl font-semibold ${headingTextClass}`}>Optional bodyweight tracking</h2>
        <p className={`mt-2 max-w-xl text-sm ${mutedTextClass}`}>
          This is completely separate from your lifting data. Turn it on if you want a simple log and chart of your bodyweight over time.
        </p>
        <button type="button" onClick={() => setIsEnabled(true)} className={`mt-6 min-h-[48px] ${buttonAccentClass}`}>
          Enable bodyweight tracking
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className={panelClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Bodyweight</p>
            <h2 className={`text-2xl font-semibold ${headingTextClass}`}>Log your weight</h2>
          </div>
          <button type="button" onClick={() => setIsEnabled(false)} className={`min-h-[48px] ${buttonSecondaryClass}`}>
            Disable tracking
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className={`block text-sm ${mutedTextClass}`}>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
            />
          </label>
          <label className={`block text-sm ${mutedTextClass}`}>
            Weight (lbs)
            <input
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 180"
              className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
            />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={addEntry} className={`min-h-[48px] w-full sm:w-auto ${buttonAccentClass}`}>
              Log weight
            </button>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <h3 className={`mb-4 text-lg font-semibold ${headingTextClass}`}>Trend</h3>
        {chartEntries.length > 1 ? (
          <div className={`overflow-x-auto rounded-3xl p-4 ${isDarkTheme ? 'bg-slate-950/80' : 'bg-slate-50'}`}>
            <svg viewBox="0 0 520 200" className="h-48 w-full">
              <rect x="0" y="0" width="520" height="200" fill="transparent" />
              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={line}
                  x1="40"
                  x2="500"
                  y1={32 + line * 32}
                  y2={32 + line * 32}
                  stroke={isDarkTheme ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.2)'}
                  strokeWidth="1"
                />
              ))}
              <path d={buildLineChartPath(chartEntries, { autoScale: true })} fill="none" stroke="rgba(16,185,129,0.85)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div className={`rounded-3xl border p-8 text-center ${mutedTextClass} ${nestedCardClass}`}>Log at least two entries to see a trend line.</div>
        )}
      </section>

      <section className={panelClass}>
        <h3 className={`mb-4 text-lg font-semibold ${headingTextClass}`}>History</h3>
        {sortedEntries.length ? (
          <div className="space-y-2">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${nestedCardClass}`}>
                <span className={mutedTextClass}>{new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className={`font-semibold ${headingTextClass}`}>{entry.weight} lbs</span>
                <button type="button" onClick={() => removeEntry(entry.id)} className={`px-3 py-1 text-xs uppercase tracking-[0.2em] ${buttonDangerClass}`}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${mutedTextClass}`}>No entries yet.</p>
        )}
      </section>
    </div>
  )
}
