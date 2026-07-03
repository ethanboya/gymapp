import { describe, expect, it } from 'vitest'
import { createSession, createSetEntry } from '../data/models'
import { estimateOneRepMax, getExercisePrs, getVolumeTrend } from './workoutAnalytics'

describe('workout analytics helpers', () => {
  it('collects personal records for each exercise', () => {
    const sessions = [
      createSession({
        id: 'session-1',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-01T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 185, reps: 5 })] }]
      }),
      createSession({
        id: 'session-2',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-02T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 195, reps: 3 })] }]
      })
    ]

    const prs = getExercisePrs(sessions, 'split-a')

    expect(prs).toHaveLength(1)
    expect(prs[0].bestWeight).toBe(195)
    expect(prs[0].exerciseId).toBe('bench-press')
  })

  it('tracks personal records for bodyweight exercises logged with weight 0', () => {
    const sessions = [
      createSession({
        id: 'session-1',
        splitId: 'split-a',
        blockId: 'pull',
        timestamp: '2026-06-01T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'pull-up', sets: [createSetEntry({ weight: 0, reps: 8 })] }]
      }),
      createSession({
        id: 'session-2',
        splitId: 'split-a',
        blockId: 'pull',
        timestamp: '2026-06-08T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'pull-up', sets: [createSetEntry({ weight: 0, reps: 12 })] }]
      })
    ]

    const prs = getExercisePrs(sessions, 'split-a')

    expect(prs).toHaveLength(1)
    expect(prs[0].exerciseId).toBe('pull-up')
    expect(prs[0].bestWeight).toBe(0)
    expect(prs[0].bestReps).toBe(12)
  })

  it('estimates one-rep max using the Epley formula', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100)
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 1)
    expect(estimateOneRepMax(0, 5)).toBe(0)
    expect(estimateOneRepMax(100, 0)).toBe(0)
  })

  it('tracks the best estimated 1RM separately from the heaviest single weight', () => {
    const sessions = [
      createSession({
        id: 'session-1',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-01T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 225, reps: 1 })] }]
      }),
      createSession({
        id: 'session-2',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-02T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 185, reps: 10 })] }]
      })
    ]

    const prs = getExercisePrs(sessions, 'split-a')

    expect(prs[0].bestWeight).toBe(225)
    expect(prs[0].bestE1rmWeight).toBe(185)
    expect(prs[0].bestE1rm).toBeCloseTo(246.67, 1)
  })

  it('aggregates weekly volume totals', () => {
    const sessions = [
      createSession({
        id: 'session-1',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-01T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 100, reps: 5 })] }]
      }),
      createSession({
        id: 'session-2',
        splitId: 'split-a',
        blockId: 'push',
        timestamp: '2026-06-08T00:00:00.000Z',
        exerciseLogs: [{ exerciseId: 'bench-press', sets: [createSetEntry({ weight: 120, reps: 5 })] }]
      })
    ]

    const trend = getVolumeTrend(sessions, 'split-a', 2)

    expect(trend).toHaveLength(2)
    expect(trend[0].totalVolume).toBe(500)
    expect(trend[1].totalVolume).toBe(600)
  })
})
