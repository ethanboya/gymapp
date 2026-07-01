export const BLOCK_TYPE = {
  WORKOUT: 'workout',
  REST: 'rest'
}

export const createExercise = ({ id, name, muscleGroup, equipment = 'Barbell' }) => ({
  id,
  name,
  muscleGroup,
  equipment
})

export const createBlock = ({ id, label, type, exercises = [] }) => ({
  id,
  label,
  type,
  exercises
})

export const createSplit = ({ id, name, type, blocks, currentIndex = 0, exerciseMap }) => ({
  id,
  name,
  type,
  blocks,
  currentIndex,
  exerciseMap
})

const exerciseCatalog = {
  benchPress: createExercise({
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell'
  }),
  inclineBench: createExercise({
    id: 'incline-bench-press',
    name: 'Incline Dumbbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell'
  }),
  dumbbellShoulderPress: createExercise({
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell'
  }),
  pecFly: createExercise({
    id: 'pec-fly',
    name: 'Pec Fly',
    muscleGroup: 'Chest',
    equipment: 'Machine'
  }),
  tricepPushdown: createExercise({
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms',
    equipment: 'Cable'
  }),
  lateralRaise: createExercise({
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell'
  }),
  pullUp: createExercise({
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'Back',
    equipment: 'Bodyweight'
  }),
  barbellRow: createExercise({
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell'
  }),
  deadlift: createExercise({
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'Posterior Chain',
    equipment: 'Barbell'
  }),
  squat: createExercise({
    id: 'squat',
    name: 'Back Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell'
  }),
  legPress: createExercise({
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine'
  }),
  hamstringCurl: createExercise({
    id: 'hamstring-curl',
    name: 'Hamstring Curl',
    muscleGroup: 'Legs',
    equipment: 'Machine'
  }),
  dumbbellLunge: createExercise({
    id: 'dumbbell-lunge',
    name: 'Dumbbell Lunge',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell'
  }),
  bicepCurl: createExercise({
    id: 'bicep-curl',
    name: 'Standing Dumbbell Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell'
  }),
  tricepExtension: createExercise({
    id: 'tricep-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell'
  }),
  dumbbellFly: createExercise({
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell'
  }),
  latPulldown: createExercise({
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Machine'
  }),
  facePull: createExercise({
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'Upper Back',
    equipment: 'Cable'
  })
}

export const createSetEntry = ({ weight, reps, notes = '' }) => ({
  weight,
  reps,
  notes
})

export const createSession = ({ id, splitId, blockId, timestamp, exerciseLogs = [] }) => ({
  id,
  splitId,
  blockId,
  timestamp,
  exerciseLogs
})

export const sampleSessionHistory = [
  createSession({
    id: 'session-001',
    splitId: 'push-pull-legs-rest',
    blockId: 'push',
    timestamp: '2026-06-30T18:30:00.000Z',
    exerciseLogs: [
      {
        exerciseId: 'bench-press',
        sets: [
          createSetEntry({ weight: 185, reps: 8 }),
          createSetEntry({ weight: 185, reps: 8 }),
          createSetEntry({ weight: 185, reps: 7 })
        ]
      },
      {
        exerciseId: 'dumbbell-shoulder-press',
        sets: [
          createSetEntry({ weight: 95, reps: 6 }),
          createSetEntry({ weight: 95, reps: 6 })
        ]
      }
    ]
  })
]

const buildExerciseMap = (exerciseIds) => {
  return exerciseIds.reduce((map, id) => {
    const exercise = Object.values(exerciseCatalog).find((item) => item.id === id)
    if (exercise) {
      map[id] = exercise
    }
    return map
  }, {})
}

export const exerciseList = Object.values(exerciseCatalog)

export const samplePresets = [
  createSplit({
    id: 'push-pull-legs-rest',
    name: 'Push / Pull / Legs / Rest',
    type: '4-day split',
    blocks: [
      createBlock({
        id: 'push',
        label: 'Push',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['bench-press', 'dumbbell-shoulder-press', 'pec-fly', 'tricep-pushdown', 'lateral-raise']
      }),
      createBlock({
        id: 'pull',
        label: 'Pull',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['pull-up', 'barbell-row', 'bicep-curl', 'face-pull']
      }),
      createBlock({
        id: 'legs',
        label: 'Legs',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['squat', 'deadlift', 'leg-press', 'hamstring-curl']
      }),
      createBlock({
        id: 'rest',
        label: 'Rest Day',
        type: BLOCK_TYPE.REST
      })
    ],
    currentIndex: 0,
    exerciseMap: buildExerciseMap(['bench-press', 'dumbbell-shoulder-press', 'pec-fly', 'tricep-pushdown', 'lateral-raise', 'pull-up', 'barbell-row', 'bicep-curl', 'face-pull', 'squat', 'deadlift', 'leg-press', 'hamstring-curl'])
  }),
  createSplit({
    id: 'upper-lower',
    name: 'Upper / Lower',
    type: '2-day split',
    blocks: [
      createBlock({
        id: 'upper',
        label: 'Upper',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['bench-press', 'pull-up', 'dumbbell-shoulder-press', 'barbell-row']
      }),
      createBlock({
        id: 'lower',
        label: 'Lower',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['squat', 'deadlift', 'leg-press', 'hamstring-curl']
      }),
      createBlock({
        id: 'rest-1',
        label: 'Rest',
        type: BLOCK_TYPE.REST
      }),
      createBlock({
        id: 'rest-2',
        label: 'Rest',
        type: BLOCK_TYPE.REST
      })
    ],
    currentIndex: 1,
    exerciseMap: buildExerciseMap(['bench-press', 'pull-up', 'dumbbell-shoulder-press', 'barbell-row', 'squat', 'deadlift', 'leg-press', 'hamstring-curl'])
  }),
  createSplit({
    id: 'bro-split',
    name: 'Bro Split',
    type: '5-day split',
    blocks: [
      createBlock({
        id: 'chest',
        label: 'Chest',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['bench-press', 'incline-bench-press', 'dumbbell-fly']
      }),
      createBlock({
        id: 'back',
        label: 'Back',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['pull-up', 'barbell-row', 'lat-pulldown']
      }),
      createBlock({
        id: 'legs-biceps',
        label: 'Legs + Biceps',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['squat', 'leg-press', 'bicep-curl']
      }),
      createBlock({
        id: 'shoulders-triceps',
        label: 'Shoulders + Triceps',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['dumbbell-shoulder-press', 'lateral-raise', 'tricep-extension']
      }),
      createBlock({
        id: 'rest',
        label: 'Rest',
        type: BLOCK_TYPE.REST
      })
    ],
    currentIndex: 2,
    exerciseMap: buildExerciseMap(['bench-press', 'incline-bench-press', 'dumbbell-fly', 'pull-up', 'barbell-row', 'lat-pulldown', 'squat', 'leg-press', 'bicep-curl', 'dumbbell-shoulder-press', 'lateral-raise', 'tricep-extension'])
  }),
  createSplit({
    id: 'full-body',
    name: 'Full Body',
    type: '3-day split',
    blocks: [
      createBlock({
        id: 'full-1',
        label: 'Full Body 1',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['squat', 'bench-press', 'barbell-row']
      }),
      createBlock({
        id: 'rest',
        label: 'Rest',
        type: BLOCK_TYPE.REST
      }),
      createBlock({
        id: 'full-2',
        label: 'Full Body 2',
        type: BLOCK_TYPE.WORKOUT,
        exercises: ['deadlift', 'dumbbell-shoulder-press', 'pull-up']
      }),
      createBlock({
        id: 'rest-2',
        label: 'Rest',
        type: BLOCK_TYPE.REST
      })
    ],
    currentIndex: 0,
    exerciseMap: buildExerciseMap(['squat', 'bench-press', 'barbell-row', 'deadlift', 'dumbbell-shoulder-press', 'pull-up'])
  })
]
