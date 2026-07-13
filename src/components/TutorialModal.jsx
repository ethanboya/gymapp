import { useEffect, useState } from 'react'
import { getThemeClasses } from '../utils/theme'

const steps = [
  {
    emoji: '👋',
    title: 'Welcome to Gym Tracker',
    body: "This app tracks your workouts, remembers your last session, and celebrates every new PR. Here's a quick tour of the basics."
  },
  {
    emoji: '🗂️',
    title: 'Pick a split',
    body: 'The chips at the top of Home switch between workout splits — Push/Pull/Legs, Upper/Lower, or any custom split you build. Tap one to make it active.'
  },
  {
    emoji: '📋',
    title: 'Log a workout',
    body: 'Tap a block card (like "Push") to open the log screen. Enter your weight and reps for each set — the app shows what you did last time right alongside what you\'re logging now.'
  },
  {
    emoji: '🏆',
    title: 'Beat your last session',
    body: 'Log a set heavier or with more reps than last time and you\'ll see a "Beat previous" badge. That\'s also how your PRs and estimated 1-rep max get tracked automatically.'
  },
  {
    emoji: '🔍',
    title: 'Customize exercises',
    body: 'Hit "Customize" on any block to reorder, swap, or remove exercises. Search to find exercises with real photos, or add your own if it\'s not in our list.'
  },
  {
    emoji: '📈',
    title: 'Check your stats',
    body: 'The Stats tab shows your PRs, estimated 1-rep max, and progress charts for every exercise — plus a link to track your bodyweight over time.'
  },
  {
    emoji: '🛠️',
    title: 'Build your own split',
    body: 'Not into the presets? Use the Builder tab to create a fully custom split from scratch, block by block.'
  },
  {
    emoji: '✅',
    title: "You're all set",
    body: 'Reopen this tour anytime from the "? Help" button up top. Now go log a workout.'
  }
]

export function TutorialModal({ isOpen, onClose, isDarkTheme }) {
  const { headingTextClass, bodyTextClass, mutedTextClass, pillNeutralClass, buttonSecondaryClass, buttonAccentClass } = getThemeClasses(isDarkTheme)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (isOpen) setStepIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  const goNext = () => {
    if (isLast) {
      onClose()
      return
    }
    setStepIndex((current) => current + 1)
  }

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        className={`w-full max-w-md rounded-3xl border p-6 ${isDarkTheme ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${pillNeutralClass}`}>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className={`min-h-[32px] min-w-[32px] rounded-full text-lg leading-none transition hover:opacity-70 ${mutedTextClass}`}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">{step.emoji}</div>
          <h3 className={`text-xl font-semibold ${headingTextClass}`}>{step.title}</h3>
          <p className={`mt-3 text-sm leading-relaxed ${bodyTextClass}`}>{step.body}</p>
        </div>

        <div className="mb-5 flex justify-center gap-1.5">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === stepIndex ? 'w-6 bg-emerald-400' : `w-1.5 ${isDarkTheme ? 'bg-slate-700' : 'bg-slate-300'}`
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className={`min-h-[48px] px-2 text-sm transition hover:opacity-70 ${mutedTextClass}`}>
            Skip
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button type="button" onClick={goBack} className={`min-h-[48px] ${buttonSecondaryClass}`}>
                Back
              </button>
            )}
            <button type="button" onClick={goNext} className={`min-h-[48px] ${buttonAccentClass}`}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
