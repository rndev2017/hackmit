import { useEffect } from 'react'
import { usePrefersDarkMode } from './usePrefersDarkMode'
import { useSafeLocalStorage } from './useSafeLocalStorage'

export function useDarkMode() {
  const [isEnabled, setIsEnabled] = useSafeLocalStorage('dark-mode', false)

  useEffect(() => {
    if (window === undefined) return
    const root = window.document.documentElement
    
    // determine whether to add or remove dark classes
    if (!isEnabled) {
      root.classList.remove("dark")
    } else {
      root.classList.add('dark')
    }
  }, [isEnabled])

  return [isEnabled, setIsEnabled]
}