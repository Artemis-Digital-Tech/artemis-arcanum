import { useEffect, useState } from 'react'

/** Tracks a CSS media query, so a layout can switch component trees instead of just hiding DOM. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches)
    }

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
