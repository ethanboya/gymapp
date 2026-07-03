export function getBestSet(sets) {
  return (sets || []).reduce(
    (best, set) => {
      const weight = Number(set?.weight) || 0
      const reps = Number(set?.reps) || 0
      if (weight > best.weight || (weight === best.weight && reps > best.reps)) {
        return { weight, reps }
      }
      return best
    },
    { weight: 0, reps: 0 }
  )
}

export function getSessionVolume(session) {
  return (session?.exerciseLogs || []).reduce((sum, log) => {
    const setTotal = (log?.sets || []).reduce((setSum, set) => {
      const weight = Math.max(0, Number(set?.weight) || 0)
      const reps = Math.max(0, Number(set?.reps) || 0)
      return setSum + weight * reps
    }, 0)

    return sum + setTotal
  }, 0)
}

export function estimateOneRepMax(weight, reps) {
  const w = Number(weight) || 0
  const r = Number(reps) || 0
  if (w <= 0 || r <= 0) return 0
  if (r === 1) return w
  // Epley formula
  return w * (1 + r / 30)
}

export function getExercisePrs(sessions = [], splitId = '', exerciseLookup = {}) {
  const matchingSessions = (sessions || []).filter((session) => session?.splitId === splitId)

  const grouped = matchingSessions.reduce((accumulator, session) => {
    const logs = session?.exerciseLogs || []
    logs.forEach((log) => {
      const exerciseId = log?.exerciseId
      if (!exerciseId) return

      const existing = accumulator.get(exerciseId) || {
        exerciseId,
        name: exerciseLookup?.[exerciseId]?.name || exerciseLookup?.[exerciseId] || exerciseId,
        bestWeight: 0,
        bestReps: 0,
        date: null,
        bestE1rm: 0,
        bestE1rmWeight: 0,
        bestE1rmReps: 0,
        e1rmDate: null
      }

      ;(log?.sets || []).forEach((set) => {
        const weight = Number(set?.weight || 0)
        const reps = Number(set?.reps || 0)
        if (weight < 0 || reps <= 0) return

        if (weight > existing.bestWeight || (weight === existing.bestWeight && reps > existing.bestReps)) {
          existing.bestWeight = weight
          existing.bestReps = reps
          existing.date = session.timestamp
        }

        const e1rm = estimateOneRepMax(weight, reps)
        if (e1rm > existing.bestE1rm) {
          existing.bestE1rm = e1rm
          existing.bestE1rmWeight = weight
          existing.bestE1rmReps = reps
          existing.e1rmDate = session.timestamp
        }
      })

      accumulator.set(exerciseId, existing)
    })

    return accumulator
  }, new Map())

  return Array.from(grouped.values())
    .filter((record) => record.date !== null)
    .sort((a, b) => b.bestWeight - a.bestWeight)
}

export function getVolumeTrend(sessions = [], splitId = '', weeks = 6) {
  const matchingSessions = (sessions || []).filter((session) => session?.splitId === splitId)
  const grouped = matchingSessions.reduce((accumulator, session) => {
    const sessionDate = new Date(session?.timestamp)
    if (Number.isNaN(sessionDate.getTime())) return accumulator

    const startOfWeek = new Date(sessionDate)
    const day = startOfWeek.getDay()
    const index = (day + 6) % 7
    startOfWeek.setDate(startOfWeek.getDate() - index)
    startOfWeek.setHours(0, 0, 0, 0)

    const weekKey = startOfWeek.toISOString().slice(0, 10)
    const current = accumulator.get(weekKey) || 0
    accumulator.set(weekKey, current + getSessionVolume(session))
    return accumulator
  }, new Map())

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-weeks)
    .map(([weekKey, totalVolume]) => ({
      key: weekKey,
      label: new Date(`${weekKey}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      totalVolume
    }))
}
