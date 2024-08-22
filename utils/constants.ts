import type { ChainNames, TradePlatform } from '~/types'

export const tradePlatforms: TradePlatform[] = [
  'ArSwap',
  'Permaswap',
  'Binance',
  'Coinbase',
]

type Token = {
  ticker: string
  label: string
  processID: string
  denomination: number
  logo?: string
}
/**
 * Token list with unique keys
 * TODO update token info from AO
 */
export const tokens: Record<string, Token> = {
  AR: {
    ticker: 'AR',
    label: 'AR', // Wrapped AR in AO
    processID: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    denomination: 12,
    logo: 'L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs'
  },
  USDA: {
    ticker: 'USDA-TST',
    label: 'USDA', // Astro USD (Test)
    processID: 'GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU',
    denomination: 12,
    logo: 'K8nurc9H0_ZQm17jbs3ryEs6MrlX-oIK_krpprWlQ-Q'
  },
  AO: {
    ticker: 'AO',
    label: 'AO',
    processID: 'm3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w',
    denomination: 12,
    logo: 'UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE'
  },
  FIZI: {
    ticker: 'PNTS',
    label: 'FIZI',
    processID: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
    denomination: 12,
    logo: 'SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY'
  },
  LINUX: {
    ticker: 'PNTS',
    label: 'LINUX',
    processID: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
    denomination: 12,
    logo: 'SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY'
  },
  Arena: {
    ticker: 'PNTS',
    label: 'Arena',
    processID: '-_8-spu6PyX-yYaPwf_1owaWc7Rakhbe8TaJ0Yschig',
    denomination: 12,
    logo: 'SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY'
  },
  BRKTST: {
    ticker: 'BRKTST',
    label: 'BRKTST', // Bark
    processID: '8p7ApPZxC_37M06QHVejCQrKsHbcJEerd3jWNkDUWPQ',
    denomination: 3,
    logo: 'AdFxCN1eEPboxNpCNL23WZRNhIhiamOeS-TUwx_Nr3Q'
  },
  TRUNK: {
    ticker: 'TRUNK',
    label: 'TRUNK',
    processID: 'OT9qTE2467gcozb2g8R6D6N3nQS94ENcaAIJfUzHCww',
    denomination: 3,
    logo: 'hqg-Em9DdYHYmMysyVi8LuTGF8IF_F7ZacgjYiSpj0k'
  },
  EXP: {
    ticker: 'EXP',
    label: 'EXP', // AR.IO EXP
    processID: 'aYrCboXVSl1AXL9gPFe3tfRxRf0ZmkOXH65mKT0HHZw',
    denomination: 6,
    logo: 'wfI-5PlYXL66_BqquCXm7kq-ic1keu0b2CqRjw82yrU'
  },
  '0rbit': {
    ticker: '0RBT',
    label: '0rbit', // 0rbit Points
    processID: 'BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc',
    denomination: 12,
    logo: 'quMiswyIjELM0FZtjVSiUtg9_-pvQ8K25yfxrp1TgnQ'
  },
  EARTH: {
    ticker: 'EARTH',
    label: 'Earth',
    processID: 'PBg5TSJPQp9xgXGfjN27GA28Mg5bQmNEdXH2TXY4t-A',
    denomination: 12
  },
  FIRE: {
    ticker: 'FIRE',
    label: 'Fire',
    processID: 'KmGmJieqSRJpbW6JJUFQrH3sQPEG9F6DQETlXNt4GpM',
    denomination: 12
  },
  AIR: {
    ticker: 'AIR',
    label: 'Air',
    processID: '2nfFJb8LIA69gwuLNcFQezSuw4CXPE4--U-j-7cxKOU',
    denomination: 12
  },
  'FIRE-EARTH': {
    ticker: 'FIRE-EARTH',
    label: 'Lava',
    processID: 'NkXX3uZ4oGkQ3DPAWtjLb2sTA-yxmZKdlOlEHqMfWLQ',
    denomination: 12
  },
}

export type TokenName = keyof typeof tokens

export const tokenNames: TokenName[] = Object.keys(tokens) as TokenName[]

export const tokenOptions = tokenNames.map((value) => {
  return {
    label: tokens[value].label,
    value,
  }
})

export const tokenProcessIDs = tokenNames.reduce((carry, name) => {
  carry[name] = tokens[name].processID
  return carry
}, {} as { [key in TokenName]: string })

export const tokenProcesses = Object.values(tokenProcessIDs)

export const tokensByProcessID = tokenNames.reduce((carry, name) => {
  carry[tokens[name].processID] = tokens[name]
  return carry
}, {} as { [key: string]: Token })

export const denominations = tokenNames.reduce((carry, name) => {
  carry[name] = Math.pow(10, tokens[name].denomination)
  return carry
}, {} as { [key in TokenName]: number })

export type CommunityToken = {
  tokenName: TokenName;
  showTokenName: boolean;
}

export type TokenSupply = {
  name: string;
  supply: number;
}

export type Timezone = `GMT-${number}:00` | `GMT+${number}:00`
export const timezones: Timezone[] = [
  'GMT-11:00',
  'GMT-10:00',
  'GMT-9:00',
  'GMT-8:00',
  'GMT-7:00',
  'GMT-6:00',
  'GMT-5:00',
  'GMT-4:00',
  'GMT-3:00',
  'GMT-2:00',
  'GMT-1:00',
  'GMT+0:00',
  'GMT+1:00',
  'GMT+2:00',
  'GMT+3:00',
  'GMT+4:00',
  'GMT+5:00',
  'GMT+6:00',
  'GMT+7:00',
  'GMT+8:00',
  'GMT+9:00',
  'GMT+10:00',
  'GMT+11:00',
  'GMT+12:00',
  'GMT+13:00',
  'GMT+14:00',
]

// 接受手续费的地址
export const decentraMindReceiver = 'C0Q61xdmhFnpi5bksiGH88N7Kisz_vjTeBSgpNQ1gdo'
export const DM_BOUNTY_CHARGE_RATE:number = 0.05

export const allowedImageType = ['image/jpeg', 'image/png']

export const uploadPath = {
  communityLogo: '/c',
  tokenLogo: '/t',
  userAvatar: '/u'
}
export type UploadPath = typeof uploadPath

export const maxTotalChances = 200

export const tokenChains = ['AO'] as ChainNames[]

export const communityRightPages = {
  '#quests': Symbol(),
  '#chatroom': Symbol()
}
export type PageSymbol = (typeof communityRightPages)[keyof typeof communityRightPages]

export const ARWEAVE_ID_REGEXP = /^[a-zA-Z0-9-_]{43}$/
