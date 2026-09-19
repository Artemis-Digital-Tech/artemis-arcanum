import type { ReactElement } from 'react'
import type { Suit } from './tarotDeck'

/**
 * Linework glyphs for every card face, in the same minimal instrument-line
 * vocabulary as the landing page's deck catalog. This is the *default*
 * board template's card art — a future template can swap this map (and the
 * card-back design) for illustrated assets without touching game logic.
 */

const MAJOR_GLYPHS: Record<string, ReactElement> = {
  'major-fool': (
    <>
      <path d="M8 30 L20 6 L20 34" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="20" cy="10" r="3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 28h16" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  'major-magician': (
    <>
      <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 34c2-9 7-13 12-13s10 4 12 13" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 21v9" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  'major-highPriestess': (
    <>
      <path d="M20 6v28M9 20h22" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  'major-empress': (
    <>
      <ellipse cx="20" cy="20" rx="13" ry="9" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 11v18M12 20h16" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-emperor': (
    <>
      <rect x="10" y="10" width="20" height="20" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 20h20M20 10v20" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-hierophant': (
    <>
      <path d="M20 5 L33 32 L7 32 Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 15v10M15 27h10" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-lovers': (
    <>
      <circle cx="14" cy="18" r="7" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="26" cy="18" r="7" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  'major-chariot': (
    <>
      <rect x="11" y="14" width="18" height="13" stroke="currentColor" strokeWidth="1.1" />
      <path d="M14 14l6-8 6 8" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  'major-strength': (
    <>
      <path d="M20 4a16 16 0 1 0 0.001 0" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-hermit': (
    <path d="M14 8v22M26 8v22M14 30l12-2M14 10l12-2" stroke="currentColor" strokeWidth="1.1" />
  ),
  'major-wheelOfFortune': (
    <>
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <path d="M20 7v3M20 30v3M7 20h3M30 20h3" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-justice': (
    <>
      <path d="M20 6v28M9 13h22" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="9" cy="19" r="4" stroke="currentColor" strokeWidth="1" />
      <circle cx="31" cy="19" r="4" stroke="currentColor" strokeWidth="1" />
      <path d="M14 32h12" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-hangedMan': (
    <>
      <path d="M6 10h28" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 10v7" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="21" r="4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 25v5M16 34l4-6 4 6" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-death': (
    <>
      <path d="M14 8c0 6 8 6 8 0" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path d="M20 8v25" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 15c7 0 11 5 9 11" stroke="currentColor" strokeWidth="1" fill="none" />
    </>
  ),
  'major-temperance': (
    <>
      <path d="M8 12l4 11h4l4-11" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M20 29l4-11h4l4 11" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M17 16c3 5 3 7 6 12" stroke="currentColor" strokeWidth="1" fill="none" />
    </>
  ),
  'major-devil': (
    <>
      <circle cx="20" cy="21" r="8" stroke="currentColor" strokeWidth="1.1" />
      <path d="M14 15l-4-7M26 15l4-7" stroke="currentColor" strokeWidth="1.1" />
      <path d="M17 33l3-4 3 4" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-tower': (
    <>
      <rect x="14" y="15" width="12" height="19" stroke="currentColor" strokeWidth="1.1" />
      <path d="M20 4l-4 8h6l-4 8" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path d="M11 34l-2 4M29 34l2 4" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-star': (
    <>
      <path
        d="M20 6 L22.4 16.2 L32 18.6 L22.4 21 L20 31.2 L17.6 21 L8 18.6 L17.6 16.2 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="32" cy="10" r="1" fill="currentColor" />
      <circle cx="31" cy="30" r="1" fill="currentColor" />
    </>
  ),
  'major-moon': (
    <>
      <path
        d="M24 8a12 12 0 1 0 0 24 9.5 9.5 0 0 1 0-24z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
      />
      <path d="M7 32c4-3 8-3 12 0s8 3 12 0" stroke="currentColor" strokeWidth="1" fill="none" />
    </>
  ),
  'major-sun': (
    <>
      <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M20 4v5M20 31v5M4 20h5M31 20h5M9.5 9.5l3.5 3.5M27 27l3.5 3.5M9.5 30.5l3.5-3.5M27 13l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </>
  ),
  'major-judgement': (
    <>
      <path d="M13 12l11 4-11 4z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M13 16h-4" stroke="currentColor" strokeWidth="1" />
      <path d="M20 4v4M15 6l2.4 3M25 6l-2.4 3" stroke="currentColor" strokeWidth="1" />
      <rect x="14" y="26" width="12" height="8" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'major-world': (
    <>
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="20" cy="6" r="1.3" fill="currentColor" />
      <circle cx="20" cy="34" r="1.3" fill="currentColor" />
      <circle cx="6" cy="20" r="1.3" fill="currentColor" />
      <circle cx="34" cy="20" r="1.3" fill="currentColor" />
    </>
  ),
}

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

const SUIT_ID_TO_KEY: Record<Suit, string> = {
  wands: 'wands',
  cups: 'cups',
  swords: 'swords',
  pentacles: 'pentacles',
}

export function getMajorGlyph(id: string): ReactElement {
  return MAJOR_GLYPHS[id] ?? MAJOR_GLYPHS['major-fool']
}

export function getSuitGlyph(suit: Suit): ReactElement {
  return SUIT_GLYPHS[SUIT_ID_TO_KEY[suit] as Suit]
}
