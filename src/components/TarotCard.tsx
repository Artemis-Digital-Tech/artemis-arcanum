import { isMajor, type TarotCardData } from '../data/tarotDeck'
import { getMajorGlyph, getSuitGlyph } from '../data/cardGlyphs'

export function CardBackFace() {
  return (
    <div className="card-face card-back-face">
      <div className="card-face-body">
        <span className="card-back-emblem" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1" />
            <path d="M12 3.6V6M12 18v2.4M3.6 12H6M18 12h2.4" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>
  )
}

interface CardFrontFaceProps {
  card: TarotCardData
  name: string
}

export function CardFrontFace({ card, name }: CardFrontFaceProps) {
  const glyph = isMajor(card) ? getMajorGlyph(card.id) : getSuitGlyph(card.suit)
  const corner = isMajor(card) ? toRoman(card.number) : rankBadge(card.rank)

  return (
    <div className="card-face card-front-face">
      <div className="card-face-body">
        <span className="board-card-num">{corner}</span>
        <svg className="board-card-glyph" viewBox="0 0 40 40" fill="none">
          {glyph}
        </svg>
        <span className="board-card-name">{name}</span>
      </div>
    </div>
  )
}

function toRoman(n: number): string {
  if (n === 0) return '0'
  const table: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let remaining = n
  let result = ''
  for (const [value, symbol] of table) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

/** Arabic for the minor arcana, so it reads apart from the majors' roman numerals at a glance. */
const RANK_BADGES: Record<string, string> = {
  ace: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  page: '11',
  knight: '12',
  queen: '13',
  king: '14',
}

function rankBadge(rank: string): string {
  return RANK_BADGES[rank] ?? ''
}
