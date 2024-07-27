import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        grid: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'13\' height=\'13\' fill=\'none\' stroke=\'rgb(0 0 0 / 0.04)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")',
        dot: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'16\' height=\'16\' fill=\'none\'%3e%3ccircle fill=\'rgb(0 0 0 / 0.06)\' id=\'pattern-circle\' cx=\'10\' cy=\'10\' r=\'1.6257413380501518\'%3e%3c/circle%3e%3c/svg%3e")',
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
