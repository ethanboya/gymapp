import { useEffect, useMemo, useState } from 'react'
import { BLOCK_TYPE, createBlock, createSession, createSplit, exerciseList, samplePresets, sampleSessionHistory } from './data/models'

function loadSavedState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem('gym-app-state-v1')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('gym-app-state-v1', JSON.stringify(state))
}

function createInitialAppState() {
  return {
    splits: samplePresets,
    selectedSplitId: samplePresets[0]?.id ?? '',
    sessions: sampleSessionHistory
  }
}

function buildExerciseMap(exerciseIds) {
  return exerciseIds.reduce((map, id) => {
    const exercise = exerciseList.find((item) => item.id === id)
    if (exercise) {
      map[id] = exercise
    }
    return map
  }, {})
}

function createNewBlock(index) {
  return createBlock({
    id: `new-block-${Date.now()}-${index}`,
    label: `Block ${index + 1}`,
    type: BLOCK_TYPE.WORKOUT,
    exercises: []
  })
}

function createNewCustomSplit() {
  return createSplit({
    id: `custom-${Date.now()}`,
    name: 'New custom split',
    type: 'Custom split',
    blocks: [createNewBlock(0)],
    currentIndex: 0,
    exerciseMap: {}
  })
}

function getPreviousExerciseSummary(sessions, exerciseId, splitId) {
  const matching = sessions
    .slice()
    .reverse()
    .find((session) => session.splitId === splitId && session.exerciseLogs.some((log) => log.exerciseId === exerciseId))

  if (!matching) return null

  const exerciseLog = matching.exerciseLogs.find((log) => log.exerciseId === exerciseId)
  if (!exerciseLog?.sets?.length) return null

  const bestSet = exerciseLog.sets.reduce(
    (best, set) => {
      if (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
        return set
      }
      return best
    },
    { weight: 0, reps: 0 }
  )

  return {
    weight: bestSet.weight,
    reps: bestSet.reps,
    timestamp: matching.timestamp
  }
}

function App() {
  const initialAppState = useMemo(() => createInitialAppState(), [])
  const [splits, setSplits] = useState(initialAppState.splits)
  const [selectedSplitId, setSelectedSplitId] = useState(initialAppState.selectedSplitId)
  const [sessions, setSessions] = useState(initialAppState.sessions)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [activeLogIndex, setActiveLogIndex] = useState(null)
  const [logEntries, setLogEntries] = useState([])
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [builder, setBuilder] = useState(createNewCustomSplit())
  const [newExerciseId, setNewExerciseId] = useState(exerciseList[0]?.id || '')
  const [graphExerciseId, setGraphExerciseId] = useState(exerciseList[0]?.id || '')
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedTimerSeconds, setSelectedTimerSeconds] = useState(60)
  const timerSteps = [30, 60, 120, 180, 240]

  useEffect(() => {
    const saved = loadSavedState()
    if (saved?.splits?.length) {
      setSplits(saved.splits)
      setSelectedSplitId(saved.selectedSplitId || saved.splits[0].id)
      setSessions(saved.sessions ?? [])
      setHasHydrated(true)
      return
    }

    const fallbackState = createInitialAppState()
    setSplits(fallbackState.splits)
    setSelectedSplitId(fallbackState.selectedSplitId)
    setSessions(fallbackState.sessions)
    saveState(fallbackState)
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    saveState({ splits, selectedSplitId, sessions })
  }, [hasHydrated, splits, selectedSplitId, sessions])

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimerLabel = (seconds) => {
    if (seconds >= 60) {
      const mins = seconds / 60
      return `${mins % 1 === 0 ? mins : mins.toFixed(1)}m`
    }
    return `${seconds}s`
  }

  const timerStepIndex = timerSteps.findIndex((step) => step === selectedTimerSeconds)

  const selectedSplit = useMemo(
    () => splits.find((split) => split.id === selectedSplitId) || splits[0],
    [splits, selectedSplitId]
  )

  const currentIndex = selectedSplit.currentIndex ?? 0

  useEffect(() => {
    const firstExercise = selectedSplit.blocks
      .find((block) => block.type === BLOCK_TYPE.WORKOUT && block.exercises.length > 0)
      ?.exercises?.[0]

    if (!graphExerciseId || !selectedSplit.blocks.some((block) => block.exercises.includes(graphExerciseId))) {
      setGraphExerciseId(firstExercise || '')
    }
  }, [selectedSplit, graphExerciseId])

  const exerciseHistory = useMemo(() => {
    if (!graphExerciseId) return []

    return sessions
      .filter((session) => session.splitId === selectedSplit.id)
      .map((session) => {
        const log = session.exerciseLogs.find((entry) => entry.exerciseId === graphExerciseId)
        if (!log) return null
        const best = log.sets.reduce(
          (bestSet, set) => {
            if (set.weight > bestSet.weight || (set.weight === bestSet.weight && set.reps > bestSet.reps)) {
              return set
            }
            return bestSet
          },
          { weight: 0, reps: 0 }
        )
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
    () =>
      sessions
        .filter((session) => session.splitId === selectedSplit.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [sessions, selectedSplit.id]
  )

  useEffect(() => {
    if (!currentSplitSessions.some((session) => session.id === selectedHistorySessionId)) {
      setSelectedHistorySessionId(currentSplitSessions[0]?.id || null)
    }
  }, [currentSplitSessions, selectedHistorySessionId])

  const selectedHistorySession = useMemo(
    () => currentSplitSessions.find((session) => session.id === selectedHistorySessionId) || null,
    [currentSplitSessions, selectedHistorySessionId]
  )

  const getSessionVolume = (session) =>
    session.exerciseLogs.reduce(
      (sum, log) =>
        sum +
        log.sets.reduce((setSum, set) => setSum + Math.max(0, Number(set.weight)) * Math.max(0, Number(set.reps)), 0),
      0
    )

  const currentExercise = exerciseList.find((exercise) => exercise.id === graphExerciseId)

  const getChartPath = (data) => {
    if (!data.length) return ''
    const width = 480
    const height = 140
    const padding = 32
    const maxWeight = Math.max(...data.map((item) => item.weight), 50)
    const minWeight = 0
    return data
      .map((point, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)
        const y = height - ((point.weight - minWeight) / (maxWeight - minWeight)) * (height - padding) + padding / 2
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const resetBuilder = () => {
    setBuilder(createNewCustomSplit())
    setNewExerciseId(exerciseList[0]?.id || '')
  }

  const openBuilder = () => {
    resetBuilder()
    setIsBuilderOpen(true)
  }

  const updateBlock = (index, updates) => {
    setBuilder((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...updates } : block
      )
    }))
  }

  const addExerciseToBlock = (blockIndex) => {
    const exerciseId = newExerciseId
    if (!exerciseId) return
    setBuilder((current) => ({
      ...current,
      blocks: current.blocks.map((block, index) =>
        index === blockIndex
          ? { ...block, exercises: block.exercises.includes(exerciseId) ? block.exercises : [...block.exercises, exerciseId] }
          : block
      )
    }))
  }

  const removeExerciseFromBlock = (blockIndex, exerciseId) => {
    setBuilder((current) => ({
      ...current,
      blocks: current.blocks.map((block, index) =>
        index === blockIndex
          ? { ...block, exercises: block.exercises.filter((id) => id !== exerciseId) }
          : block
      )
    }))
  }

  const addBlock = () => {
    setBuilder((current) => ({
      ...current,
      blocks: [...current.blocks, createNewBlock(current.blocks.length)]
    }))
  }

  const moveBlock = (index, direction) => {
    setBuilder((current) => {
      const blocks = [...current.blocks]
      const target = index + direction
      if (target < 0 || target >= blocks.length) return current
      const swapped = [...blocks]
      ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
      return { ...current, blocks: swapped }
    })
  }

  const removeBlock = (index) => {
    setBuilder((current) => ({
      ...current,
      blocks: current.blocks.filter((_, idx) => idx !== index)
    }))
  }

  const saveCustomSplit = () => {
    const exerciseIds = builder.blocks.flatMap((block) => block.exercises)
    const customSplit = {
      ...builder,
      id: builder.id || `custom-${Date.now()}`,
      type: 'Custom split',
      exerciseMap: buildExerciseMap(exerciseIds)
    }

    setSplits((current) => [...current, customSplit])
    setSelectedSplitId(customSplit.id)
    setIsBuilderOpen(false)
  }

  const openLog = (blockIndex) => {
    const block = selectedSplit.blocks[blockIndex]
    if (!block || block.type === BLOCK_TYPE.REST) return

    setActiveLogIndex(blockIndex)
    setLogEntries(
      block.exercises.map((exerciseId) => ({
        exerciseId,
        sets: []
      }))
    )
  }

  const closeLog = () => {
    setActiveLogIndex(null)
    setLogEntries([])
  }

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setLogEntries((current) =>
      current.map((entry, idx) => {
        if (idx !== exerciseIndex) return entry
        return {
          ...entry,
          sets: entry.sets.map((set, sIdx) =>
            sIdx !== setIndex ? set : { ...set, [field]: field === 'weight' || field === 'reps' ? Number(value) : value }
          )
        }
      })
    )
  }

  const addSet = (exerciseIndex) => {
    setLogEntries((current) =>
      current.map((entry, idx) =>
        idx !== exerciseIndex
          ? entry
          : { ...entry, sets: [...entry.sets, { weight: 0, reps: 0, notes: '' }] }
      )
    )
  }

  const removeSet = (exerciseIndex, setIndex) => {
    setLogEntries((current) =>
      current.map((entry, idx) =>
        idx !== exerciseIndex
          ? entry
          : { ...entry, sets: entry.sets.filter((_, sIdx) => sIdx !== setIndex) }
      )
    )
  }

  const saveLogSession = () => {
    if (activeLogIndex === null) return
    const block = selectedSplit.blocks[activeLogIndex]
    const newSession = createSession({
      id: `session-${Date.now()}`,
      splitId: selectedSplit.id,
      blockId: block.id,
      timestamp: new Date().toISOString(),
      exerciseLogs: logEntries.map((entry) => ({
        exerciseId: entry.exerciseId,
        sets: entry.sets.map((set) => ({ ...set }))
      }))
    })

    setSessions((current) => [newSession, ...current])
    setSplits((current) =>
      current.map((split) =>
        split.id === selectedSplit.id
          ? { ...split, currentIndex: (split.currentIndex + 1) % split.blocks.length }
          : split
      )
    )
    closeLog()
  }

  const deleteSession = (sessionId) => {
    setSessions((current) => {
      const nextSessions = current.filter((session) => session.id !== sessionId)
      saveState({ splits, selectedSplitId, sessions: nextSessions })
      return nextSessions
    })
    if (selectedHistorySessionId === sessionId) {
      setSelectedHistorySessionId(null)
    }
  }

  const selectedLogBlock = activeLogIndex !== null ? selectedSplit.blocks[activeLogIndex] : null
  const activeLog = selectedLogBlock ? logEntries : []

  const getLastSessionSummary = (exerciseId) => getPreviousExerciseSummary(sessions, exerciseId, selectedSplit.id)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Workout log</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Gym tracker prototype</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Browse preset splits, build custom splits, and persist your active selection in localStorage.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          {splits.map((split) => (
            <button
              key={split.id}
              type="button"
              onClick={() => setSelectedSplitId(split.id)}
              className={`rounded-2xl border px-4 py-2 text-sm transition ${
                split.id === selectedSplitId
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/80'
              }`}
            >
              {split.name}
            </button>
          ))}
          <button
            type="button"
            onClick={openBuilder}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            + Create custom split
          </button>
        </div>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Exercise progress</p>
              <h2 className="text-2xl font-semibold text-white">{currentExercise?.name ?? 'Select an exercise'}</h2>
            </div>
            <div className="grid w-full max-w-xs gap-2">
              <label className="block text-sm text-slate-300">
                Exercise
                <select
                  value={graphExerciseId}
                  onChange={(event) => setGraphExerciseId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                >
                  {selectedSplit.blocks.flatMap((block) => block.exercises).map((exerciseId) => (
                    <option key={exerciseId} value={exerciseId}>
                      {selectedSplit.exerciseMap[exerciseId]?.name ?? exerciseId}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {exerciseHistory.length ? (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-3xl bg-slate-950/80 p-4">
                <svg viewBox="0 0 520 200" className="h-48 w-full">
                  <rect x="0" y="0" width="520" height="200" fill="transparent" />
                  {[0, 1, 2, 3, 4].map((line) => (
                    <line
                      key={line}
                      x1="40"
                      x2="500"
                      y1={32 + line * 32}
                      y2={32 + line * 32}
                      stroke="rgba(148,163,184,0.16)"
                      strokeWidth="1"
                    />
                  ))}
                  <path d={getChartPath(exerciseHistory)} fill="none" stroke="rgba(52,211,153,0.85)" strokeWidth="3" strokeLinecap="round" />
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
                        <circle cx={x} cy={y} r="5" fill="#34d399" stroke="#fff" strokeWidth="2" />
                        <text x={x} y={y - 12} textAnchor="middle" fill="#cbd5e1" fontSize="11">
                          {point.weight}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {exerciseHistory.slice(-4).reverse().map((point) => (
                  <div key={point.timestamp} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{point.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{point.weight} lbs</p>
                    <p className="text-sm text-slate-400">Best set: {point.reps} reps</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center text-slate-400">
              No progress history available for this exercise yet.
            </div>
          )}
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Session history</p>
              <h2 className="text-2xl font-semibold text-white">{selectedSplit.name} past workouts</h2>
            </div>
            <div className="rounded-2xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
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
                    <div key={session.id} className={`group rounded-3xl border transition ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-900/90'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setSelectedHistorySessionId(session.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className={`text-sm ${
                              isSelected ? 'text-emerald-300' : 'text-slate-400'
                            }`}>{new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <h3 className={`mt-1 text-lg font-semibold ${
                              isSelected ? 'text-white' : 'text-slate-300'
                            }`}>{blockLabel}</h3>
                          </div>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{session.exerciseLogs.length} exercises</span>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">
                            Volume
                            <div className="mt-1 text-xl font-semibold text-white">{volume}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">
                            Best lift
                            <div className="mt-1 text-xl font-semibold text-white">
                              {session.exerciseLogs
                                .map((log) => {
                                  const best = log.sets.reduce(
                                    (bestSet, set) => {
                                      if (set.weight > bestSet.weight || (set.weight === bestSet.weight && set.reps > bestSet.reps)) {
                                        return set
                                      }
                                      return bestSet
                                    },
                                    { weight: 0, reps: 0 }
                                  )
                                  return { exerciseId: log.exerciseId, ...best }
                                })
                                .sort((a, b) => b.weight - a.weight)[0]?.weight || 0} lbs
                            </div>
                          </div>
                        </div>
                      </button>
                      <div className="border-t border-slate-800 px-4 py-3 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => deleteSession(session.id)}
                          className="w-full rounded-2xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                        >
                          Delete session
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                {selectedHistorySession ? (
                  <div className="space-y-5">
                    <div className="rounded-3xl bg-slate-900 px-5 py-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Selected session</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{new Date(selectedHistorySession.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                      <p className="mt-1 text-sm text-slate-400">{selectedSplit.blocks.find((block) => block.id === selectedHistorySession.blockId)?.label || 'Workout session'}</p>
                    </div>
                    <div className="grid gap-4">
                      {selectedHistorySession.exerciseLogs.map((log) => {
                        const exercise = selectedSplit.exerciseMap[log.exerciseId] || exerciseList.find((item) => item.id === log.exerciseId)
                        const bestSet = log.sets.reduce(
                          (bestSet, set) => {
                            if (set.weight > bestSet.weight || (set.weight === bestSet.weight && set.reps > bestSet.reps)) {
                              return set
                            }
                            return bestSet
                          },
                          { weight: 0, reps: 0 }
                        )
                        return (
                          <div key={log.exerciseId} className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{exercise?.name ?? log.exerciseId}</h4>
                                <p className="text-sm text-slate-400">Best set: {bestSet.weight} × {bestSet.reps}</p>
                              </div>
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{log.sets.length} sets</span>
                            </div>
                            <div className="mt-4 space-y-3">
                              {log.sets.map((set, idx) => (
                                <div key={idx} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] rounded-2xl bg-slate-950 px-3 py-3 text-sm text-slate-300">
                                  <div>Weight: {set.weight} lbs</div>
                                  <div>Reps: {set.reps}</div>
                                  <div className="text-slate-400">{set.notes || 'No notes'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400">Select a past session to view the workout details here.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center text-slate-400">
              No sessions logged for this split yet.
            </div>
          )}
        </section>

        {selectedLogBlock && (
          <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Log workout</p>
                <h2 className="text-3xl font-semibold text-white">{selectedLogBlock.label}</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeLog}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={saveLogSession}
                  disabled={!activeLog.some((entry) => entry.sets.length)}
                  className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save session
                </button>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 items-center justify-between gap-4 rounded-[24px] border border-slate-800/70 bg-slate-900/70 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Rest timer</p>
                    <div className="mt-2 text-5xl font-semibold tracking-[0.12em] text-white font-mono">{formatTime(timerSeconds)}</div>
                    <p className="mt-2 text-sm text-slate-400">
                      {timerRunning ? 'Counting down until your next set.' : 'Set a pause length and start when you need it.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-right">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">Ready</div>
                    <div className="mt-1 text-sm font-medium text-emerald-100">{formatTimerLabel(selectedTimerSeconds)}</div>
                  </div>
                </div>

                <div className="w-full max-w-[320px]">
                  <div className="rounded-[24px] border border-slate-800/70 bg-slate-900/70 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                      <span>Set rest time</span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
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
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800/80 accent-emerald-400"
                    />
                    <div className="relative mt-3 h-6 px-1 text-[11px] text-slate-500">
                      {timerSteps.map((tick, index) => {
                        const percent = (index / (timerSteps.length - 1)) * 100
                        return (
                          <div
                            key={tick}
                            className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                            style={{ left: `${percent}%` }}
                          >
                            <div className="h-2 w-px bg-slate-600" />
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
                      className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        timerRunning
                          ? 'border-amber-500 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                      disabled={timerRunning ? false : selectedTimerSeconds === 0}
                    >
                      {timerRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {activeLog.length ? (
                activeLog.map((entry, exerciseIndex) => {
                  const exercise = exerciseList.find((item) => item.id === entry.exerciseId)
                  const previous = getLastSessionSummary(entry.exerciseId)
                  const currentBest = entry.sets.reduce(
                    (best, set) => {
                      if (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
                        return set
                      }
                      return best
                    },
                    { weight: 0, reps: 0 }
                  )
                  const beat = previous && (currentBest.weight > previous.weight || (currentBest.weight === previous.weight && currentBest.reps > previous.reps))
                  const miss = previous && entry.sets.length > 0 && !beat

                  return (
                    <div key={entry.exerciseId} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{exercise?.name ?? entry.exerciseId}</h3>
                          <p className="text-sm text-slate-400">Previous session: {previous ? `${previous.weight} × ${previous.reps}` : 'No previous data'}</p>
                        </div>
                        {previous ? (
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${beat ? 'bg-emerald-500/15 text-emerald-200' : miss ? 'bg-red-500/15 text-red-200' : 'bg-slate-800 text-slate-300'}`}>
                            {beat ? 'Beat previous' : miss ? 'Missed previous' : 'No progress yet'}
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {entry.sets.map((set, setIndex) => (
                          <div key={setIndex} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] items-end rounded-2xl bg-slate-900 px-4 py-3">
                            <label className="block text-sm text-slate-300">
                              Weight
                              <input
                                type="number"
                                value={set.weight}
                                onChange={(event) => updateSet(exerciseIndex, setIndex, 'weight', event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-emerald-400"
                              />
                            </label>
                            <label className="block text-sm text-slate-300">
                              Reps
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(event) => updateSet(exerciseIndex, setIndex, 'reps', event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-emerald-400"
                              />
                            </label>
                            <label className="block text-sm text-slate-300">
                              Notes
                              <input
                                value={set.notes}
                                onChange={(event) => updateSet(exerciseIndex, setIndex, 'notes', event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-emerald-400"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="rounded-2xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addSet(exerciseIndex)}
                          className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
                        >
                          + Add set
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-6 py-10 text-center text-slate-400">
                  Add sets above to log this workout.
                </div>
              )}
            </div>
          </section>
        )}

        <section className="grid gap-6">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selectedSplit.name}</h2>
                <p className="text-sm text-slate-400">{selectedSplit.blocks.length} blocks — {selectedSplit.type}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                Current block: <span className="font-semibold text-white">{selectedSplit.blocks[currentIndex]?.label ?? 'N/A'}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {selectedSplit.blocks.map((block, index) => {
                const isCurrent = index === currentIndex
                const isPast = index < currentIndex
                const isRest = block.type === BLOCK_TYPE.REST

                return (
                  <button
                    key={block.id}
                    type="button"
                    disabled={isRest}
                    onClick={() => openLog(index)}
                    className={`group flex flex-col rounded-3xl border p-5 text-left transition duration-150 ${
                      isCurrent
                        ? 'border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
                        : isPast
                        ? 'border-slate-800 bg-slate-900/70 text-slate-500 shadow-none'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-900/90'
                    } ${isRest ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className={`text-lg font-semibold ${isPast ? 'text-slate-300' : 'text-white'}`}>{block.label}</h3>
                        {isCurrent && (
                          <span className="mt-1 inline-flex rounded-full bg-emerald-500/15 px-2 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                            Current
                          </span>
                        )}
                        {isPast && !isCurrent && (
                          <span className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            Past
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {block.type === BLOCK_TYPE.WORKOUT ? 'Workout' : 'Rest'}
                      </span>
                    </div>

                    {block.type === BLOCK_TYPE.WORKOUT ? (
                      <ul className="space-y-2 text-slate-300">
                        {block.exercises.map((exerciseId) => (
                          <li key={exerciseId} className="rounded-2xl bg-slate-950/80 px-3 py-2 text-sm">
                            {selectedSplit.exerciseMap[exerciseId]?.name ?? exerciseId}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">Rest day — no loggable exercises.</p>
                    )}
                  </button>
                )
              })}
            </div>
          </article>
        </section>

        {isBuilderOpen && (
          <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-3">
                <label className="block text-sm text-slate-300">
                  Split name
                  <input
                    value={builder.name}
                    onChange={(event) => setBuilder({ ...builder, name: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Type
                  <input
                    value={builder.type}
                    onChange={(event) => setBuilder({ ...builder, type: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addBlock}
                  className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  + Add block
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBuilderOpen(false)
                    resetBuilder()
                  }}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCustomSplit}
                  className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  Save custom split
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {builder.blocks.map((block, blockIndex) => (
                <div key={block.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                  <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid gap-3 flex-1">
                      <label className="block text-sm text-slate-300">
                        Block label
                        <input
                          value={block.label}
                          onChange={(event) => updateBlock(blockIndex, { label: event.target.value })}
                          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                        />
                      </label>
                      <label className="block text-sm text-slate-300">
                        Block type
                        <select
                          value={block.type}
                          onChange={(event) =>
                            updateBlock(blockIndex, {
                              type: event.target.value,
                              exercises: event.target.value === BLOCK_TYPE.REST ? [] : block.exercises
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                        >
                          <option value={BLOCK_TYPE.WORKOUT}>Workout</option>
                          <option value={BLOCK_TYPE.REST}>Rest</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveBlock(blockIndex, -1)}
                        disabled={blockIndex === 0}
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(blockIndex, 1)}
                        disabled={blockIndex === builder.blocks.length - 1}
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(blockIndex)}
                        className="rounded-2xl border border-red-500 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {block.type === BLOCK_TYPE.WORKOUT && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="block text-sm text-slate-300">
                          Add exercise
                          <select
                            value={newExerciseId}
                            onChange={(event) => setNewExerciseId(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none transition focus:border-emerald-400"
                          >
                            {exerciseList.map((exercise) => (
                              <option key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => addExerciseToBlock(blockIndex)}
                            className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
                          >
                            Add exercise
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {block.exercises.length ? (
                          block.exercises.map((exerciseId) => (
                            <div
                              key={exerciseId}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
                            >
                              <span>{exerciseList.find((exercise) => exercise.id === exerciseId)?.name ?? exerciseId}</span>
                              <button
                                type="button"
                                onClick={() => removeExerciseFromBlock(blockIndex, exerciseId)}
                                className="rounded-2xl border border-red-500 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-red-200 transition hover:bg-red-500/15"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No exercises added yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
