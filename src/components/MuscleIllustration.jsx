const REGION_GROUPS = {
  Chest: ['chest'],
  Shoulders: ['leftShoulder', 'rightShoulder'],
  Arms: ['leftArm', 'rightArm'],
  Back: ['torso'],
  'Upper Back': ['torso', 'leftShoulder', 'rightShoulder'],
  'Posterior Chain': ['torso', 'leftLeg', 'rightLeg'],
  Legs: ['leftLeg', 'rightLeg'],
  Core: ['core']
}

const BACK_FACING_GROUPS = new Set(['Back', 'Upper Back', 'Posterior Chain'])

export function MuscleIllustration({ muscleGroup, isDarkTheme = true }) {
  const activeRegions = new Set(REGION_GROUPS[muscleGroup] || [])
  const isBackFacing = BACK_FACING_GROUPS.has(muscleGroup)
  const activeColor = isBackFacing ? '#0ea5e9' : '#10b981'
  const inactiveColor = isDarkTheme ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.35)'
  const outlineColor = isDarkTheme ? 'rgba(148,163,184,0.35)' : 'rgba(100,116,139,0.45)'

  const colorFor = (region) => (activeRegions.has(region) ? activeColor : inactiveColor)
  const chestActive = activeRegions.has('chest') || activeRegions.has('torso')
  const coreActive = activeRegions.has('core') || activeRegions.has('torso')

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 160 220" className="h-48 w-32">
        <circle cx="80" cy="24" r="16" fill={outlineColor} />
        <rect x="72" y="38" width="16" height="10" fill={inactiveColor} />
        <circle cx="46" cy="58" r="14" fill={colorFor('leftShoulder')} />
        <circle cx="114" cy="58" r="14" fill={colorFor('rightShoulder')} />
        <rect x="52" y="48" width="56" height="42" rx="14" fill={chestActive ? activeColor : inactiveColor} />
        <rect x="58" y="90" width="44" height="32" rx="10" fill={coreActive ? activeColor : inactiveColor} />
        <rect x="24" y="60" width="16" height="70" rx="8" fill={colorFor('leftArm')} />
        <rect x="120" y="60" width="16" height="70" rx="8" fill={colorFor('rightArm')} />
        <rect x="56" y="122" width="20" height="80" rx="10" fill={colorFor('leftLeg')} />
        <rect x="84" y="122" width="20" height="80" rx="10" fill={colorFor('rightLeg')} />
      </svg>
      {isBackFacing && (
        <p className={`text-[11px] uppercase tracking-[0.2em] ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
          Shown from the front — targets muscles on your back
        </p>
      )}
      {!REGION_GROUPS[muscleGroup] && (
        <p className={`text-[11px] uppercase tracking-[0.2em] ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>No reference diagram for this exercise</p>
      )}
    </div>
  )
}
