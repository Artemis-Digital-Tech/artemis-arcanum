import { useLayoutEffect, useRef } from 'react'
import { animate } from 'animejs'
import { CardBackFace, CardFrontFace } from './TarotCard'
import type { TarotCardData } from '../data/tarotDeck'

interface FlyingCardProps {
  card: TarotCardData
  name: string
  /** Viewport rect of the card as it sat in the fan. */
  fromRect: DOMRect
  fromRotate: number
  /** The slot's card box, the flight's destination. */
  toEl: HTMLElement
  rotation: number
  onLanded: () => void
}

/**
 * The chosen card in flight: lifts off the fan, tumbles face-up mid-air, and
 * settles into its slot at that position's own tilt. Unmounts once landed.
 */
export default function FlyingCard({
  card,
  name,
  fromRect,
  fromRotate,
  toEl,
  rotation,
  onLanded,
}: FlyingCardProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const flip = flipRef.current
    if (!outer || !flip) return

    let landed = false
    const land = () => {
      if (landed) return
      landed = true
      onLanded()
    }
    // A plain timer, independent of rAF, so a throttled tab can't strand the card mid-flight.
    const unstick = setTimeout(land, 1250)

    const toRect = toEl.getBoundingClientRect()
    const cardW = toRect.width
    const cardH = toRect.height

    const startX = fromRect.left + fromRect.width / 2 - cardW / 2
    const startY = fromRect.top + fromRect.height / 2 - cardH / 2
    const endX = toRect.left
    const endY = toRect.top
    const liftY = Math.min(startY, endY) - 70

    outer.style.left = `${startX}px`
    outer.style.top = `${startY}px`
    outer.style.width = `${cardW}px`
    outer.style.height = `${cardH}px`

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 220 : 900

    animate(outer, {
      translateX: [0, (endX - startX) * 0.45, endX - startX],
      translateY: [0, liftY - startY, endY - startY],
      rotateZ: [fromRotate, fromRotate * 0.3, rotation],
      scale: [1, 1.22, 1],
      duration,
      ease: 'inOutQuart',
      onComplete: land,
    })

    if (!reduced) {
      animate(flip, {
        rotateY: [0, 180],
        rotateX: [0, -16, 0],
        duration: 760,
        delay: 120,
        ease: 'inOutQuad',
      })
    } else {
      flip.style.transform = 'rotateY(180deg)'
    }

    return () => clearTimeout(unstick)
    // Intentionally run once per mount: remounted with a fresh key for every draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={outerRef} className="flying-card">
      <div ref={flipRef} className="flying-card-flip">
        <CardBackFace />
        <CardFrontFace card={card} name={name} />
      </div>
    </div>
  )
}
