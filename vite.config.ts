import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import seo from './plugins/seo.ts'

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  // SITE_URL wins; on Vercel, fall back to the project's production domain.
  const siteUrl =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)

  return {
    plugins: [react(), seo(siteUrl)],
  }
})
