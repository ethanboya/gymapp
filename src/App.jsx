import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { addCustomExerciseToBlock, addExistingExerciseToBlock, removeBlockExercise, reorderBlockExercise, replaceBlockExercise } from './utils/splitExercises'
import { createInitialAppState } from './utils/splitFactory'
import { getThemeClasses } from './utils/theme'
import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './components/LoginScreen'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { TutorialModal } from './components/TutorialModal'
import { HomePage } from './pages/HomePage'
import { LogPage } from './pages/LogPage'
import { StatsPage } from './pages/StatsPage'
import { BuilderPage } from './pages/BuilderPage'
import { WeightPage } from './pages/WeightPage'

function loadSavedState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem('gym-app-state-v1')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('gym-app-state-v1', JSON.stringify(state))
}

function App() {
  const { session, isLoading, isAuthenticated, isGuestMode, signOut, continueAsGuest, exitGuestMode } = useAuth()

  const initialAppState = useMemo(() => createInitialAppState(), [])
  const [splits, setSplits] = useState(initialAppState.splits)
  const [selectedSplitId, setSelectedSplitId] = useState(initialAppState.selectedSplitId)
  const [sessions, setSessions] = useState(initialAppState.sessions)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    try {
      return window.localStorage.getItem('gym-app-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  useEffect(() => {
    const saved = loadSavedState()
    if (saved?.splits?.length) {
      setSplits(saved.splits)
      setSelectedSplitId(saved.selectedSplitId || saved.splits[0].id)
      // Drop the old seeded sample session (fixed id 'session-001') that used to
      // ship with every fresh install - real logged sessions always use a
      // timestamp-based id, so this can never match a genuine user session.
      setSessions((saved.sessions ?? []).filter((session) => session.id !== 'session-001'))
      setHasHydrated(true)
      return
    }

    const fallbackState = createInitialAppState()
    setSplits(fallbackState.splits)
    setSelectedSplitId(fallbackState.selectedSplitId)
    setSessions(fallbackState.sessions)
    saveState(fallbackState)
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    saveState({ splits, selectedSplitId, sessions })
  }, [hasHydrated, splits, selectedSplitId, sessions])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('gym-app-theme', theme)
  }, [theme])

  const selectedSplit = useMemo(() => splits.find((split) => split.id === selectedSplitId) || splits[0], [splits, selectedSplitId])
  const isDarkTheme = theme === 'dark'
  const { mutedTextClass, buttonAccentClass, buttonSecondaryClass } = getThemeClasses(isDarkTheme)

  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return
    try {
      const seen = window.localStorage.getItem('gym-app-tutorial-seen-v1')
      if (!seen) setShowTutorial(true)
    } catch {
      // ignore
    }
  }, [hasHydrated, isAuthenticated])

  const closeTutorial = () => {
    setShowTutorial(false)
    try {
      window.localStorage.setItem('gym-app-tutorial-seen-v1', 'true')
    } catch {
      // ignore
    }
  }

  const updateBlockExercise = (blockIndex, exerciseIndex, exerciseId) => {
    setSplits((current) => current.map((split) => (split.id === selectedSplitId ? replaceBlockExercise(split, blockIndex, exerciseIndex, exerciseId) : split)))
  }

  const moveBlockExerciseInSelectedSplit = (blockIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
    setSplits((current) => current.map((split) => (split.id === selectedSplitId ? reorderBlockExercise(split, blockIndex, fromIndex, toIndex) : split)))
  }

  const removeBlockExerciseFromSelectedSplit = (blockIndex, exerciseIndex) => {
    setSplits((current) => current.map((split) => (split.id === selectedSplitId ? removeBlockExercise(split, blockIndex, exerciseIndex) : split)))
  }

  const addCustomExerciseToSelectedBlock = (blockIndex, exerciseName) => {
    const trimmedName = exerciseName?.trim()
    if (!trimmedName) return
    setSplits((current) => current.map((split) => (split.id === selectedSplitId ? addCustomExerciseToBlock(split, blockIndex, trimmedName) : split)))
  }

  const addExistingExerciseToSelectedBlock = (blockIndex, exerciseId) => {
    setSplits((current) => current.map((split) => (split.id === selectedSplitId ? addExistingExerciseToBlock(split, blockIndex, exerciseId) : split)))
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-b-transparent"></div>
          <p className={`mt-4 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onContinueAsGuest={continueAsGuest} isDarkTheme={isDarkTheme} />
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <BrowserRouter>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:py-10">
          <AppHeader
            isDarkTheme={isDarkTheme}
            mutedTextClass={mutedTextClass}
            buttonAccentClass={buttonAccentClass}
            buttonSecondaryClass={buttonSecondaryClass}
            session={session}
            isGuestMode={isGuestMode}
            signOut={signOut}
            onLogin={exitGuestMode}
            onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            onOpenTutorial={() => setShowTutorial(true)}
          />
          <TutorialModal isOpen={showTutorial} onClose={closeTutorial} isDarkTheme={isDarkTheme} />
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    splits={splits}
                    selectedSplitId={selectedSplitId}
                    setSelectedSplitId={setSelectedSplitId}
                    selectedSplit={selectedSplit}
                    isDarkTheme={isDarkTheme}
                    updateBlockExercise={updateBlockExercise}
                    moveBlockExerciseInSelectedSplit={moveBlockExerciseInSelectedSplit}
                    removeBlockExerciseFromSelectedSplit={removeBlockExerciseFromSelectedSplit}
                    addCustomExerciseToSelectedBlock={addCustomExerciseToSelectedBlock}
                    addExistingExerciseToSelectedBlock={addExistingExerciseToSelectedBlock}
                  />
                }
              />
              <Route
                path="/log/:blockId"
                element={<LogPage selectedSplit={selectedSplit} sessions={sessions} setSessions={setSessions} setSplits={setSplits} isDarkTheme={isDarkTheme} />}
              />
              <Route path="/stats" element={<StatsPage selectedSplit={selectedSplit} sessions={sessions} setSessions={setSessions} isDarkTheme={isDarkTheme} />} />
              <Route path="/builder" element={<BuilderPage setSplits={setSplits} setSelectedSplitId={setSelectedSplitId} isDarkTheme={isDarkTheme} />} />
              <Route path="/weight" element={<WeightPage isDarkTheme={isDarkTheme} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <BottomNav selectedSplit={selectedSplit} isDarkTheme={isDarkTheme} />
      </BrowserRouter>
    </div>
  )
}

export default App
