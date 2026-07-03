import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { getThemeClasses } from '../utils/theme'

export function LoginScreen({ onContinueAsGuest, isDarkTheme = true }) {
  const { panelClass, mutedTextClass, headingTextClass, buttonSecondaryClass } = getThemeClasses(isDarkTheme)

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-semibold mb-2 ${headingTextClass}`}>Gym Tracker</h1>
          <p className={mutedTextClass}>Track your workouts, compete with yourself</p>
        </div>

        <div className={`${panelClass} mb-6`}>
          {supabase ? (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: isDarkTheme
                      ? {
                          brand: '#34d399',
                          brandAccent: '#10b981',
                          brandButtonText: '#000',
                          defaultButtonBackground: '#1e293b',
                          defaultButtonBackgroundHover: '#334155',
                          defaultButtonBorder: '#475569',
                          defaultButtonText: '#e2e8f0',
                          dividerBackground: '#334155'
                        }
                      : {
                          brand: '#10b981',
                          brandAccent: '#059669',
                          brandButtonText: '#fff',
                          defaultButtonBackground: '#ffffff',
                          defaultButtonBackgroundHover: '#f1f5f9',
                          defaultButtonBorder: '#cbd5e1',
                          defaultButtonText: '#1e293b',
                          dividerBackground: '#e2e8f0',
                          inputBackground: '#ffffff',
                          inputBorder: '#cbd5e1',
                          inputText: '#1e293b',
                          inputLabelText: '#475569'
                        }
                  }
                }
              }}
              theme={isDarkTheme ? 'dark' : 'default'}
              providers={[]}
            />
          ) : (
            <p className={`text-sm ${mutedTextClass}`}>
              Sign-in isn't configured for this deployment. You can still use the app in guest mode below.
            </p>
          )}
        </div>

        <button type="button" onClick={onContinueAsGuest} className={`min-h-[48px] w-full ${buttonSecondaryClass}`}>
          Continue without account
        </button>

        <p className={`mt-4 text-center text-xs ${mutedTextClass}`}>Guest mode uses your local storage. Your data won't sync to other devices.</p>
      </div>
    </div>
  )
}
