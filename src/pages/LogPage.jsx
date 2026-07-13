import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BLOCK_TYPE, createSession } from '../data/models'
import { estimateOneRepMax, getBestSet, getExercisePrs } from '../utils/workoutAnalytics'
import { getExerciseById } from '../utils/exerciseLookup'
import { getThemeClasses } from '../utils/theme'
import { ExerciseInfoButton } from '../components/ExerciseInfoButton'

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

export function LogPage({ selectedSplit, sessions, setSessions, setSplits, isDarkTheme }) {
  const { blockId } = useParams()
  const navigate = useNavigate()
  const {
    panelClass,
    nestedCardClass,
    headingTextClass,
    mutedTextClass,
    inputClass,
    buttonSecondaryClass,
    buttonAccentClass,
    buttonDangerClass
  } = getThemeClasses(isDarkTheme)

  const blockIndex = selectedSplit.blocks.findIndex((block) => block.id === blockId)
  const block = blockIndex >= 0 ? selectedSplit.blocks[blockIndex] : null

  const [logEntries, setLogEntries] = useState(() => (block ? block.exercises.map((exerciseId) => ({ exerciseId, sets: [] })) : []))

  useEffect(() => {
    if (!block || block.type === BLOCK_TYPE.REST) {
      navigate('/', { replace: true })
      return
    }
    setLogEntries(block.exercises.map((exerciseId) => ({ exerciseId, sets: [] })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId])

  if (!block || block.type === BLOCK_TYPE.REST) {
    return null
  }

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
