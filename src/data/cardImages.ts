/**
 * The deck's artwork: one WebP per card in `public/cards`, named by the card
 * id from `tarotDeck.ts` (e.g. `major-fool`, `minor-wands-ace`).
 */
export function cardArtUrl(cardId: string): string {
  return `/cards/${cardId}.webp`
}
