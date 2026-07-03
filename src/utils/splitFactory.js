import { BLOCK_TYPE, buildExerciseMap, createBlock, createSplit, samplePresets, sampleSessionHistory } from '../data/models'

export { buildExerciseMap }

export function createNewBlock(index) {
  return createBlock({
    id: `new-block-${Date.now()}-${index}`,
    label: `Block ${index + 1}`,
    type: BLOCK_TYPE.WORKOUT,
    exercises: []
  })
}

export function createNewCustomSplit() {
  return createSplit({
    id: `custom-${Date.now()}`,
    name: 'New custom split',
    type: 'Custom split',
    blocks: [createNewBlock(0)],
    currentIndex: 0,
    exerciseMap: {}
  })
}

export function createInitialAppState() {
  const starterSplit = createNewCustomSplit()
  return {
    splits: [starterSplit, ...samplePresets],
    selectedSplitId: starterSplit.id,
    sessions: sampleSessionHistory
  }
}
