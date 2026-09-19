import type { ReadingRequest, ReadingResponse, ReadingResponseCard } from '../data/reading'

/**
 * n8n webhook that runs the reading AI agent. This is the *test* webhook
 * (only live while the workflow is open and listening in the n8n editor);
 * swap to the `/webhook/` production path once the workflow is activated.
 */
const READING_WEBHOOK_URL = 'https://n8n-n8n.kltkek.easypanel.host/webhook/make-arcanum-read'

export class ArcanumAPIError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ArcanumAPIError'
    this.status = status
  }
}

function isReadingResponseCard(value: unknown): value is ReadingResponseCard {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<ReadingResponseCard>
  return typeof v.position === 'string' && typeof v.meaning === 'string'
}

function isReadingResponseShape(value: unknown): value is Omit<ReadingResponse, 'title'> {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<ReadingResponse>
  return (
    typeof v.overview === 'string' &&
    Array.isArray(v.cards) &&
    v.cards.every(isReadingResponseCard) &&
    (v.closing === undefined || typeof v.closing === 'string')
  )
}

/** `title` is normalized here rather than required, so an agent that hasn't been updated yet still renders. */
function normalizeReadingResponse(value: unknown): ReadingResponse | null {
  if (!isReadingResponseShape(value)) return null
  const title = typeof (value as Partial<ReadingResponse>).title === 'string' ? (value as ReadingResponse).title : ''
  return { ...value, title }
}

function safeParseJSON(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * n8n AI Agent nodes commonly wrap their output in `{ output: "...json..." }`,
 * sometimes inside an array, and sometimes the JSON itself arrives fenced in
 * a markdown code block. Unwrap all of that before validating the shape.
 */
function extractReadingPayload(raw: unknown): unknown {
  const unwrapped = Array.isArray(raw) ? raw[0] : raw
  const candidate =
    unwrapped && typeof unwrapped === 'object' && 'output' in (unwrapped as Record<string, unknown>)
      ? (unwrapped as Record<string, unknown>).output
      : unwrapped

  if (typeof candidate !== 'string') return candidate

  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return safeParseJSON(fenced ? fenced[1] : candidate)
}

export const ArcanumAPI = {
  async generateReading(request: ReadingRequest, signal?: AbortSignal): Promise<ReadingResponse> {
    let response: Response
    try {
      response = await fetch(READING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal,
      })
    } catch {
      throw new ArcanumAPIError('network')
    }

    if (!response.ok) {
      throw new ArcanumAPIError('http', response.status)
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new ArcanumAPIError('parse')
    }

    const reading = normalizeReadingResponse(extractReadingPayload(payload))
    if (!reading) {
      throw new ArcanumAPIError('shape')
    }

    return reading
  },
}
