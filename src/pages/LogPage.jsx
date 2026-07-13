import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BLOCK_TYPE, createSession } from '../data/models'
import { estimateOneRepMax, getBestSet, getExercisePrs } from '../utils/workoutAnalytics'
import { getExerciseById } from '../utils/exerciseLookup'
import { getThemeClasses } from '../utils/theme'
import { ExerciseInfoButton } from '../components/ExerciseInfoButton'

const timerSteps = [30, 60, 120, 180, 240]

function getPreviousExerciseSummary(sessions, exerciseId, splitId) {
  const matching = sessions
    .slice()
    .reverse()
    .find((session) => session.splitId === splitId && session.exerciseLogs.some((log) => log.exerciseId === exerciseId))

  if (!matching) return null

  const exerciseLog = matching.exerciseLogs.find((log) => log.exerciseId === exerciseId)
  if (!exerciseLog?.sets?.length) return null

  const bestSet = getBestSet(exerciseLog.sets)

  return {
    weight: bestSet.weight,
    reps: bestSet.reps,
    timestamp: matching.timestamp
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTimerLabel(seconds) {
  if (seconds >= 60) {
    const mins = seconds / 60
    return `${mins % 1 === 0 ? mins : mins.toFixed(1)}m`
  }
  return `${seconds}s`
}

export function LogPage({ selectedSplit, sessions, setSessions, setSplits, isDarkTheme }) {
  const { blockId } = useParams()
  const navigate = useNavigate()
  const {
    panelClass,
    nestedCardClass,
    headingTextClass,
    mutedTextClass,
    subtleTextClass,
    inputClass,
    pillNeutralClass,
    buttonSecondaryClass,
    buttonAccentClass,
    buttonDangerClass
  } = getThemeClasses(isDarkTheme)

  const blockIndex = selectedSplit.blocks.findIndex((block) => block.id === blockId)
  const block = blockIndex >= 0 ? selectedSplit.blocks[blockIndex] : null

  const [logEntries, setLogEntries] = useState(() => (block ? block.exercises.map((exerciseId) => ({ exerciseId, sets: [] })) : []))
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedTimerSeconds, setSelectedTimerSeconds] = useState(60)

  useEffect(() => {
    if (!block || block.type === BLOCK_TYPE.REST) {
      navigate('/', { replace: true })
      return
    }
    setLogEntries(block.exercises.map((exerciseId) => ({ exerciseId, sets: [] })))
    setTimerSeconds(0)
    setTimerRunning(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId])

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false)
          if (typeof window !== 'undefined') {
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              oscillator.frequency.value = 800
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.5)
            } catch {}
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerRunning, timerSeconds])

  if (!block || block.type === BLOCK_TYPE.REST) {
    return null
  }

  const startTimer = (seconds = selectedTimerSeconds) => {
    setTimerSeconds(seconds)
    setTimerRunning(true)
  }

  const toggleTimer = () => {
    if (timerSeconds === 0) {
      startTimer(selectedTimerSeconds)
      return
    }
    setTimerRunning(!timerRunning)
  }

  const resetTimer = () => {
    setTimerSeconds(0)
    setTimerRunning(false)
  }

  const handleTimerChange = (value) => {
    const nextIndex = Number(value)
    const nextValue = timerSteps[nextIndex]
    setSelectedTimerSeconds(nextValue)
    if (!timerRunning) {
      setTimerSeconds(nextValue)
    }
  }

  const timerStepIndex = timerSteps.findIndex((step) => step === selectedTimerSeconds)

  const getLastSessionSummary = (exerciseId) => getPreviousExerciseSummary(sessions, exerciseId, selectedSplit.id)

  const prBaselineByExercise = useMemo(() => {
    const prs = getExercisePrs(sessions, selectedSplit.id, selectedSplit.exerciseMap || {})
    return new Map(prs.map((pr) => [pr.exerciseId, pr]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, selectedSplit.id])

  const getSetPrStatus = (exerciseId, set) => {
    const weight = Number(set.weight) || 0
    const reps = Number(set.reps) || 0
    if (weight < 0 || reps <= 0) return { isWeightPr: false, isE1rmPr: false, e1rm: 0 }

    const baseline = prBaselineByExercise.get(exerciseId)
    const e1rm = estimateOneRepMax(weight, reps)
    const isWeightPr = !baseline || weight > baseline.bestWeight || (weight === baseline.bestWeight && reps > baseline.bestReps)
    const isE1rmPr = !baseline || e1rm > baseline.bestE1rm

    return { isWeightPr, isE1rmPr, e1rm }
  }

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setLogEntries((current) =>
      current.map((entry, idx) => {
        if (idx !== exerciseIndex) return entry
        return {
          ...entry,
          // Keep the raw typed value here (not coerced to a Number) so a fresh
          // field starts truly blank instead of showing "0" that has to be
          // deleted before typing. Numeric fields get normalized at save time.
          sets: entry.sets.map((set, sIdx) => (sIdx !== setIndex ? set : { ...set, [field]: value }))
        }
      })
    )
  }

  const addSet = (exerciseIndex) => {
    setLogEntries((current) =>
      current.map((entry, idx) => (idx !== exerciseIndex ? entry : { ...entry, sets: [...entry.sets, { weight: '', reps: '', notes: '' }] }))
    )
  }

  const removeSet = (exerciseIndex, setIndex) => {
    setLogEntries((current) =>
      current.map((entry, idx) => (idx !== exerciseIndex ? entry : { ...entry, sets: entry.sets.filter((_, sIdx) => sIdx !== setIndex) }))
    )
  }

  const closeLog = () => navigate('/')

  const saveLogSession = () => {
    const newSession = createSession({
      id: `session-${Date.now()}`,
      splitId: selectedSplit.id,
      blockId: block.id,
      timestamp: new Date().toISOString(),
      exerciseLogs: logEntries.map((entry) => ({
        exerciseId: entry.exerciseId,
        sets: entry.sets.map((set) => ({ ...set, weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 }))
      }))
    })

    setSessions((current) => [newSession, ...current])
    setSplits((current) =>
      current.map((split) =>
        split.id === selectedSplit.id ? { ...split, currentIndex: (split.currentIndex + 1) % split.blocks.length } : split
      )
    )
    navigate('/')
  }

  const activeLog = logEntries

  return (
    <section className={panelClass}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Log workout</p>
          <h2 className={`text-3xl font-semibold ${headingTextClass}`}>{block.label}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={closeLog} className={`min-h-[48px] ${buttonSecondaryClass}`}>
            Close
          </button>
          <button
            type="button"
            onClick={saveLogSession}
            disabled={!activeLog.some((entry) => entry.sets.length)}
            className={`min-h-[48px] disabled:cursor-not-allowed disabled:opacity-50 ${buttonAccentClass}`}
          >
            Save session
          </button>
        </div>
      </div>

      <div
        className={`mb-6 overflow-hidden rounded-[28px] border p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ${
          isDarkTheme ? 'border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white'
        }`}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className={`flex flex-1 items-center justify-between gap-4 rounded-[24px] border p-5 ${nestedCardClass}`}>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${subtleTextClass}`}>Rest timer</p>
              <div className={`mt-2 text-5xl font-semibold tracking-[0.12em] font-mono ${headingTextClass}`}>{formatTime(timerSeconds)}</div>
              <p className={`mt-2 text-sm ${mutedTextClass}`}>
                {timerRunning ? 'Counting down until your next set.' : 'Set a pause length and start when you need it.'}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-right">
              <div className={`text-[10px] uppercase tracking-[0.28em] ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-600'}`}>Ready</div>
              <div className={`mt-1 text-sm font-medium ${isDarkTheme ? 'text-emerald-100' : 'text-emerald-700'}`}>{formatTimerLabel(selectedTimerSeconds)}</div>
            </div>
          </div>

          <div className="w-full max-w-[320px]">
            <div className={`rounded-[24px] border p-4 ${nestedCardClass}`}>
              <div className={`mb-3 flex items-center justify-between text-sm ${mutedTextClass}`}>
                <span>Set rest time</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${pillNeutralClass}`}>
                  {formatTimerLabel(selectedTimerSeconds)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={timerSteps.length - 1}
                step="1"
                value={timerStepIndex >= 0 ? timerStepIndex : 1}
                onChange={(event) => handleTimerChange(event.target.value)}
                disabled={timerRunning}
                className={`h-2 w-full cursor-pointer appearance-none rounded-full accent-emerald-400 ${isDarkTheme ? 'bg-slate-800/80' : 'bg-slate-200'}`}
              />
              <div className={`relative mt-3 h-6 px-1 text-[11px] ${subtleTextClass}`}>
                {timerSteps.map((tick, index) => {
                  const percent = (index / (timerSteps.length - 1)) * 100
                  return (
                    <div key={tick} className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1" style={{ left: `${percent}%` }}>
                      <div className={`h-2 w-px ${isDarkTheme ? 'bg-slate-600' : 'bg-slate-300'}`} />
                      <span className="whitespace-nowrap">{tick >= 60 ? `${tick / 60}m` : `${tick}s`}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={toggleTimer}
                className={`min-h-[48px] flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  timerRunning
                    ? `border-amber-500 bg-amber-500/10 hover:bg-amber-500/15 ${isDarkTheme ? 'text-amber-200' : 'text-amber-700'}`
                    : buttonSecondaryClass
                }`}
                disabled={timerRunning ? false : selectedTimerSeconds === 0}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button type="button" onClick={resetTimer} className={`min-h-[48px] ${buttonSecondaryClass}`}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {activeLog.length ? (
          activeLog.map((entry, exerciseIndex) => {
            const exercise = getExerciseById(entry.exerciseId, selectedSplit.exerciseMap)
            const previous = getLastSessionSummary(entry.exerciseId)
            const currentBest = getBestSet(entry.sets)
            const beat = previous && (currentBest.weight > previous.weight || (currentBest.weight === previous.weight && currentBest.reps > previous.reps))
            const setPrStatuses = entry.sets.map((set) => getSetPrStatus(entry.exerciseId, set))
            const hasNewPr = setPrStatuses.some((status) => status.isWeightPr || status.isE1rmPr)

            return (
              <div key={entry.exerciseId} className={`rounded-3xl border p-5 ${nestedCardClass}`}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-semibold ${headingTextClass}`}>{exercise?.name ?? entry.exerciseId}</h3>
                      <ExerciseInfoButton exercise={exercise} isDarkTheme={isDarkTheme} />
                    </div>
                    <p className={`text-sm ${mutedTextClass}`}>Previous session: {previous ? `${previous.weight} × ${previous.reps}` : 'No previous data'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {hasNewPr && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          isDarkTheme ? 'text-amber-200' : 'text-amber-700'
                        }`}
                      >
                        🏆 New PR
                      </span>
                    )}
                    {beat && (
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] bg-emerald-500/15 ${isDarkTheme ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        Beat previous
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {entry.sets.map((set, setIndex) => {
                    const { isWeightPr, isE1rmPr, e1rm } = setPrStatuses[setIndex]
                    return (
                    <div key={setIndex} className={`rounded-2xl px-4 py-3 ${isDarkTheme ? 'bg-slate-900' : 'bg-slate-100'} ${isWeightPr || isE1rmPr ? 'ring-1 ring-amber-400/60' : ''}`}>
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] items-end">
                        <label className={`block text-sm ${mutedTextClass}`}>
                          Weight
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(event) => updateSet(exerciseIndex, setIndex, 'weight', event.target.value)}
                            className={`mt-2 w-full rounded-2xl border px-3 py-2 outline-none transition ${inputClass}`}
                          />
                        </label>
                        <label className={`block text-sm ${mutedTextClass}`}>
                          Reps
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(event) => updateSet(exerciseIndex, setIndex, 'reps', event.target.value)}
                            className={`mt-2 w-full rounded-2xl border px-3 py-2 outline-none transition ${inputClass}`}
                          />
                        </label>
                        <label className={`block text-sm ${mutedTextClass}`}>
                          Notes
                          <input
                            value={set.notes}
                            onChange={(event) => updateSet(exerciseIndex, setIndex, 'notes', event.target.value)}
                            className={`mt-2 w-full rounded-2xl border px-3 py-2 outline-none transition ${inputClass}`}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className={`min-h-[48px] px-3 py-2 text-sm ${buttonDangerClass}`}
                        >
                          Remove
                        </button>
                      </div>
                      {isWeightPr && (
                        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.18em] ${isDarkTheme ? 'text-amber-300' : 'text-amber-700'}`}>🏆 New heaviest weight PR</p>
                      )}
                      {!isWeightPr && isE1rmPr && (
                        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.18em] ${isDarkTheme ? 'text-amber-300' : 'text-amber-700'}`}>
                          🏆 New est. 1RM PR — {Math.round(e1rm)} lbs
                        </p>
                      )}
                    </div>
                    )
                  })}

                  <button type="button" onClick={() => addSet(exerciseIndex)} className={`min-h-[48px] ${buttonAccentClass}`}>
                    + Add set
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className={`rounded-3xl border px-6 py-10 text-center ${mutedTextClass} ${nestedCardClass}`}>Add sets above to log this workout.</div>
        )}
      </div>
    </section>
  )
}
