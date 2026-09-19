import type { FramingId, SpreadId } from './spreads'

export interface SlotLayout {
  /** i18n key suffix under gameBoard.positions.<spreadId>.<id> (or .framingPositions.<framingId>.<id> for three-card). */
  id: string
  /** Percentage coordinates within the board area (0-100). */
  x: number
  y: number
  /** Card rotation in degrees, for crossed/tilted placements (e.g. the Celtic Cross's second card). */
  rotation?: number
  /** Crossed positions share a coordinate, so one of the pair labels upward. */
  labelAbove?: boolean
}

/** Board slot positions per spread, kept separate from visual rendering so a future board template can restyle the same geometry. */
export const SPREAD_LAYOUTS: Record<SpreadId, SlotLayout[]> = {
  single: [{ id: 'card', x: 50, y: 50 }],

  three: [
    { id: 'first', x: 22, y: 50 },
    { id: 'second', x: 50, y: 50 },
    { id: 'third', x: 78, y: 50 },
  ],

  // A shallow arch, rising from the lower-left, cresting in the middle, and settling lower-right.
  horseshoe: [
    { id: 'past', x: 8, y: 78 },
    { id: 'present', x: 22, y: 48 },
    { id: 'hiddenInfluences', x: 36, y: 26 },
    { id: 'obstacles', x: 50, y: 18 },
    { id: 'environment', x: 64, y: 26 },
    { id: 'advice', x: 78, y: 48 },
    { id: 'outcome', x: 92, y: 78 },
  ],

  // The classic cross (positions 1-6) plus a four-card staff to its right.
  celtic: [
    { id: 'present', x: 30, y: 52 },
    { id: 'challenge', x: 30, y: 52, rotation: 90, labelAbove: true },
    { id: 'foundation', x: 30, y: 82 },
    { id: 'recentPast', x: 10, y: 52 },
    { id: 'consciousGoal', x: 30, y: 22 },
    { id: 'nearFuture', x: 50, y: 52 },
    { id: 'self', x: 82, y: 88 },
    { id: 'environment', x: 82, y: 64 },
    { id: 'hopesFears', x: 82, y: 40 },
    { id: 'outcome', x: 82, y: 16 },
  ],
}

/** Width:height ratio for the board frame, tuned per spread's footprint. */
export const BOARD_ASPECT: Record<SpreadId, number> = {
  single: 2.4,
  three: 2.6,
  horseshoe: 1.7,
  celtic: 1.15,
}

/** Three-card position labels depend on the chosen framing rather than being fixed. */
export const THREE_CARD_POSITION_LABELS: Record<FramingId, [string, string, string]> = {
  pastPresentFuture: ['past', 'present', 'future'],
  situationActionResult: ['situation', 'action', 'result'],
  youOtherRelationship: ['you', 'other', 'relationship'],
  mindBodySpirit: ['mind', 'body', 'spirit'],
  prosConsAdvice: ['pros', 'cons', 'advice'],
}
