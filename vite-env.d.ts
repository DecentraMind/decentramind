/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NUXT_UI_PRO_LICENSE: string
  readonly TWITTER_BEARER_TOKEN: string
  readonly EVERLAND_API_REGION: string
  readonly EVERLAND_BUCKET_NAME: string
  readonly EVERLAND_API_KEY: string
  readonly EVERLAND_API_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
