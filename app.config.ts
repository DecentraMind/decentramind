export default defineAppConfig({
  ui: {
    primary: 'sky',
    gray: 'cool',

    icons: {
      dynamic: true
    },
    avatar: {
      rounded: 'object-cover'
    }
  }
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    // myLayer?: {
    //   /** Project name */
    //   name?: string
    // }
  }
}
