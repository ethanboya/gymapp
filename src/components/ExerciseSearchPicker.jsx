import { useMemo, useState } from 'react'
import { exerciseList } from '../data/models'
import { getExerciseImageUrl } from '../utils/exerciseImages'
import { groupExercisesByMuscle } from '../utils/exerciseLookup'
import { getThemeClasses } from '../utils/theme'

const MAX_RESULTS = 20

export function ExerciseSearchPicker({ isDarkTheme, onSelectExisting, onCreateCustom, excludeIds = [], placeholder = 'Search exercises…' }) {
  const { inputClass, mutedTextClass, nestedCardClass, listRowClass, buttonSecondaryClass, buttonAccentClass } = getThemeClasses(isDarkTheme)
  const [query, setQuery] = useState('')
  const [isBrowsing, setIsBrowsing] = useState(false)

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds])
  const availableExercises = useMemo(() => exerciseList.filter((exercise) => !excludeSet.has(exercise.id)), [excludeSet])

  const trimmedQuery = query.trim()
  const matches = useMemo(() => {
    if (!trimmedQuery) return []
    const needle = trimmedQuery.toLowerCase()
    return availableExercises.filter((exercise) => exercise.name.toLowerCase().includes(needle)).slice(0, MAX_RESULTS)
  }, [availableExercises, trimmedQuery])

  const groupedExercises = useMemo(() => groupExercisesByMuscle(availableExercises), [availableExercises])

  const handleSelect = (exercise) => {
    onSelectExisting(exercise)
    setQuery('')
  }

  const handleCreateCustom = () => {
    if (!trimmedQuery) return
    onCreateCustom(trimmedQuery)
    setQuery('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => setIsBrowsing((current) => !current)}
          aria-label={isBrowsing ? 'Switch back to search' : 'Browse all exercises by category'}
          title={isBrowsing ? 'Switch back to search' : 'Browse all exercises by category'}
          className={`min-h-[48px] shrink-0 px-4 ${buttonSecondaryClass}`}
        >
          {isBrowsing ? '🔍' : '☰'}
        </button>
      </div>

      {isBrowsing ? (
        <select
          value=""
          onChange={(event) => {
            const exercise = availableExercises.find((item) => item.id === event.target.value)
            if (exercise) handleSelect(exercise)
          }}
          className={`w-full rounded-2xl border px-4 py-2 outline-none transition ${inputClass}`}
        >
          <option value="" disabled>
            Choose an exercise…
          </option>
          {groupedExercises.map((group) => (
            <optgroup key={group.muscleGroup} label={group.muscleGroup}>
              {group.exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        trimmedQuery && (
          <div className={`max-h-72 overflow-y-auto rounded-2xl border ${nestedCardClass}`}>
            {matches.length ? (
              matches.map((exercise) => {
                const imageUrl = getExerciseImageUrl(exercise.imageId)
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelect(exercise)}
                    className={`flex min-h-[48px] w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-emerald-500/10 ${listRowClass}`}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="" loading="lazy" className="h-9 w-9 flex-shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-500/20 text-xs">?</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{exercise.name}</span>
                      <span className={`block text-xs ${mutedTextClass}`}>{exercise.muscleGroup}</span>
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="p-3 text-sm">
                <p className={mutedTextClass}>No matches for "{trimmedQuery}".</p>
                <button type="button" onClick={handleCreateCustom} className={`mt-2 min-h-[48px] w-full ${buttonAccentClass}`}>
                  + Add "{trimmedQuery}" as a new exercise
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
