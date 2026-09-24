export interface CardContent {
  /** Astrological or elemental correspondence; Major Arcana only. */
  correspondence: string | null
  keywords: { upright: string[]; reversed: string[] }
  meaning: { upright: string; reversed: string }
  love: string
  work: string
  advice: string
}

export type CardContentMap = Record<string, CardContent>
