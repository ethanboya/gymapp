import { exerciseCatalogExtra } from './exerciseCatalogExtra'

export const BLOCK_TYPE = {
  WORKOUT: 'workout',
  REST: 'rest'
}

export const createExercise = ({ id, name, muscleGroup, equipment = 'Barbell', description = '', imageId = null }) => ({
  id,
  name,
  muscleGroup,
  equipment,
  description,
  imageId
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
    equipment: 'Barbell',
    imageId: 'Barbell_Bench_Press_-_Medium_Grip',
    description:
      'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower it to your mid-chest, then press up until your arms are fully extended.'
  }),
  inclineBench: createExercise({
    id: 'incline-bench-press',
    name: 'Incline Dumbbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    imageId: 'Incline_Dumbbell_Press',
    description:
      'On a bench set to a 30–45° incline, press the dumbbells up and together above your upper chest, then lower them under control back to chest level.'
  }),
  dumbbellShoulderPress: createExercise({
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    imageId: 'Dumbbell_Shoulder_Press',
    description:
      'Seated or standing, press the dumbbells overhead from shoulder height until your arms are extended, keeping your core tight and avoiding an arched lower back.'
  }),
  pecFly: createExercise({
    id: 'pec-fly',
    name: 'Pec Fly',
    muscleGroup: 'Chest',
    equipment: 'Machine',
    imageId: 'Butterfly',
    description:
      'Seated at the machine with a slight bend in your elbows, bring the handles together in front of your chest, squeezing your pecs at the peak of the movement.'
  }),
  tricepPushdown: createExercise({
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms',
    equipment: 'Cable',
    imageId: 'Triceps_Pushdown',
    description:
      'Standing at a cable stack, keep your elbows pinned to your sides and push the bar or rope down until your arms are fully extended, then control the return.'
  }),
  lateralRaise: createExercise({
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    imageId: 'Side_Lateral_Raise',
    description:
      'Standing with a dumbbell in each hand, raise your arms out to the sides to shoulder height with a slight bend in the elbows, then lower slowly.'
  }),
  pullUp: createExercise({
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    imageId: 'Pullups',
    description:
      'Grip a pull-up bar slightly wider than shoulder-width and pull your chin above the bar, leading with your chest, then lower yourself with control.'
  }),
  barbellRow: createExercise({
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    imageId: 'Bent_Over_Barbell_Row',
    description:
      'Hinge at the hips with a flat back, pull the barbell toward your lower ribs while squeezing your shoulder blades together, then lower it under control.'
  }),
  deadlift: createExercise({
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'Posterior Chain',
    equipment: 'Barbell',
    imageId: 'Barbell_Deadlift',
    description:
      'Stand with the bar over mid-foot, hinge down to grip it, then drive through your heels to stand tall, keeping the bar close to your body and your back neutral throughout.'
  }),
  squat: createExercise({
    id: 'squat',
    name: 'Back Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    imageId: 'Barbell_Squat',
    description:
      'With the bar resting on your upper back and feet shoulder-width apart, sit back and down until your thighs are at least parallel to the floor, then drive up through your heels.'
  }),
  legPress: createExercise({
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    imageId: 'Leg_Press',
    description:
      'Seated in the machine with feet shoulder-width on the platform, lower the weight until your knees reach about 90°, then press back up without locking your knees out.'
  }),
  hamstringCurl: createExercise({
    id: 'hamstring-curl',
    name: 'Hamstring Curl',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    imageId: 'Lying_Leg_Curls',
    description: 'Lying or seated at the machine, curl the pad toward your glutes by contracting your hamstrings, then lower it back down under control.'
  }),
  dumbbellLunge: createExercise({
    id: 'dumbbell-lunge',
    name: 'Dumbbell Lunge',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell',
    imageId: 'Dumbbell_Lunges',
    description:
      'Step forward into a lunge until both knees reach about 90°, keeping your torso upright, then push back to standing and repeat on the other leg.'
  }),
  bicepCurl: createExercise({
    id: 'bicep-curl',
    name: 'Standing Dumbbell Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell',
    imageId: 'Dumbbell_Bicep_Curl',
    description:
      'Standing with a dumbbell in each hand, curl the weights toward your shoulders while keeping your elbows tucked at your sides, then lower slowly.'
  }),
  tricepExtension: createExercise({
    id: 'tricep-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell',
    imageId: 'Standing_Dumbbell_Triceps_Extension',
    description:
      'Holding a dumbbell overhead with both hands, lower it behind your head by bending at the elbows, then extend back up while keeping your upper arms still.'
  }),
  dumbbellFly: createExercise({
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    imageId: 'Dumbbell_Flyes',
    description:
      'Lying on a flat bench with a slight bend in your elbows, lower the dumbbells out to your sides in an arc, then bring them back together above your chest.'
  }),
  latPulldown: createExercise({
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Machine',
    imageId: 'Wide-Grip_Lat_Pulldown',
    description:
      'Grip the bar wider than shoulder-width and pull it down to your upper chest while driving your elbows down and back, then control the return.'
  }),
  facePull: createExercise({
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'Upper Back',
    equipment: 'Cable',
    imageId: 'Face_Pull',
    description:
      'At a cable station set above head height, pull the rope toward your face, flaring your elbows out and squeezing your rear delts and upper back.'
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

export const buildExerciseMap = (exerciseIds) => {
  return exerciseIds.reduce((map, id) => {
    const exercise = exerciseList.find((item) => item.id === id)
    if (exercise) {
      map[id] = exercise
    }
    return map
  }, {})
}

export const exerciseList = [...Object.values(exerciseCatalog), ...exerciseCatalogExtra]

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
        exercises: ['leg-press', 'hamstring-curl']
      }),
      createBlock({
        id: 'rest',
        label: 'Rest Day',
        type: BLOCK_TYPE.REST
      })
    ],
    currentIndex: 0,
    exerciseMap: buildExerciseMap(['bench-press', 'dumbbell-shoulder-press', 'pec-fly', 'tricep-pushdown', 'lateral-raise', 'pull-up', 'barbell-row', 'bicep-curl', 'face-pull', 'leg-press', 'hamstring-curl'])
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
