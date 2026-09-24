import { useEffect, useState } from 'react'
import { DEFAULT_LANGUAGE } from '../../i18n/constants'
import type { CardContentMap } from './types'

export type { CardContent, CardContentMap } from './types'

/**
 * Card meanings live outside the i18n bundle — ~75 KB per language that only
 * the card pages need — and load on demand, one file per language with the
 * same keys (the pt/en parity rule from CLAUDE.md applies here too).
 */
const loaders = import.meta.glob<CardContentMap>('./*.json', { import: 'default' })
const cache = new Map<string, Promise<CardContentMap>>()

function loadCardContent(lang: string): Promise<CardContentMap> {
  const key = loaders[`./${lang}.json`] ? lang : DEFAULT_LANGUAGE
  let promise = cache.get(key)
  if (!promise) {
    promise = loaders[`./${key}.json`]()
    // A failed load must not stick in the cache, or a retry would replay the failure.
    promise.catch(() => cache.delete(key))
    cache.set(key, promise)
  }
  return promise
}

type State = { status: 'loading' } | { status: 'ready'; data: CardContentMap } | { status: 'error' }

export function useCardContent(lang: string) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    loadCardContent(lang).then(
      (data) => active && setState({ status: 'ready', data }),
      () => active && setState({ status: 'error' }),
    )
    return () => {
      active = false
    }
  }, [lang])

  return state
}
