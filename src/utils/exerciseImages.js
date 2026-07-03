const EXERCISE_IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

export function getExerciseImageUrl(imageId) {
  if (!imageId) return null
  return `${EXERCISE_IMAGE_BASE_URL}/${imageId}/0.jpg`
}
