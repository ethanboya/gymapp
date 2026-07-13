import { createExercise } from '../data/models'

function reorderArray(items, fromIndex, toIndex) {
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)
  if (!movedItem) return items
  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

export function getAvailableExercises(split, catalog = []) {
  const exerciseMap = split?.exerciseMap || {}
  const customExercises = Object.values(exerciseMap).filter((exercise) => !catalog.some((item) => item.id === exercise.id))
  return [...catalog, ...customExercises]
}

export function addCustomExerciseToBlock(split, blockIndex, exerciseName, exerciseId = `custom-${Date.now()}`) {
  const trimmedName = exerciseName?.trim()
  if (!split || blockIndex < 0 || !trimmedName) return split

  const customExercise = createExercise({
    id: exerciseId,
    name: trimmedName,
    muscleGroup: 'Custom',
    equipment: 'Custom'
  })

  return {
    ...split,
    exerciseMap: {
      ...split.exerciseMap,
      [exerciseId]: customExercise
    },
    blocks: split.blocks.map((block, index) =>
      index === blockIndex ? { ...block, exercises: [...block.exercises, exerciseId] } : block
    )
  }
}

export function addExistingExerciseToBlock(split, blockIndex, exerciseId) {
  if (!split || blockIndex < 0 || !exerciseId) return split

  return {
    ...split,
    blocks: split.blocks.map((block, index) =>
      index === blockIndex
        ? { ...block, exercises: block.exercises.includes(exerciseId) ? block.exercises : [...block.exercises, exerciseId] }
        : block
    )
  }
}

export function replaceBlockExercise(split, blockIndex, exerciseIndex, exerciseId) {
  if (!split || blockIndex < 0 || exerciseIndex < 0) return split

  return {
    ...split,
    blocks: split.blocks.map((block, index) =>
      index === blockIndex
        ? {
            ...block,
            exercises: block.exercises.map((currentExerciseId, currentIndex) =>
              currentIndex === exerciseIndex ? exerciseId : currentExerciseId
            )
          }
        : block
    )
  }
}

export function reorderBlockExercise(split, blockIndex, fromIndex, toIndex) {
  if (!split || blockIndex < 0 || fromIndex < 0 || toIndex < 0) return split

  return {
    ...split,
    blocks: split.blocks.map((block, index) =>
      index === blockIndex
        ? {
            ...block,
            exercises: reorderArray(block.exercises, fromIndex, toIndex)
          }
        : block
    )
  }
}

export function removeBlockExercise(split, blockIndex, exerciseIndex) {
  if (!split || blockIndex < 0 || exerciseIndex < 0) return split

  return {
    ...split,
    blocks: split.blocks.map((block, index) =>
      index === blockIndex
        ? {
            ...block,
            exercises: block.exercises.filter((_, currentIndex) => currentIndex !== exerciseIndex)
          }
        : block
    )
  }
}
