export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** 'pt' here is Brazilian Portuguese (pt-BR) content — see CLAUDE.md. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt'

export function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}
