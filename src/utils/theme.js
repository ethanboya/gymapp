export function getThemeClasses(isDarkTheme) {
  return {
    // Text
    headingTextClass: isDarkTheme ? 'text-white' : 'text-slate-900',
    bodyTextClass: isDarkTheme ? 'text-slate-300' : 'text-slate-600',
    mutedTextClass: isDarkTheme ? 'text-slate-400' : 'text-slate-500',
    subtleTextClass: isDarkTheme ? 'text-slate-500' : 'text-slate-400',

    // Surfaces
    panelClass: isDarkTheme
      ? 'rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20'
      : 'rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60',
    softPanelClass: isDarkTheme
      ? 'rounded-3xl border border-slate-800 bg-slate-950/80 p-5'
      : 'rounded-3xl border border-slate-200 bg-slate-50 p-5',
    // A card nested inside a panel/softPanel - e.g. block cards, PR cards, session cards
    nestedCardClass: isDarkTheme ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white',
    // A card nested inside a softPanel (needs to read as a step "up" from the recessed bg)
    raisedCardClass: isDarkTheme ? 'bg-slate-900' : 'bg-white border border-slate-200',
    // A list row inside a card - exercise list items, set rows
    listRowClass: isDarkTheme ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700',

    // Borders
    borderClass: isDarkTheme ? 'border-slate-800' : 'border-slate-200',

    // Inputs
    inputClass: isDarkTheme
      ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-400'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500',

    // Badges / pills
    pillNeutralClass: isDarkTheme ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600',
    pillOutlineClass: isDarkTheme
      ? 'border border-slate-700 bg-slate-900 text-slate-400'
      : 'border border-slate-300 bg-slate-100 text-slate-500',
    chipUnselectedClass: isDarkTheme
      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/80'
      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50',

    // Buttons
    buttonSecondaryClass: isDarkTheme
      ? 'rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800'
      : 'rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50',
    buttonAccentClass: isDarkTheme
      ? 'rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15'
      : 'rounded-2xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 transition hover:bg-emerald-100',
    buttonDangerClass: isDarkTheme
      ? 'rounded-2xl border border-red-500 bg-red-500/10 text-red-200 transition hover:bg-red-500/15'
      : 'rounded-2xl border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100',

    // Block cards (Home page split-day cards)
    blockCardDefaultClass: isDarkTheme
      ? 'border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-900/90'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
    blockCardPastClass: isDarkTheme ? 'border-slate-800 bg-slate-900/70 text-slate-500 shadow-none' : 'border-slate-200 bg-slate-100 text-slate-400 shadow-none'
  }
}
