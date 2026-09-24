import { useCallback, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cardArtUrl } from '../data/cardImages'
import { SuitMark } from '../data/suitGlyphs'
import { isMajor, type TarotCardData } from '../data/tarotDeck'

/** Preferred preview width in CSS pixels; the deck's cards are 5:8. */
const PREFERRED_WIDTH = 300
const RATIO = 1.6
const MIN_WIDTH = 150
const GAP = 16
const EDGE = 12

interface Placement {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Sizes the preview to whatever the viewport can actually hold, then places it
 * beside the card — flipping to whichever side has room and clamping
 * vertically, so it never opens off-screen or overflows a short window.
 */
function placementFor(rect: DOMRect): Placement {
  const heightBudget = window.innerHeight - EDGE * 2
  const width = Math.max(MIN_WIDTH, Math.min(PREFERRED_WIDTH, heightBudget / RATIO))
  const height = width * RATIO

  const fitsRight = rect.right + GAP + width + EDGE <= window.innerWidth
  const left = fitsRight ? rect.right + GAP : rect.left - GAP - width
  const centered = rect.top + rect.height / 2 - height / 2

  return {
    left: Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE)),
    top: Math.max(EDGE, Math.min(centered, window.innerHeight - height - EDGE)),
    width,
    height,
  }
}

interface CardZoom {
  /** Spread onto the element that should answer to hover — the whole card, not just its art. */
  zoomProps: {
    ref: React.RefObject<HTMLDivElement | null>
    tabIndex: number
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
  }
  zoomOverlay: ReactNode
}

/**
 * Opens a larger read of a card while it is hovered or keyboard-focused.
 *
 * The overlay is a portal, so it escapes the card's own clipping and
 * transforms, and the trigger is the card face rather than the `<img>`:
 * the numeral/name layer sits on top of the art and would otherwise
 * swallow every pointer event before it reached the image.
 */
export function useCardZoom(card: TarotCardData, name: string, corner: string): CardZoom {
  const ref = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<Placement | null>(null)

  const open = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Touch devices report no hover; there the tap would open a preview the
    // visitor never asked for and cannot dismiss.
    if (!window.matchMedia('(hover: hover)').matches) return
    setPlacement(placementFor(el.getBoundingClientRect()))
  }, [])

  const close = useCallback(() => setPlacement(null), [])

  const zoomOverlay = placement
    ? createPortal(
        <div
          className="card-zoom"
          style={{
            left: placement.left,
            top: placement.top,
            width: placement.width,
            height: placement.height,
            // The face's chrome sizes itself from the card's own width, so the
            // enlarged read scales its numeral, suit and name with no extra rules.
            '--card-w': `${placement.width}px`,
          } as React.CSSProperties}
          aria-hidden="true"
        >
          <img className="card-zoom-art" src={cardArtUrl(card.id)} alt="" />
          <div className="card-face-body">
            <span className="board-card-num">
              {corner}
              {!isMajor(card) && <SuitMark suit={card.suit} className="board-card-suit" />}
            </span>
            <span className="board-card-name">{name}</span>
          </div>
        </div>,
        document.body,
      )
    : null

  return {
    zoomProps: {
      ref,
      tabIndex: 0,
      onMouseEnter: open,
      onMouseLeave: close,
      onFocus: open,
      onBlur: close,
    },
    zoomOverlay,
  }
}
