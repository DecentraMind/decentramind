import fs from 'fs'
import * as dotenv from 'dotenv'

// Determine the environment file
const customEnvFile = process.env.ENV_FILE ? `.env.${process.env.ENV_FILE}` : '.env'

if (fs.existsSync(customEnvFile)) {
  console.log(`Overriding environment variables with: ${customEnvFile}`)
  dotenv.config({ path: customEnvFile, override: true })
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.NUXT_UI_PRO_PATH || '@nuxt/ui-pro'],
  ssr: false,
  runtimeConfig: {
    // public environment variable, accessible in any file
    public: {
      chatroomFetchInterval: parseInt(process.env.NUXT_PUBLIC_CHATROOM_FETCH_INTERVAL || '5000'),
      debug: process.env.NUXT_PUBLIC_DEBUG,
      processID: process.env.VITE_PUBLIC_PROCESS_ID
    },
  },
  router: {
    options: {
      hashMode: true
    }
  },
  app: {
    baseURL: './'
  },
  icon: {
    serverBundle: false,
    clientBundle: {
      // list of icons to include in the client bundle
      icons: [
        'heroicons', 'svg-spinners', 'ri', 'uil'
      ],

      // scan all components in the project and include icons 
      scan: true,

      // include all custom collections in the client bundle
      includeCustomCollections: true, 

      // guard for uncompressed bundle size, will fail the build if exceeds
      sizeLimitKb: 256,
    },
  },
  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@vue-macros/nuxt',
    'nuxt-gtag',
    '@pinia/nuxt',
    '@ant-design-vue/nuxt',
    '@nuxt/test-utils/module',
    '@nuxt/icon'
  ],

  nitro: {
    esbuild: {
      options: {
        target: 'ES6'
      }
    },
    compressPublicAssets: { gzip: true, brotli: true },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // Run `cms:update` task every minute
      '0 */15 * * * *': 'periodicValidation'
    }
  },

  colorMode: {
    preference: 'light'
  },

  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en_US.json',
      },
      {
        code: 'zh',
        file: 'zh_CN.json',
      },
    ],
    // lazy: true,
    langDir: './public/lang/',
    defaultLocale: 'en',
  },

  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },
  tailwindcss: {
    cssPath: 'assets/css/custom.css'
  },
  ogImage: { enabled: false },
  macros: {
    setupSFC: true,
    betterDefine: false
  },

  devtools: {
    enabled: false
  },

  compatibilityDate: '2024-07-23',
})