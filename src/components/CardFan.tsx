import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { CardBackFace } from './TarotCard'

type FanMode = 'arc' | 'ribbon'

interface Placement {
  /** Card centre, in pixels relative to the fan track. */
  x: number
  y: number
  rotate: number
}

interface CardFanProps {
  cards: string[]
  disabled: boolean
  onPick: (cardId: string, rect: DOMRect, rotate: number) => void
  ariaLabel: (index: number, total: number) => string
}

/** A wide, shallow arc: the deck fanned across the table, face down. */
const ARC = { radius: 1100, spreadDeg: 37, apexTop: 62 }
/** Narrow screens get a flatter, scrollable ribbon with touch-sized steps. */
const RIBBON = { step: 26, top: 58, dip: 14, tilt: 6 }

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readPx(el: HTMLElement, name: string, fallback: number) {
  const value = parseFloat(getComputedStyle(el).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

function computeArc(count: number, width: number, cardH: number): Placement[] {
  const step = count > 1 ? ARC.spreadDeg / (count - 1) : 0
  const pivotX = width / 2
  const pivotY = ARC.apexTop + cardH / 2 + ARC.radius
  const mid = (count - 1) / 2

  return Array.from({ length: count }, (_, i) => {
    const deg = (i - mid) * step
    const rad = (deg * Math.PI) / 180
    return {
      x: pivotX + ARC.radius * Math.sin(rad),
      y: pivotY - ARC.radius * Math.cos(rad),
      rotate: deg,
    }
  })
}

function computeRibbon(count: number, cardW: number, cardH: number): Placement[] {
  const mid = (count - 1) / 2
  return Array.from({ length: count }, (_, i) => {
    const t = mid === 0 ? 0 : (i - mid) / mid
    return {
      x: cardW / 2 + 24 + i * RIBBON.step,
      y: RIBBON.top + cardH / 2 + t * t * RIBBON.dip,
      rotate: t * RIBBON.tilt,
    }
  })
}

export default function CardFan({ cards, disabled, onPick, ariaLabel }: CardFanProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardEls = useRef(new Map<string, HTMLButtonElement>())
  const placements = useRef<Placement[]>([])
  const hasDealt = useRef(false)
  const [mode, setMode] = useState<FanMode>(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 981px)').matches ? 'arc' : 'ribbon',
  )
  const [width, setWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 981px)')
    const sync = () => setMode(query.matches ? 'arc' : 'ribbon')
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || width === 0 || cards.length === 0) return

    const cardW = readPx(track, '--card-w', 108)
    const cardH = readPx(track, '--card-h', 172)
    const next =
      mode === 'arc' ? computeArc(cards.length, width, cardH) : computeRibbon(cards.length, cardW, cardH)
    placements.current = next

    const transformFor = (p: Placement) =>
      `translate(${p.x - cardW / 2}px, ${p.y - cardH / 2}px) rotate(${p.rotate}deg)`

    if (!hasDealt.current) {
      hasDealt.current = true
      // Rest first, so the fan is correct even if animation frames never run,
      // then deal out from a single stacked pile.
      cards.forEach((id, i) => {
        const el = cardEls.current.get(id)
        if (el) el.style.transform = transformFor(next[i])
      })

      if (prefersReducedMotion()) return

      const apex = next[Math.floor(cards.length / 2)]
      cards.forEach((id, i) => {
        const el = cardEls.current.get(id)
        if (!el) return
        const p = next[i]
        animate(el, {
          translateX: [apex.x - cardW / 2, p.x - cardW / 2],
          translateY: [apex.y - cardH / 2 + 26, p.y - cardH / 2],
          rotateZ: [0, p.rotate],
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 720,
          delay: stagger(7, { from: 'center' }),
          ease: 'outExpo',
        })
      })
      return
    }

    if (prefersReducedMotion()) {
      cards.forEach((id, i) => {
        const el = cardEls.current.get(id)
        if (el) el.style.transform = transformFor(next[i])
      })
      return
    }

    // Re-fan: the remaining cards close the gap left by the card just taken.
    cards.forEach((id, i) => {
      const el = cardEls.current.get(id)
      if (!el) return
      const p = next[i]
      animate(el, {
        translateX: p.x - cardW / 2,
        translateY: p.y - cardH / 2,
        rotateZ: p.rotate,
        duration: 620,
        delay: stagger(4, { from: 'center' }),
        ease: 'outQuint',
      })
    })
  }, [cards, mode, width])

  useEffect(() => {
    if (activeIndex > cards.length - 1) setActiveIndex(Math.max(0, cards.length - 1))
  }, [cards.length, activeIndex])

  const registerCard = useCallback((id: string) => {
    return (el: HTMLButtonElement | null) => {
      if (el) cardEls.current.set(id, el)
      else cardEls.current.delete(id)
    }
  }, [])

  function focusCard(index: number) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index))
    setActiveIndex(clamped)
    const el = cardEls.current.get(cards[clamped])
    el?.focus()
    el?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusCard(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusCard(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusCard(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusCard(cards.length - 1)
    }
  }

  function handlePick(cardId: string, index: number) {
    if (disabled) return
    const el = cardEls.current.get(cardId)
    if (!el) return
    onPick(cardId, el.getBoundingClientRect(), placements.current[index]?.rotate ?? 0)
  }

  const cardW = trackRef.current ? readPx(trackRef.current, '--card-w', 108) : 108
  const trackWidth = mode === 'ribbon' ? (cards.length - 1) * RIBBON.step + cardW + 48 : undefined

  return (
    <div className={`card-fan card-fan--${mode}`} ref={scrollRef}>
      <div className="card-fan-track" ref={trackRef} style={trackWidth ? { width: trackWidth } : undefined}>
        {cards.map((id, index) => (
          <button
            key={id}
            ref={registerCard(id)}
            type="button"
            className="fan-card"
            style={{ zIndex: index }}
            tabIndex={index === activeIndex ? 0 : -1}
            disabled={disabled}
            aria-label={ariaLabel(index + 1, cards.length)}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => handlePick(id, index)}
          >
            <span className="fan-card-inner">
              <CardBackFace />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
