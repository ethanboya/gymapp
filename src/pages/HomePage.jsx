import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BLOCK_TYPE, exerciseList } from '../data/models'
import { getAvailableExercises } from '../utils/splitExercises'
import { getExerciseById, groupExercisesByMuscle } from '../utils/exerciseLookup'
import { getThemeClasses } from '../utils/theme'
import { ExerciseInfoButton } from '../components/ExerciseInfoButton'

export function HomePage({
  splits,
  selectedSplitId,
  setSelectedSplitId,
  selectedSplit,
  isDarkTheme,
  updateBlockExercise,
  moveBlockExerciseInSelectedSplit,
  removeBlockExerciseFromSelectedSplit,
  addCustomExerciseToSelectedBlock
}) {
  const navigate = useNavigate()
  const {
    panelClass,
    nestedCardClass,
    headingTextClass,
    mutedTextClass,
    inputClass,
    pillNeutralClass,
    pillOutlineClass,
    chipUnselectedClass,
    listRowClass,
    buttonSecondaryClass,
    buttonAccentClass,
    buttonDangerClass,
    blockCardDefaultClass,
    blockCardPastClass
  } = getThemeClasses(isDarkTheme)

  const [customizingBlockIndex, setCustomizingBlockIndex] = useState(null)
  const [customExerciseName, setCustomExerciseName] = useState('')
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)
  const customizationPanelRef = useRef(null)

  const currentIndex = selectedSplit.currentIndex ?? 0
  const customizingBlock = customizingBlockIndex !== null ? selectedSplit.blocks[customizingBlockIndex] : null
  const availableExercises = useMemo(() => getAvailableExercises(selectedSplit, exerciseList), [selectedSplit])
  const groupedAvailableExercises = useMemo(() => groupExercisesByMuscle(availableExercises), [availableExercises])

  useEffect(() => {
    setCustomizingBlockIndex(null)
    setCustomExerciseName('')
    setDraggedExerciseIndex(null)
    setDropTargetIndex(null)
  }, [selectedSplitId])

  useEffect(() => {
    if (customizingBlockIndex === null) return

    const scrollToPanel = () => {
      const target = customizationPanelRef.current
      if (!target) return
      const offset = 140
      const top = target.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: Math.max(0, top - offset), behavior: 'smooth' })
    }

    const rafId = window.requestAnimationFrame(scrollToPanel)
    const timeoutId = window.setTimeout(scrollToPanel, 50)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [customizingBlockIndex])

  useEffect(() => {
    if (draggedExerciseIndex === null) return

    const handleDragAutoScroll = (event) => {
      const viewportHeight = window.innerHeight
      const threshold = 120
      const topDistance = event.clientY
      const bottomDistance = viewportHeight - event.clientY
      const distanceToEdge = Math.min(topDistance, bottomDistance)

      if (distanceToEdge < threshold && distanceToEdge > 0) {
        const speed = ((threshold - distanceToEdge) / threshold) * 18
        const direction = topDistance < bottomDistance ? -1 : 1
        window.scrollBy({ top: direction * speed, behavior: 'auto' })
      }
    }

    window.addEventListener('dragover', handleDragAutoScroll)
    return () => window.removeEventListener('dragover', handleDragAutoScroll)
  }, [draggedExerciseIndex])

  const openCustomization = (blockIndex) => {
    setCustomizingBlockIndex(blockIndex)
    setCustomExerciseName('')
  }

  const closeCustomization = () => {
    setCustomizingBlockIndex(null)
    setCustomExerciseName('')
    setDraggedExerciseIndex(null)
    setDropTargetIndex(null)
  }

  const handleAddCustomExercise = () => {
    if (customizingBlockIndex === null) return
    addCustomExerciseToSelectedBlock(customizingBlockIndex, customExerciseName)
    setCustomExerciseName('')
  }

  const openLog = (block) => {
    if (!block || block.type === BLOCK_TYPE.REST) return
    navigate(`/log/${block.id}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {splits.map((split) => (
          <button
            key={split.id}
            type="button"
            onClick={() => setSelectedSplitId(split.id)}
            className={`min-h-[48px] rounded-2xl border px-4 py-2 text-sm transition ${
              split.id === selectedSplitId
                ? `border-emerald-400 bg-emerald-500/10 ${isDarkTheme ? 'text-emerald-200' : 'text-emerald-700'}`
                : chipUnselectedClass
            }`}
          >
            {split.name}
          </button>
        ))}
        <button type="button" onClick={() => navigate('/builder')} className={`min-h-[48px] ${buttonSecondaryClass}`}>
          + Create custom split
        </button>
      </div>

      <section className={panelClass}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-2xl font-semibold ${headingTextClass}`}>{selectedSplit.name}</h2>
            <p className={`text-sm ${mutedTextClass}`}>
              {selectedSplit.blocks.length} blocks — {selectedSplit.type}
            </p>
          </div>
          <div className={`rounded-2xl px-4 py-2 text-sm ${pillNeutralClass}`}>
            Current block: <span className={`font-semibold ${headingTextClass}`}>{selectedSplit.blocks[currentIndex]?.label ?? 'N/A'}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {selectedSplit.blocks.map((block, index) => {
            const isCurrent = index === currentIndex
            const isPast = index < currentIndex
            const isRest = block.type === BLOCK_TYPE.REST

            return (
              <div
                key={block.id}
                className={`flex flex-col rounded-3xl border p-5 transition duration-150 ${
                  isCurrent
                    ? 'border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
                    : isPast
                    ? blockCardPastClass
                    : blockCardDefaultClass
                } ${isRest ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <button
                  type="button"
                  disabled={isRest}
                  onClick={() => openLog(block)}
                  className={`text-left ${isRest ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${isPast ? mutedTextClass : headingTextClass}`}>{block.label}</h3>
                      {isCurrent && (
                        <span
                          className={`mt-1 inline-flex rounded-full bg-emerald-500/15 px-2 py-1 text-xs uppercase tracking-[0.2em] ${
                            isDarkTheme ? 'text-emerald-200' : 'text-emerald-700'
                          }`}
                        >
                          Current
                        </span>
                      )}
                      {isPast && !isCurrent && (
                        <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs uppercase tracking-[0.2em] ${pillNeutralClass}`}>Past</span>
                      )}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.18em] ${pillNeutralClass}`}>
                      {block.type === BLOCK_TYPE.WORKOUT ? 'Workout' : 'Rest'}
                    </span>
                  </div>
                </button>

                <div className="flex-1">
                  {block.type === BLOCK_TYPE.WORKOUT ? (
                    <ul className={`space-y-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                      {block.exercises.map((exerciseId) => {
                        const exercise = getExerciseById(exerciseId, selectedSplit.exerciseMap)
                        return (
                          <li key={exerciseId} className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm ${listRowClass}`}>
                            <span>{exercise?.name ?? exerciseId}</span>
                            <ExerciseInfoButton exercise={exercise} isDarkTheme={isDarkTheme} />
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className={`text-sm ${mutedTextClass}`}>Rest day — no loggable exercises.</p>
                  )}
                </div>
                {!isRest && (
                  <button type="button" onClick={() => openCustomization(index)} className={`mt-4 min-h-[48px] ${buttonSecondaryClass}`}>
                    Customize
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {customizingBlock && customizingBlock.type === BLOCK_TYPE.WORKOUT && (
        <section ref={customizationPanelRef} className={panelClass}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Customize block</p>
              <h2 className={`text-2xl font-semibold ${headingTextClass}`}>{customizingBlock.label}</h2>
            </div>
            <button type="button" onClick={closeCustomization} className={`min-h-[48px] ${buttonSecondaryClass}`}>
              Close
            </button>
          </div>

          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${mutedTextClass} ${isDarkTheme ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
            Drag an exercise card to reorder it. The list updates instantly and your history stays attached to the exercise.
          </div>
          <div className="space-y-4">
            {customizingBlock.exercises.length ? (
              customizingBlock.exercises.map((exerciseId, exerciseIndex) => (
                <div key={`${exerciseId}-${exerciseIndex}`} className="relative">
                  {dropTargetIndex === exerciseIndex && draggedExerciseIndex !== null && (
                    <div className="absolute inset-x-0 -top-2 z-10 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  )}
                  <div
                    draggable
                    onDragStart={() => {
                      setDraggedExerciseIndex(exerciseIndex)
                      setDropTargetIndex(exerciseIndex)
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDropTargetIndex(exerciseIndex)
                    }}
                    onDrop={() => {
                      if (draggedExerciseIndex !== null) {
                        moveBlockExerciseInSelectedSplit(customizingBlockIndex, draggedExerciseIndex, exerciseIndex)
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedExerciseIndex(null)
                      setDropTargetIndex(null)
                    }}
                    className={`rounded-2xl border p-4 transition ${
                      draggedExerciseIndex === exerciseIndex
                        ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
                        : `${nestedCardClass}`
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <label className={`flex-1 text-sm ${mutedTextClass}`}>
                        Exercise {exerciseIndex + 1}
                        <select
                          value={exerciseId}
                          onChange={(event) => updateBlockExercise(customizingBlockIndex, exerciseIndex, event.target.value)}
                          className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
                        >
                          {groupedAvailableExercises.map((group) => (
                            <optgroup key={group.muscleGroup} label={group.muscleGroup}>
                              {group.exercises.map((exercise) => (
                                <option key={exercise.id} value={exercise.id}>
                                  {exercise.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${pillOutlineClass}`}>Drag to reorder</span>
                        <ExerciseInfoButton
                          exercise={getExerciseById(exerciseId, selectedSplit.exerciseMap)}
                          isDarkTheme={isDarkTheme}
                        />
                        <button
                          type="button"
                          onClick={() => removeBlockExerciseFromSelectedSplit(customizingBlockIndex, exerciseIndex)}
                          className={`min-h-[48px] px-3 py-2 text-sm ${buttonDangerClass}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${mutedTextClass}`}>No exercises in this block yet.</p>
            )}
          </div>

          <div className={`mt-6 rounded-3xl border p-5 ${nestedCardClass}`}>
            <label className={`block text-sm ${mutedTextClass}`}>
              Add a custom exercise
              <input
                value={customExerciseName}
                onChange={(event) => setCustomExerciseName(event.target.value)}
                placeholder="e.g. Cable Crunch"
                className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
              />
            </label>
            <button type="button" onClick={handleAddCustomExercise} className={`mt-3 min-h-[48px] ${buttonAccentClass}`}>
              Add custom exercise
            </button>
            <p className={`mt-2 text-sm ${mutedTextClass}`}>This adds a new exercise to the current block and makes it available for future workouts.</p>
          </div>
        </section>
      )}
    </div>
  )
}
