import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cardMark, cardPath, cardThumbUrl, type CardGroup } from '../data/cardCatalog'
import { getCardDisplayName } from '../data/cardNames'
import { useLangPath } from '../i18n/useLangPath'
import { CardFrontFace } from './TarotCard'

/** Nodes per row on desktop; tablet always uses 4. Keep in sync with `.journey` in index.css. */
const DESKTOP_PER_ROW: Record<string, number> = { majors: 8 }
const DEFAULT_PER_ROW = 7
const TABLET_PER_ROW = 4

type Segment = 'right' | 'left' | 'turn-right' | 'turn-left' | 'end'

/**
 * Where node `i` of `n` sits on a path that runs left to right, turns at the
 * edge and comes back (boustrophedon), `per` nodes to a row — and which way
 * its line segment runs to the next node.
 */
function place(i: number, n: number, per: number) {
  const row = Math.floor(i / per)
  const pos = i % per
  const backwards = row % 2 === 1
  const col = backwards ? per - pos : pos + 1
  let segment: Segment
  if (i === n - 1) segment = 'end'
  else if (pos === per - 1) segment = backwards ? 'turn-left' : 'turn-right'
  else segment = backwards ? 'left' : 'right'
  return { row: row + 1, col, segment }
}

export default function JourneyPath({ group }: { group: CardGroup }) {
  const { t } = useTranslation()
  const to = useLangPath()
  const n = group.cards.length
  const per = DESKTOP_PER_ROW[group.id] ?? DEFAULT_PER_ROW

  return (
    <ol className="journey" style={{ '--per': per } as CSSProperties}>
      {group.cards.map((card, i) => {
        const desktop = place(i, n, per)
        const tablet = place(i, n, TABLET_PER_ROW)
        const name = getCardDisplayName(card, t)
        return (
          <li
            key={card.id}
            className="journey-node"
            data-seg-d={desktop.segment}
            data-seg-t={tablet.segment}
            style={
              {
                '--rd': desktop.row,
                '--cd': desktop.col,
                '--rt': tablet.row,
                '--ct': tablet.col,
              } as CSSProperties
            }
          >
            <Link to={to(cardPath(card))} className="journey-link">
              <span className="journey-mark">{cardMark(card, t)}</span>
              <span className="journey-dot" aria-hidden="true"></span>
              <span className="journey-art">
                <CardFrontFace card={card} name={name} artSrc={cardThumbUrl(card.id)} focusable={false} />
              </span>
              <span className="journey-name">{name}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
