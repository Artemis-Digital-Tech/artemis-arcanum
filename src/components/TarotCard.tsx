import { isMajor, type TarotCardData } from '../data/tarotDeck'
import { SuitMark } from '../data/suitGlyphs'
import { cardArtUrl } from '../data/cardImages'
import { useCardZoom } from './useCardZoom'

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
  /** A lighter file for small faces (the cards index); the zoom always reads the full art. */
  artSrc?: string
  /** False when the face sits inside a link, so it doesn't add a second tab stop. */
  focusable?: boolean
}

export function CardFrontFace({ card, name, artSrc, focusable = true }: CardFrontFaceProps) {
  const corner = cardCorner(card)
  const { zoomProps, zoomOverlay } = useCardZoom(card, name, corner, focusable)

  return (
    <div className="card-face card-front-face" {...zoomProps}>
      {/* Decorative: the name below it already carries the card's identity. */}
      <img className="card-art" src={artSrc ?? cardArtUrl(card.id)} alt="" loading="lazy" decoding="async" />
      <div className="card-face-body">
        <span className="board-card-num">
          {corner}
          {/* A minor card's number says little on its own — the suit is what places it. */}
          {!isMajor(card) && <SuitMark suit={card.suit} className="board-card-suit" />}
        </span>
        <span className="board-card-name">{name}</span>
      </div>
      {zoomOverlay}
    </div>
  )
}

/**
 * The enlarged read of a card, in flow rather than as a hover overlay: the
 * same chrome and `--card-art-filter-zoom` veil as the reading's zoom, for a
 * card's own page. Sized by its container, like every face.
 */
export function CardPlateFace({ card, name, alt }: { card: TarotCardData; name: string; alt: string }) {
  return (
    <div className="card-face card-plate-face">
      <img className="card-zoom-art" src={cardArtUrl(card.id)} alt={alt} width={440} height={789} fetchPriority="high" decoding="async" />
      <div className="card-face-body">
        <span className="board-card-num">
          {cardCorner(card)}
          {!isMajor(card) && <SuitMark suit={card.suit} className="board-card-suit" />}
        </span>
        <span className="board-card-name">{name}</span>
      </div>
    </div>
  )
}

function cardCorner(card: TarotCardData): string {
  return isMajor(card) ? toRoman(card.number) : rankBadge(card.rank)
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
