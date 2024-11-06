// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.NUXT_UI_PRO_PATH || '@nuxt/ui-pro'],
  ssr: true,
  runtimeConfig: {
    // public environment variable, accessible in any file
    public: {
      chatroomFetchInterval: parseInt(process.env.NUXT_PUBLIC_CHATROOM_FETCH_INTERVAL || '5000'),
      debug: process.env.NUXT_PUBLIC_DEBUG,
      processID: process.env.VITE_PUBLIC_PROCESS_ID
    },
  },
  icon: {
    serverBundle: {
      remote: 'jsdelivr', // 'unpkg' or 'github-raw', or a custom function
    }
  },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@vue-macros/nuxt',
    'nuxt-lodash',
    'nuxt-gtag',
    '@pinia/nuxt',
    '@ant-design-vue/nuxt',
    '@nuxt/test-utils/module'
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
    // scheduledTasks: {
      // Run `cms:update` task every minute
      // '*/15 * * * * *': 'updateTask'
    // }
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
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
  },

  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },
  css: ['@/assets/css/custom.css'],

  macros: {
    setupSFC: true,
    betterDefine: false
  },

  devtools: {
    enabled: true
  },

  compatibilityDate: '2024-07-23',
})
