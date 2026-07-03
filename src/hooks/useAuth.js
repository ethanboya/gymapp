import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GUEST_MODE_KEY = 'gym-app-guest-mode'

function loadGuestMode() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(GUEST_MODE_KEY) === 'true'
}

export const useAuth = () => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(loadGuestMode)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase?.auth.signOut()
    setSession(null)
    window.localStorage.removeItem(GUEST_MODE_KEY)
    setIsGuestMode(false)
  }

  const continueAsGuest = () => {
    window.localStorage.setItem(GUEST_MODE_KEY, 'true')
    setIsGuestMode(true)
  }

  const exitGuestMode = () => {
    window.localStorage.removeItem(GUEST_MODE_KEY)
    setIsGuestMode(false)
  }

  const isAuthenticated = session || isGuestMode

  return { session, isLoading, isGuestMode, isAuthenticated, signOut, continueAsGuest, exitGuestMode }
}
