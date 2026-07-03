import { useEffect, useState } from 'react'
import { MuscleIllustration } from './MuscleIllustration'
import { getExerciseImageUrl } from '../utils/exerciseImages'

export function ExerciseInfoButton({ exercise, isDarkTheme, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    setImageFailed(false)
  }, [exercise?.imageId])

  if (!exercise) return null

  const imageUrl = getExerciseImageUrl(exercise.imageId)
  const showPhoto = imageUrl && !imageFailed

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(true)
        }}
        aria-label={`About ${exercise.name}`}
        className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
          isDarkTheme
            ? 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300'
            : 'border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
        } ${className}`}
      >
        i
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={(event) => {
            event.stopPropagation()
            setIsOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={exercise.name}
            className={`w-full max-w-sm rounded-3xl border p-6 ${isDarkTheme ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{exercise.name}</h3>
                <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  {exercise.muscleGroup} · {exercise.equipment}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsOpen(false)
                }}
                className={`min-h-[48px] rounded-2xl border px-3 text-sm transition ${
                  isDarkTheme ? 'border-slate-700 text-slate-300 hover:border-slate-500' : 'border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                Close
              </button>
            </div>

            <div className={`mb-4 flex justify-center overflow-hidden rounded-2xl p-4 ${isDarkTheme ? 'bg-slate-950/60' : 'bg-slate-100'}`}>
              {showPhoto ? (
                <img
                  src={imageUrl}
                  alt={exercise.name}
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                  className="h-56 w-full rounded-xl object-contain"
                />
              ) : (
                <MuscleIllustration muscleGroup={exercise.muscleGroup} isDarkTheme={isDarkTheme} />
              )}
            </div>
            {showPhoto && (
              <p className={`mb-4 text-center text-[11px] uppercase tracking-[0.2em] ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                Image: Free Exercise DB (public domain)
              </p>
            )}

            <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
              {exercise.description || 'No description available for this custom exercise yet.'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
