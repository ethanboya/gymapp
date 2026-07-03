import { exerciseList } from '../data/models'

const exerciseCatalogById = new Map(exerciseList.map((exercise) => [exercise.id, exercise]))

export function getExerciseById(exerciseId, exerciseMap = {}) {
  return exerciseCatalogById.get(exerciseId) || exerciseMap?.[exerciseId] || null
}

export function groupExercisesByMuscle(exercises) {
  const groups = new Map()
  for (const exercise of exercises) {
    const key = exercise.muscleGroup || 'Other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(exercise)
  }

  return Array.from(groups.entries())
    .map(([muscleGroup, items]) => ({
      muscleGroup,
      exercises: [...items].sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup))
}
