import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { NavVariantContext } from './navVariant'

/** Keep in sync with the `@media (max-width: 980px)` block in index.css. */
const MOBILE_QUERY = '(max-width: 980px)'

interface NavMenuProps {
  /** Section anchors, landing page only. On mobile they move into the panel instead of disappearing. */
  links?: ReactNode
  /** Utility controls: language switcher, account menu, and the page's own CTA or back link. */
  children: ReactNode
}

/**
 * The header's right side. Above the breakpoint it lays the controls out
 * inline; below it, they collapse into a hamburger panel. The two branches
 * render different trees rather than hiding one with CSS, so the mobile
 * panel can restructure its contents (see AccountMenu's "panel" variant)
 * instead of squeezing desktop widgets into a narrow column.
 */
export default function NavMenu({ links, children }: NavMenuProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY)

  if (isMobile) {
    return <NavMenuMobile links={links}>{children}</NavMenuMobile>
  }

  return (
    <>
      {links && <nav className="navlinks">{links}</nav>}
      <div className="nav-utility">{children}</div>
    </>
  )
}

function NavMenuMobile({ links, children }: NavMenuProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  /**
   * Same-page anchors (#mechanism) never change the pathname, so the effect
   * above would leave the panel open on top of the section it just jumped
   * to. Every control in the panel is a terminal action, so closing on any
   * of them is correct.
   */
  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('a, button')) setOpen(false)
  }

  return (
    <div className="nav-mobile" ref={rootRef}>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="nav-panel"
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="nav-panel" id="nav-panel" onClick={handlePanelClick}>
          {links && <nav className="nav-panel-links">{links}</nav>}
          <NavVariantContext.Provider value="panel">
            <div className="nav-panel-utility">{children}</div>
          </NavVariantContext.Provider>
        </div>
      )}
    </div>
  )
}
