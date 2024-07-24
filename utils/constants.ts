import type { TradePlatform } from '~/types'

export const tradePlatforms: TradePlatform[] = [
  'ArSwap',
  'Permaswap',
  'Binance',
  'Coinbase',
]

/**
 * Token list with unique keys
 * TODO update token info from AO
 */
export const tokens = {
  AR: {
    ticker: 'AR',
    label: 'AR', // Wrapped AR in AO
    processID: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    denomination: 12
  },
  USDA: {
    ticker: 'USDA-TST',
    label: 'USDA', // Astro USD (Test)
    processID: 'GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU',
    denomination: 12
  },
  AO: {
    ticker: 'AO',
    label: 'AO',
    processID: 'm3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w',
    denomination: 12
  },
  FIZI: {
    ticker: 'PNTS',
    label: 'FIZI',
    processID: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
    denomination: 12
  },
  LINUX: {
    ticker: 'PNTS',
    label: 'LINUX',
    processID: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
    denomination: 12
  },
  Arena: {
    ticker: 'PNTS',
    label: 'Arena',
    processID: '-_8-spu6PyX-yYaPwf_1owaWc7Rakhbe8TaJ0Yschig',
    denomination: 12
  },
  BRKTST: {
    ticker: 'BRKTST',
    label: 'BRKTST', // Bark
    processID: '8p7ApPZxC_37M06QHVejCQrKsHbcJEerd3jWNkDUWPQ',
    denomination: 3
  },
  TRUNK: {
    ticker: 'TRUNK',
    label: 'TRUNK',
    processID: 'OT9qTE2467gcozb2g8R6D6N3nQS94ENcaAIJfUzHCww',
    denomination: 3
  },
  EXP: {
    ticker: 'EXP',
    label: 'EXP', // AR.IO EXP
    processID: 'aYrCboXVSl1AXL9gPFe3tfRxRf0ZmkOXH65mKT0HHZw',
    denomination: 6
  },
  '0rbit': {
    ticker: '0RBT',
    label: '0rbit', // 0rbit Points
    processID: 'BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc',
    denomination: 12
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

export type TokenName = keyof typeof tokens;

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

export type CommunityToken = {
  tokenName: TokenName;
  showTokenName: boolean;
};

export type TokenSupply = {
  name: TokenName;
  supply: string;
};

export const timeZoneOptions = [
  { label: 'GMT-11:00', value: 'GMT-11:00' },
  { label: 'GMT-10:00', value: 'GMT-10:00' },
  { label: 'GMT-9:00', value: 'GMT-9:00' },
  { label: 'GMT-8:00', value: 'GMT-8:00' },
  { label: 'GMT-7:00', value: 'GMT-7:00' },
  { label: 'GMT-6:00', value: 'GMT-6:00' },
  { label: 'GMT-5:00', value: 'GMT-5:00' },
  { label: 'GMT-4:00', value: 'GMT-4:00' },
  { label: 'GMT-3:00', value: 'GMT-3:00' },
  { label: 'GMT-2:00', value: 'GMT-2:00' },
  { label: 'GMT-1:00', value: 'GMT-1:00' },
  { label: 'GMT+0:00', value: 'GMT+0:00' },
  { label: 'GMT+1:00', value: 'GMT+1:00' },
  { label: 'GMT+2:00', value: 'GMT+2:00' },
  { label: 'GMT+3:00', value: 'GMT+3:00' },
  { label: 'GMT+4:00', value: 'GMT+4:00' },
  { label: 'GMT+5:00', value: 'GMT+5:00' },
  { label: 'GMT+6:00', value: 'GMT+6:00' },
  { label: 'GMT+7:00', value: 'GMT+7:00' },
  { label: 'GMT+8:00', value: 'GMT+8:00' },
  { label: 'GMT+9:00', value: 'GMT+9:00' },
  { label: 'GMT+10:00', value: 'GMT+10:00' },
  { label: 'GMT+11:00', value: 'GMT+11:00' },
  { label: 'GMT+12:00', value: 'GMT+12:00' },
  { label: 'GMT+13:00', value: 'GMT+13:00' },
  { label: 'GMT+14:00', value: 'GMT+14:00' },
]
