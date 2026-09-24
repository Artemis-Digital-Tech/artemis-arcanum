import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Client-side navigation keeps the previous page's scroll position; content
 * pages instead start at the top, or at the `#anchor` the link pointed to
 * (e.g. a breadcrumb to /cartas#paus).
 */
export function useScrollOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
}
