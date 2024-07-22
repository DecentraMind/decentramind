import type { TradePlatform } from '~/types'

export const tradePlatforms: TradePlatform[] = [
  'ArSwap',
  'Permaswap',
  'Binance',
  'Coinbase',
]

/**
 * Token list with unique keys
 */
export const tokens = {
  AR: {
    ticker: 'AR ',
    label: 'AR',
    processID: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    // denotion: 
  },
  USDA: {
    ticker: 'USDA ',
    label: 'USDA',
    processID: 'GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU',
  },
  AO: {
    ticker: 'AO',
    label: 'AO',
    processID: 'm3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w',
  },
  FIZI: {
    ticker: 'FIZI',
    label: 'FIZI',
    processID: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
  },
  LINUX: {
    ticker: 'LINUX',
    label: 'LINUX',
    processID: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
  },
  Arena: {
    ticker: 'Arena',
    label: 'Arena',
    processID: '-_8-spu6PyX-yYaPwf_1owaWc7Rakhbe8TaJ0Yschig',
  },
  BRKTST: {
    ticker: 'BRKTST',
    label: 'BRKTST',
    processID: '8p7ApPZxC_37M06QHVejCQrKsHbcJEerd3jWNkDUWPQ',
  },
  TRUNK: {
    ticker: 'TRUNK',
    label: 'TRUNK',
    processID: 'OT9qTE2467gcozb2g8R6D6N3nQS94ENcaAIJfUzHCww',
  },
  EXP: {
    ticker: 'EXP',
    label: 'EXP',
    processID: 'aYrCboXVSl1AXL9gPFe3tfRxRf0ZmkOXH65mKT0HHZw',
  },
  '0rbit': {
    ticker: '0rbit',
    label: '0rbit',
    processID: 'BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc',
  },
  EARTH: {
    ticker: 'EARTH',
    label: 'Earth',
    processID: 'PBg5TSJPQp9xgXGfjN27GA28Mg5bQmNEdXH2TXY4t-A',
  },
  FIRE: {
    ticker: 'FIRE',
    label: 'Fire',
    processID: 'KmGmJieqSRJpbW6JJUFQrH3sQPEG9F6DQETlXNt4GpM',
  },
  AIR: {
    ticker: 'AIR',
    label: 'Air',
    processID: '2nfFJb8LIA69gwuLNcFQezSuw4CXPE4--U-j-7cxKOU',
  },
  'FIRE-EARTH': {
    ticker: 'FIRE-EARTH',
    label: 'Lava',
    processID: 'NkXX3uZ4oGkQ3DPAWtjLb2sTA-yxmZKdlOlEHqMfWLQ',
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
