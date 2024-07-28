// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.NUXT_UI_PRO_PATH || '@nuxt/ui-pro'],

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
    '@ant-design-vue/nuxt'
  ],
  lodash: {
    prefix: '_',
    prefixSkip: ['string'],
    upperAfterPrefix: false
  },

  nitro: {
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // Run `cms:update` task every minute
      '*/15 * * * * *': 'updateTask'
    }
  },

  colorMode: {
    preference: 'light'
  },

  i18n: {
    legacy: false,
    globalInjection: true,
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

  macros: {
    setupSFC: true,
  },

  devtools: {
    enabled: true
  },

  compatibilityDate: '2024-07-23',
})
