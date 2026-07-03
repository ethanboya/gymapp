import { NavLink, useLocation } from 'react-router-dom'
import { BLOCK_TYPE } from '../data/models'

const iconPaths = {
  home: 'M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9',
  log: 'M9 5h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 4h6m-6 4h6m-6 4h3',
  stats: 'M5 20V10m6 10V4m6 16v-7',
  builder: 'M4 6h16M4 12h16M4 18h10'
}

function NavIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={iconPaths[name]} />
    </svg>
  )
}

export function BottomNav({ selectedSplit, isDarkTheme }) {
  const location = useLocation()

  const currentIndex = selectedSplit?.currentIndex ?? 0
  const currentBlock = selectedSplit?.blocks?.[currentIndex]
  const fallbackBlock = selectedSplit?.blocks?.find((block) => block.type === BLOCK_TYPE.WORKOUT)
  const logTargetBlock = currentBlock?.type === BLOCK_TYPE.WORKOUT ? currentBlock : fallbackBlock
  const logPath = logTargetBlock ? `/log/${logTargetBlock.id}` : null

  const tabs = [
    { key: 'home', label: 'Home', path: '/', isActive: location.pathname === '/' },
    { key: 'log', label: 'Log', path: logPath, isActive: location.pathname.startsWith('/log') },
    { key: 'stats', label: 'Stats', path: '/stats', isActive: location.pathname.startsWith('/stats') },
    { key: 'builder', label: 'Builder', path: '/builder', isActive: location.pathname.startsWith('/builder') }
  ]

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur ${
        isDarkTheme ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-6xl">
        {tabs.map((tab) =>
          tab.path ? (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition ${
                tab.isActive ? 'text-emerald-400' : isDarkTheme ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <NavIcon name={tab.key} />
              {tab.label}
            </NavLink>
          ) : (
            <span
              key={tab.key}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium opacity-40 ${
                isDarkTheme ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <NavIcon name={tab.key} />
              {tab.label}
            </span>
          )
        )}
      </div>
    </nav>
  )
}
