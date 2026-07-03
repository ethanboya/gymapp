export function AppHeader({ isDarkTheme, mutedTextClass, buttonAccentClass, session, isGuestMode, signOut, onLogin, onToggleTheme }) {
  return (
    <header className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-sm uppercase tracking-[0.35em] ${mutedTextClass}`}>Workout log</p>
          <h1 className={`mt-3 text-3xl font-semibold sm:text-4xl ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Gym tracker</h1>
          <p className={`mt-2 max-w-2xl text-sm sm:text-base ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            Browse preset splits, build custom splits, and keep your logs easy to review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start">
          <button type="button" onClick={onToggleTheme} className={`min-h-[48px] ${buttonAccentClass}`}>
            {isDarkTheme ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          {session && (
            <button
              type="button"
              onClick={signOut}
              className={`min-h-[48px] rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                isDarkTheme
                  ? 'border-red-500 bg-red-500/10 text-red-200 hover:bg-red-500/15'
                  : 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Sign out
            </button>
          )}
          {isGuestMode && !session && (
            <button
              type="button"
              onClick={onLogin}
              className={`min-h-[48px] rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                isDarkTheme
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15'
                  : 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
