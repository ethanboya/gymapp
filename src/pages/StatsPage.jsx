import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBestSet, getExercisePrs, getSessionVolume, getVolumeTrend } from '../utils/workoutAnalytics'
import { getExerciseById } from '../utils/exerciseLookup'
import { buildLineChartPath } from '../utils/chartPath'
import { getThemeClasses } from '../utils/theme'
import { ExerciseInfoButton } from '../components/ExerciseInfoButton'

export function StatsPage({ selectedSplit, sessions, setSessions, isDarkTheme }) {
  const {
    mutedTextClass,
    subtleTextClass,
    headingTextClass,
    panelClass,
    nestedCardClass,
    raisedCardClass,
    inputClass,
    pillNeutralClass,
    buttonDangerClass
  } = getThemeClasses(isDarkTheme)

  const [graphExerciseId, setGraphExerciseId] = useState('')
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState(null)

  const graphExerciseOptions = useMemo(() => {
    const currentExerciseIds = selectedSplit.blocks.flatMap((block) => block.exercises)
    const historicalExerciseIds = sessions
      .filter((session) => session.splitId === selectedSplit.id)
      .flatMap((session) => session.exerciseLogs.map((log) => log.exerciseId))

    const seenExerciseIds = new Set()

    return [...new Set([...currentExerciseIds, ...historicalExerciseIds])]
      .filter((exerciseId) => {
        if (!exerciseId || seenExerciseIds.has(exerciseId)) return false
        seenExerciseIds.add(exerciseId)
        return Boolean(getExerciseById(exerciseId, selectedSplit.exerciseMap))
      })
      .map((exerciseId) => ({
        id: exerciseId,
        name: getExerciseById(exerciseId, selectedSplit.exerciseMap)?.name ?? exerciseId
      }))
  }, [selectedSplit, sessions])

  useEffect(() => {
    if (!graphExerciseOptions.length) {
      setGraphExerciseId('')
      return
    }

    const hasCurrentSelection = graphExerciseOptions.some((option) => option.id === graphExerciseId)
    if (!graphExerciseId || !hasCurrentSelection) {
      setGraphExerciseId(graphExerciseOptions[0].id)
    }
  }, [graphExerciseOptions, graphExerciseId])

  const exerciseHistory = useMemo(() => {
    if (!graphExerciseId) return []

    return sessions
      .filter((session) => session.splitId === selectedSplit.id)
      .map((session) => {
        const log = session.exerciseLogs.find((entry) => entry.exerciseId === graphExerciseId)
        if (!log) return null
        const best = getBestSet(log.sets)
        return {
          label: new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          timestamp: session.timestamp,
          weight: best.weight,
          reps: best.reps
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [sessions, graphExerciseId, selectedSplit.id])

  const currentSplitSessions = useMemo(
    () => sessions.filter((session) => session.splitId === selectedSplit.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [sessions, selectedSplit.id]
  )

  const prSummaries = useMemo(
    () => getExercisePrs(sessions, selectedSplit.id, selectedSplit.exerciseMap || {}),
    [sessions, selectedSplit.id, selectedSplit.exerciseMap]
  )

  const volumeTrend = useMemo(() => getVolumeTrend(sessions, selectedSplit.id, 6), [sessions, selectedSplit.id])

  useEffect(() => {
    if (!currentSplitSessions.some((session) => session.id === selectedHistorySessionId)) {
      setSelectedHistorySessionId(currentSplitSessions[0]?.id || null)
    }
  }, [currentSplitSessions, selectedHistorySessionId])

  const selectedHistorySession = useMemo(
    () => currentSplitSessions.find((session) => session.id === selectedHistorySessionId) || null,
    [currentSplitSessions, selectedHistorySessionId]
  )

  const currentExercise = getExerciseById(graphExerciseId, selectedSplit.exerciseMap)

  const deleteSession = (sessionId) => {
    setSessions((current) => current.filter((session) => session.id !== sessionId))
    if (selectedHistorySessionId === sessionId) {
      setSelectedHistorySessionId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className={panelClass}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Exercise progress</p>
            <div className="flex items-center gap-2">
              <h2 className={`text-2xl font-semibold ${headingTextClass}`}>{currentExercise?.name ?? 'Select an exercise'}</h2>
              <ExerciseInfoButton exercise={currentExercise} isDarkTheme={isDarkTheme} />
            </div>
          </div>
          <div className="grid w-full max-w-xs gap-2">
            <label className={`block text-sm ${mutedTextClass}`}>
              Exercise
              <select
                value={graphExerciseId}
                onChange={(event) => setGraphExerciseId(event.target.value)}
                className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
              >
                {graphExerciseOptions.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {exerciseHistory.length ? (
          <div className="space-y-4">
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
                <path d={buildLineChartPath(exerciseHistory)} fill="none" stroke="rgba(16,185,129,0.85)" strokeWidth="3" strokeLinecap="round" />
                {exerciseHistory.map((point, index) => {
                  const width = 480
                  const height = 140
                  const padding = 32
                  const maxWeight = Math.max(...exerciseHistory.map((item) => item.weight), 50)
                  const minWeight = 0
                  const x = padding + (index * (width - padding * 2)) / Math.max(exerciseHistory.length - 1, 1)
                  const y = height - ((point.weight - minWeight) / (maxWeight - minWeight)) * (height - padding) + padding / 2
                  return (
                    <g key={point.timestamp}>
                      <circle cx={x} cy={y} r="5" fill="#10b981" stroke={isDarkTheme ? '#fff' : '#0f172a'} strokeWidth="2" />
                      <text x={x} y={y - 12} textAnchor="middle" fill={isDarkTheme ? '#cbd5e1' : '#334155'} fontSize="11">
                        {point.weight}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {exerciseHistory
                .slice(-4)
                .reverse()
                .map((point) => (
                  <div key={point.timestamp} className={`rounded-2xl border p-4 ${nestedCardClass}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${subtleTextClass}`}>{point.label}</p>
                    <p className={`mt-2 text-2xl font-semibold ${headingTextClass}`}>{point.weight} lbs</p>
                    <p className={`text-sm ${mutedTextClass}`}>Best set: {point.reps} reps</p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className={`rounded-3xl border p-8 text-center ${mutedTextClass} ${nestedCardClass}`}>No progress history available for this exercise yet.</div>
        )}
      </section>

      <section className={panelClass}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>PR tracking</p>
            <h2 className={`text-2xl font-semibold ${headingTextClass}`}>Best lifts this split</h2>
          </div>
          <div className={`rounded-2xl px-4 py-2 text-sm ${pillNeutralClass}`}>
            {prSummaries.length} exercise{prSummaries.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`rounded-3xl border p-5 ${nestedCardClass}`}>
            <h3 className={`text-lg font-semibold ${headingTextClass}`}>Personal records</h3>
            <div className="mt-4 space-y-3">
              {prSummaries.length ? (
                prSummaries.slice(0, 6).map((pr) => (
                  <div key={pr.exerciseId} className={`rounded-2xl px-3 py-3 ${raisedCardClass} ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${headingTextClass}`}>{pr.name}</p>
                          <ExerciseInfoButton exercise={getExerciseById(pr.exerciseId, selectedSplit.exerciseMap)} isDarkTheme={isDarkTheme} />
                        </div>
                        <p className={`text-sm ${mutedTextClass}`}>{new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${headingTextClass}`}>{pr.bestWeight} lbs</p>
                        <p className={`text-sm ${mutedTextClass}`}>{pr.bestReps} reps</p>
                      </div>
                    </div>
                    {pr.bestE1rm > 0 && (
                      <div className={`mt-2 flex items-center justify-between border-t pt-2 text-sm ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
                        <span className={mutedTextClass}>Est. 1RM ({pr.bestE1rmWeight} × {pr.bestE1rmReps})</span>
                        <span className={`font-medium ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>{Math.round(pr.bestE1rm)} lbs</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${mutedTextClass}`}>Log a workout to start tracking personal records.</p>
              )}
            </div>
          </div>

          <div className={`rounded-3xl border p-5 ${nestedCardClass}`}>
            <h3 className={`text-lg font-semibold ${headingTextClass}`}>Volume trend</h3>
            <div className="mt-4 flex h-40 items-end gap-3">
              {volumeTrend.length ? (
                volumeTrend.map((point) => {
                  const maxVolume = Math.max(...volumeTrend.map((item) => item.totalVolume), 1)
                  const height = `${Math.max(10, (point.totalVolume / maxVolume) * 100)}%`
                  return (
                    <div key={point.key} className="flex flex-1 flex-col items-center gap-2">
                      <div className={`w-full rounded-t-2xl ${isDarkTheme ? 'bg-emerald-500/80' : 'bg-emerald-500'}`} style={{ height }} />
                      <div className={`text-center text-xs ${mutedTextClass}`}>
                        <div>{point.label}</div>
                        <div className={`mt-1 font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{point.totalVolume}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className={`text-sm ${mutedTextClass}`}>No volume history yet for this split.</p>
              )}
            </div>
          </div>
        </div>

        <Link to="/weight" className="mt-4 inline-flex min-h-[48px] items-center text-sm text-emerald-400 underline-offset-4 hover:underline">
          Track bodyweight →
        </Link>
      </section>

      <section className={panelClass}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Session history</p>
            <h2 className={`text-2xl font-semibold ${headingTextClass}`}>{selectedSplit.name} past workouts</h2>
          </div>
          <div className={`rounded-2xl px-4 py-2 text-sm ${pillNeutralClass}`}>
            {currentSplitSessions.length} session{currentSplitSessions.length === 1 ? '' : 's'}
          </div>
        </div>

        {currentSplitSessions.length ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(360px,1.4fr)]">
            <div className="space-y-3">
              {currentSplitSessions.slice(0, 4).map((session) => {
                const volume = getSessionVolume(session)
                const blockLabel = selectedSplit.blocks.find((block) => block.id === session.blockId)?.label || session.blockId
                const isSelected = session.id === selectedHistorySessionId

                return (
                  <div
                    key={session.id}
                    className={`group rounded-3xl border transition ${
                      isSelected ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' : `${nestedCardClass} hover:border-slate-400`
                    }`}
                  >
                    <button type="button" onClick={() => setSelectedHistorySessionId(session.id)} className="w-full p-4 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-sm ${isSelected ? (isDarkTheme ? 'text-emerald-300' : 'text-emerald-600') : mutedTextClass}`}>
                            {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <h3 className={`mt-1 text-lg font-semibold ${isSelected ? headingTextClass : isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>{blockLabel}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${pillNeutralClass}`}>{session.exerciseLogs.length} exercises</span>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className={`rounded-2xl px-3 py-2 text-sm ${raisedCardClass} ${mutedTextClass}`}>
                          Volume
                          <div className={`mt-1 text-xl font-semibold ${headingTextClass}`}>{volume}</div>
                        </div>
                        <div className={`rounded-2xl px-3 py-2 text-sm ${raisedCardClass} ${mutedTextClass}`}>
                          Best lift
                          <div className={`mt-1 text-xl font-semibold ${headingTextClass}`}>
                            {session.exerciseLogs
                              .map((log) => {
                                return { exerciseId: log.exerciseId, ...getBestSet(log.sets) }
                              })
                              .sort((a, b) => b.weight - a.weight)[0]?.weight || 0}{' '}
                            lbs
                          </div>
                        </div>
                      </div>
                    </button>
                    <div className={`border-t px-4 py-3 opacity-0 transition group-hover:opacity-100 ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
                      <button type="button" onClick={() => deleteSession(session.id)} className={`min-h-[48px] w-full px-3 py-2 text-sm ${buttonDangerClass}`}>
                        Delete session
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={`rounded-3xl border p-5 ${nestedCardClass}`}>
              {selectedHistorySession ? (
                <div className="space-y-5">
                  <div className={`rounded-3xl px-5 py-4 ${raisedCardClass}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${subtleTextClass}`}>Selected session</p>
                    <h3 className={`mt-2 text-2xl font-semibold ${headingTextClass}`}>
                      {new Date(selectedHistorySession.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>{selectedSplit.blocks.find((block) => block.id === selectedHistorySession.blockId)?.label || 'Workout session'}</p>
                  </div>
                  <div className="grid gap-4">
                    {selectedHistorySession.exerciseLogs.map((log) => {
                      const exercise = getExerciseById(log.exerciseId, selectedSplit.exerciseMap)
                      const bestSet = getBestSet(log.sets)
                      return (
                        <div key={log.exerciseId} className={`rounded-3xl px-4 py-4 ${raisedCardClass}`}>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className={`text-lg font-semibold ${headingTextClass}`}>{exercise?.name ?? log.exerciseId}</h4>
                              <p className={`text-sm ${mutedTextClass}`}>
                                Best set: {bestSet.weight} × {bestSet.reps}
                              </p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${pillNeutralClass}`}>{log.sets.length} sets</span>
                          </div>
                          <div className="mt-4 space-y-3">
                            {log.sets.map((set, idx) => (
                              <div
                                key={idx}
                                className={`grid gap-3 sm:grid-cols-[1fr_1fr_auto] rounded-2xl px-3 py-3 text-sm ${isDarkTheme ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                              >
                                <div>Weight: {set.weight} lbs</div>
                                <div>Reps: {set.reps}</div>
                                <div className={mutedTextClass}>{set.notes || 'No notes'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className={`py-10 text-center ${mutedTextClass}`}>Select a past session to view the workout details here.</div>
              )}
            </div>
          </div>
        ) : (
          <div className={`rounded-3xl border p-8 text-center ${mutedTextClass} ${nestedCardClass}`}>No sessions logged for this split yet.</div>
        )}
      </section>
    </div>
  )
}
