export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined

/** False until `.env.local` carries real Auth0 credentials — the app degrades gracefully until then. */
export const isAuth0Configured = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID)
