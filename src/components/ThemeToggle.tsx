'use client'

import { MoonStar, SunMedium } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

type ThemeToggleProps = {
  compact?: boolean
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isDark = isMounted && resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-slate-900 ${
        compact ? 'h-11 w-11' : 'h-11 px-3.5'
      }`}
    >
      <span className="relative h-5 w-5 shrink-0">
        <SunMedium
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <MoonStar
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </span>
      {!compact && (
        <span className="text-sm font-semibold">
          {isMounted ? (isDark ? 'Light mode' : 'Dark mode') : 'Theme'}
        </span>
      )}
    </button>
  )
}
