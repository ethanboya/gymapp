import { describe, expect, it } from 'vitest'
import { createBlock, createSplit } from '../data/models'
import { addCustomExerciseToBlock, removeBlockExercise, reorderBlockExercise, replaceBlockExercise } from './splitExercises'

describe('split exercise helpers', () => {
  it('adds a custom exercise to a workout block', () => {
    const split = createSplit({
      id: 'test-split',
      name: 'Test Split',
      type: 'Test',
      blocks: [createBlock({ id: 'block-1', label: 'Push', type: 'workout', exercises: ['bench-press'] })],
      exerciseMap: {
        'bench-press': { id: 'bench-press', name: 'Bench Press' }
      }
    })

    const updated = addCustomExerciseToBlock(split, 0, 'Hammer Curl', 'custom-1')

    expect(updated.blocks[0].exercises).toContain('custom-1')
    expect(updated.exerciseMap['custom-1'].name).toBe('Hammer Curl')
  })

  it('replaces an exercise in a workout block', () => {
    const split = createSplit({
      id: 'test-split',
      name: 'Test Split',
      type: 'Test',
      blocks: [createBlock({ id: 'block-1', label: 'Push', type: 'workout', exercises: ['bench-press', 'squat'] })],
      exerciseMap: {
        'bench-press': { id: 'bench-press', name: 'Bench Press' },
        squat: { id: 'squat', name: 'Squat' }
      }
    })

    const updated = replaceBlockExercise(split, 0, 1, 'deadlift')

    expect(updated.blocks[0].exercises[1]).toBe('deadlift')
  })

  it('reorders an exercise in a workout block', () => {
    const split = createSplit({
      id: 'test-split',
      name: 'Test Split',
      type: 'Test',
      blocks: [createBlock({ id: 'block-1', label: 'Push', type: 'workout', exercises: ['bench-press', 'squat'] })],
      exerciseMap: {
        'bench-press': { id: 'bench-press', name: 'Bench Press' },
        squat: { id: 'squat', name: 'Squat' }
      }
    })

    const updated = reorderBlockExercise(split, 0, 0, 1)

    expect(updated.blocks[0].exercises).toEqual(['squat', 'bench-press'])
  })

  it('removes an exercise from a workout block', () => {
    const split = createSplit({
      id: 'test-split',
      name: 'Test Split',
      type: 'Test',
      blocks: [createBlock({ id: 'block-1', label: 'Push', type: 'workout', exercises: ['bench-press', 'squat'] })],
      exerciseMap: {
        'bench-press': { id: 'bench-press', name: 'Bench Press' },
        squat: { id: 'squat', name: 'Squat' }
      }
    })

    const updated = removeBlockExercise(split, 0, 0)

    expect(updated.blocks[0].exercises).toEqual(['squat'])
  })
})
