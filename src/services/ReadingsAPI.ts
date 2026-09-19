import type { ReadingRequest, ReadingResponse, ReadingResponseCard } from '../data/reading'

/**
 * Supabase edge function that owns the `readings` table. It verifies the
 * caller's Auth0 ID token itself (see its source), so every call here must
 * carry that token as a bearer token — there is no Supabase session.
 */
const READINGS_FUNCTION_URL = 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/readings'

export class ReadingsAPIError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ReadingsAPIError'
    this.status = status
  }
}

export interface SavedReading {
  id: string
  question: string
  spreadId: string
  spreadName: string
  framingId: string | null
  cards: ReadingRequest['cards']
  response: ReadingResponse
  createdAt: string
}

function isReadingResponseCard(value: unknown): value is ReadingResponseCard {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<ReadingResponseCard>
  return typeof v.position === 'string' && typeof v.meaning === 'string'
}

function isSavedReadingRow(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.question === 'string' &&
    typeof v.spread_id === 'string' &&
    typeof v.spread_name === 'string' &&
    Array.isArray(v.cards) &&
    typeof v.response === 'object' &&
    v.response !== null &&
    typeof v.created_at === 'string'
  )
}

function normalizeRow(row: Record<string, unknown>): SavedReading | null {
  const response = row.response as Partial<ReadingResponse>
  if (
    typeof response.overview !== 'string' ||
    !Array.isArray(response.cards) ||
    !response.cards.every(isReadingResponseCard)
  ) {
    return null
  }
  return {
    id: row.id as string,
    question: row.question as string,
    spreadId: row.spread_id as string,
    spreadName: row.spread_name as string,
    framingId: typeof row.framing_id === 'string' ? row.framing_id : null,
    cards: row.cards as ReadingRequest['cards'],
    response: {
      title: typeof response.title === 'string' ? response.title : '',
      overview: response.overview,
      cards: response.cards,
      closing: typeof response.closing === 'string' ? response.closing : undefined,
    },
    createdAt: row.created_at as string,
  }
}

export const ReadingsAPI = {
  /** Fire this after a reading finishes generating. Failures are non-fatal by design — call sites should swallow them rather than interrupt the reading the visitor already has. */
  async save(request: ReadingRequest, response: ReadingResponse, idToken: string): Promise<void> {
    const res = await fetch(READINGS_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({
        question: request.question,
        spreadId: request.spread.id,
        spreadName: request.spread.name,
        framingId: request.spread.framing,
        cards: request.cards,
        response,
      }),
    })
    if (!res.ok) throw new ReadingsAPIError('http', res.status)
  },

  async list(idToken: string): Promise<SavedReading[]> {
    let res: Response
    try {
      res = await fetch(READINGS_FUNCTION_URL, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
    } catch {
      throw new ReadingsAPIError('network')
    }
    if (!res.ok) throw new ReadingsAPIError('http', res.status)

    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      throw new ReadingsAPIError('parse')
    }

    const rows = (payload as { readings?: unknown[] })?.readings
    if (!Array.isArray(rows)) throw new ReadingsAPIError('shape')

    return rows.filter(isSavedReadingRow).map(normalizeRow).filter((r): r is SavedReading => r !== null)
  },
}
