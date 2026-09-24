import type { ReactElement } from 'react'
import type { Suit } from './tarotDeck'

/** One mark per suit, drawn on the same 40x40 grid as the rest of the instrument's glyphs. */
const SUIT_GLYPHS: Record<Suit, ReactElement> = {
  wands: (
    <>
      <path d="M20 5v30" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15 12l10 3M15 25l10-3" stroke="currentColor" strokeWidth="0.9" />
    </>
  ),
  cups: (
    <>
      <path d="M12 9h16l-2 11a6 6 0 0 1-12 0z" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path d="M20 26v6M14 32h12" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  swords: (
    <>
      <path d="M20 4l-3 4v22l3 4 3-4V8z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M13 12h14" stroke="currentColor" strokeWidth="1" />
      <path d="M16 34h8" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  pentacles: (
    <>
      <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1" />
      <path
        d="M20 12l2.5 6.2 6.5.5-5 4.3 1.6 6.4-5.6-3.6-5.6 3.6 1.6-6.4-5-4.3 6.5-.5z"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
      />
    </>
  ),
}

export function SuitMark({ suit, className }: { suit: Suit; className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {SUIT_GLYPHS[suit]}
    </svg>
  )
}
