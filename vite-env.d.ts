/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NUXT_UI_PRO_LICENSE: string
  readonly TWITTER_BEARER_TOKEN: string
  readonly '4EVERLAND_API_REGION': string
  readonly '4EVERLAND_BUCKET_NAME': string
  readonly '4EVERLAND_API_KEY': string
  readonly '4EVERLAND_API_SECRET': string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
