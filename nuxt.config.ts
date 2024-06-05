// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.WEB3_FULL_STACK_LAYER_PATH || '@web3-fullstack/layer'],
  modules: [
    '@nuxtjs/i18n',
    // '@nuxtjs/axios',
    // '@nuxtjs/proxy'
  ],
  // nitro: {
  //   devProxy: {
  //     "/user": {
  //       target: "https://api.twitter.com", // 这里是接口地址
  //       changeOrigin: true
  //     },
  //   },
  //
  //   routeRules: {
  //     '/user': {
  //       proxy: 'https://api.twitter.com'
  //     }
  //   }
  // },
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
  devtools: {
    enabled: true
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/'],
      cookieRedirect: false,
    }
  }
})
