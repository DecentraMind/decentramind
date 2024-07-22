import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  experimental: {
    // see https://github.com/tailwindlabs/tailwindcss/discussions/7317
    // this config can keep chrome devtools from showing too much inherited styles,
    // which can be helpful for debugging, and also avoid devtool crashes
    optimizeUniversalDefaults: true,
  },
}
