import type { SpreadId } from './spreads'

/** One drawn card, as sent to the reading webhook. */
export interface ReadingRequestCard {
  /** Slot id (e.g. "present", "challenge") — echoed back to zip the response to board slots. */
  position: string
  positionLabel: string
  index: number
  cardId: string
  cardName: string
  arcana: 'major' | 'minor'
  suit?: string
  rank?: string
}

export interface ReadingRequest {
  question: string
  language: string
  /** First name only, from Auth0 — omitted when signed out. Never email or any other account detail. */
  visitorName?: string
  spread: {
    id: SpreadId
    name: string
    cardCount: number
    framing: string | null
  }
  cards: ReadingRequestCard[]
}

/** One card's individual meaning, as returned by the AI agent. */
export interface ReadingResponseCard {
  position: string
  meaning: string
}

export interface ReadingResponse {
  /** A short, specific title for this particular reading (not a generic heading). */
  title: string
  /** The full reading, several paragraphs, separated by "\n". */
  overview: string
  cards: ReadingResponseCard[]
  /** A short closing reflection or invitation — optional; older agent versions may omit it. */
  closing?: string
}
