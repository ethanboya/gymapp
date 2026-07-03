import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BLOCK_TYPE, exerciseList } from '../data/models'
import { buildExerciseMap, createNewBlock, createNewCustomSplit } from '../utils/splitFactory'
import { getExerciseById, groupExercisesByMuscle } from '../utils/exerciseLookup'
import { getThemeClasses } from '../utils/theme'
import { ExerciseInfoButton } from '../components/ExerciseInfoButton'

export function BuilderPage({ setSplits, setSelectedSplitId, isDarkTheme }) {
  const navigate = useNavigate()
  const { panelClass, nestedCardClass, mutedTextClass, inputClass, buttonSecondaryClass, buttonAccentClass, buttonDangerClass } = getThemeClasses(isDarkTheme)
  const groupedExerciseList = useMemo(() => groupExercisesByMuscle(exerciseList), [])

  const [builder, setBuilder] = useState(() => createNewCustomSplit())
  const [newExerciseId, setNewExerciseId] = useState(exerciseList[0]?.id || '')

  const updateBlock = (index, updates) => {
    setBuilder((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) => (blockIndex === index ? { ...block, ...updates } : block))
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
      blocks: current.blocks.map((block, index) => (index === blockIndex ? { ...block, exercises: block.exercises.filter((id) => id !== exerciseId) } : block))
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

  const cancelBuilder = () => {
    setBuilder(createNewCustomSplit())
    navigate('/')
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
    setBuilder(createNewCustomSplit())
    navigate('/')
  }

  return (
    <section className={panelClass}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3">
          <label className={`block text-sm ${mutedTextClass}`}>
            Split name
            <input
              value={builder.name}
              onChange={(event) => setBuilder({ ...builder, name: event.target.value })}
              className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
            />
          </label>
          <label className={`block text-sm ${mutedTextClass}`}>
            Type
            <input
              value={builder.type}
              onChange={(event) => setBuilder({ ...builder, type: event.target.value })}
              className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addBlock} className={`min-h-[48px] ${buttonAccentClass}`}>
            + Add block
          </button>
          <button type="button" onClick={cancelBuilder} className={`min-h-[48px] ${buttonSecondaryClass}`}>
            Cancel
          </button>
          <button type="button" onClick={saveCustomSplit} className={`min-h-[48px] ${buttonAccentClass}`}>
            Save custom split
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {builder.blocks.map((block, blockIndex) => (
          <div key={block.id} className={`rounded-3xl border p-5 ${nestedCardClass}`}>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-3 flex-1">
                <label className={`block text-sm ${mutedTextClass}`}>
                  Block label
                  <input
                    value={block.label}
                    onChange={(event) => updateBlock(blockIndex, { label: event.target.value })}
                    className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
                  />
                </label>
                <label className={`block text-sm ${mutedTextClass}`}>
                  Block type
                  <select
                    value={block.type}
                    onChange={(event) =>
                      updateBlock(blockIndex, {
                        type: event.target.value,
                        exercises: event.target.value === BLOCK_TYPE.REST ? [] : block.exercises
                      })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
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
                  className={`min-h-[48px] disabled:cursor-not-allowed disabled:opacity-50 ${buttonSecondaryClass}`}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(blockIndex, 1)}
                  disabled={blockIndex === builder.blocks.length - 1}
                  className={`min-h-[48px] disabled:cursor-not-allowed disabled:opacity-50 ${buttonSecondaryClass}`}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(blockIndex)}
                  aria-label={`Remove block ${block.label}`}
                  className={`min-h-[48px] px-4 py-2 text-sm ${buttonDangerClass}`}
                >
                  Remove
                </button>
              </div>
            </div>

            {block.type === BLOCK_TYPE.WORKOUT && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className={`block text-sm ${mutedTextClass}`}>
                    Add exercise
                    <select
                      value={newExerciseId}
                      onChange={(event) => setNewExerciseId(event.target.value)}
                      className={`mt-2 w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
                    >
                      {groupedExerciseList.map((group) => (
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
                  <div className="flex items-end">
                    <button type="button" onClick={() => addExerciseToBlock(blockIndex)} className={`min-h-[48px] ${buttonAccentClass}`}>
                      Add exercise
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {block.exercises.length ? (
                    block.exercises.map((exerciseId) => {
                      const exercise = getExerciseById(exerciseId)
                      return (
                        <div key={exerciseId} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${nestedCardClass}`}>
                          <span className="flex items-center gap-2">
                            {exercise?.name ?? exerciseId}
                            <ExerciseInfoButton exercise={exercise} isDarkTheme={isDarkTheme} />
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromBlock(blockIndex, exerciseId)}
                            aria-label={`Remove ${exercise?.name ?? exerciseId}`}
                            className={`px-3 py-1 text-xs uppercase tracking-[0.2em] ${buttonDangerClass}`}
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <p className={`text-sm ${mutedTextClass}`}>No exercises added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
