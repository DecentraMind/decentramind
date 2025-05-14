import type { ChainNames, PrivateTaskStatus, SubmissionValidateStatus, TradePlatform } from '~/types'
import type { ButtonColor } from '#ui/types'

export const tradePlatforms: TradePlatform[] = [
  'ArSwap',
  'Permaswap',
  'Binance',
  'Coinbase',
  'Botega'
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
    ticker: 'wAR',
    label: 'Wrapped AR', // Wrapped AR in AO
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
  USDC: {
    ticker: 'USDC',
    label: 'USDC(Ethereum-Wrapped)',
    processID: '7zH9dlMNoxprab9loshv3Y7WG45DOny_Vrq9KrXObdQ',
    denomination: 6,
    logo: 'HZlLK9uWlNbhDbxXXe8aPaXZPqq9PKzpdH93ol-BKis'
  },
  AO: {
    ticker: 'AO',
    label: 'AO',
    processID: '0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc',
    denomination: 12,
    logo: 'UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE'
  },
  DMT1: {
    ticker: 'DMT1',
    label: 'Decentramind Test1',
    processID: '1jdhi6SJkaY_Sb5u3btnNU8VVMb6XHMlkt4OZ4etvBM',
    denomination: 12,
    logo: 'FcaExQs5fN4KAeYhxgnfHK4Fp9U6Rh62xsBHhxg2AnU'
  },
  'SYNBO_EARLY_BIRD': {
    ticker: 'SYNBO_EARLY_BIRD',
    label: 'SYNBO_EARLY_BIRD',
    processID: 'Glr6TWiPaMOtErIKHYrsmhurWCXWjqEK6Id9nuolQHg',
    denomination: 12,
    logo: 'NU4cSWOa-E3h_ZwmlpIB8a9C4oMO8w79v8hJSR6nXEY'
  },
  'MASADEGEN’S-EARLY-BONUS': {
    ticker: 'MASADEGEN’S-EARLY-BONUS',
    label: 'MASADEGEN’S-EARLY-BONUS',
    processID: '7ko4tjeJv5fhgKJiou0hdbkilLiwlD68PrOXjRJ_yj8',
    denomination: 12,
    logo: 'RKV61-4mVmvp0ZiYA1wf5b9BpUfOWuDO6_oAZm4yp9U'
  },
  HIBIT: {
    ticker: 'HIBIT',
    label: 'hibit',
    processID: 'Ay3KRVx6N73EHiwOjk7Jwbdt8uLyO5C4xEQQzzRmcN0',
    denomination: 12,
    logo: 'yNgG1No6Bp1hVdw4heUPdy84AuLaNwrhk07t-ETeu3A'
  },
  NAB: {
    ticker: 'NAB',
    label: 'Number Always Bigger',
    processID: 'OsK9Vgjxo0ypX_HLz2iJJuh4hp3I80yA9KArsJjIloU',
    denomination: 8,
    logo: 'LQ4crOHN9qO6JsLNs253AaTch6MgAMbM8PKqBxs4hgI'
  },
  MINT: {
    ticker: 'MINT',
    label: 'MINT',
    processID: 'SWQx44W-1iMwGFBSHlC3lStCq3Z7O2WZrx9quLeZOu0',
    denomination: 8,
    logo: 'P9EWU8qgkvM95Y-HTp8U36i9_2ZzKx3kWtJduCEIKgk'
  },
  SEND: {
    ticker: 'SEND',
    label: 'Send',
    processID: 'O2mmX6O7ZNUnRfE8pYtzTT2uH55dXrvIR8YeaOEsp9I',
    denomination: 18,
    logo: 'TSi43BNSWrFtEaa4uasu3Owmp4bQnGFXk9Wm_8bu0D4'
  },
  NOKIT: {
    ticker: 'NOKIT',
    label: 'Nobility Kitty',
    processID: 'ulnt9PbkX6m8NSp53osR5eCpHQkZq27JYO0OkzM7n0c',
    denomination: 18,
    logo: 'imj-OW6zv264ZEgjWodi5Dg7iR38N0wuSmxrlUZyUV4'
  },
  LLAMA : {
    ticker: 'LLAMA',
    label: 'Llama Coin',
    processID: 'pazXumQI-HPH7iFGfTC-4_7biSnqz_U67oFAGry5zUY',
    denomination: 12,
    logo: '9FSEgmUsrug7kTdZJABDekwTGJy7YG7KaN5khcbwcX4'
  },
  EDA: {
    ticker: 'EDA',
    label: 'Event-DA',
    processID: 'b7PP-BVcAodp8EjFjEyRCtR40W_lgq_tiVAozCWrb_4',
    denomination: 12,
    logo: 'rZbcNfx8UumPfzZJxXHlwXt7f_kxbO1_dcFbL_i0obg'
  },
  tIO: {
    ticker: 'tIO',
    label: 'tIO',
    processID: 'agYcCFJtrMG6cqMuZfskIkFTGvUPddICmtQSBIoPdiA',
    denomination: 6,
    logo: 'qUjrTmHdVjXX4D6rU6Fik02bUOzWkOR6oOqUg39g4-s'
  },
  APUS_Tn1: {
    ticker: 'APUS_Tn1',
    label: 'APUS_Tn1',
    processID: 'al1xXXnWnfJD8qyZJvttVGq60z1VPGn4M5y6uCcMBUM',
    denomination: 12,
    logo: 'YC9BWMO7OOdOgIkxSznrP81-ApHzNtI0zj2TDxFqDLE'
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
    label: '0RBT', // 0rbit Points
    processID: 'BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc',
    denomination: 12,
    logo: 'quMiswyIjELM0FZtjVSiUtg9_-pvQ8K25yfxrp1TgnQ'
  }
} as const

if (import.meta.env.VITE_PUBLIC_TEST_TOKEN) {
  tokens['FIZI'] = {
    ticker: 'PNTS',
    label: 'FIZI',
    processID: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
    denomination: 12,
    logo: 'SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY'
  }
  tokens['testDM'] = {
    ticker: 'DM',
    label: 'DM',
    processID: 'RhWfpwx7o7_aMAiZzUVvHGcIFPYDW8B4SqqOc56sqPQ',
    denomination: 12,
    logo: 'rZbcNfx8UumPfzZJxXHlwXt7f_kxbO1_dcFbL_i0obg'
  }
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
// eslint-disable-next-line no-unused-vars
}, {} as { [key in TokenName]: string })

export const tokenProcesses = Object.values(tokenProcessIDs)

export const tokensByProcessID = tokenNames.reduce((carry, name) => {
  carry[tokens[name].processID] = tokens[name]
  return carry
}, {} as { [key: string]: Token })

export const denominations = tokenNames.reduce((carry, name) => {
  carry[name] = Math.pow(10, tokens[name].denomination)
  return carry
// eslint-disable-next-line no-unused-vars
}, {} as { [key in TokenName]: number })

export type CommunityToken = {
  tokenName: TokenName;
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
export const DM_BOUNTY_CHARGE_PERCENT:number = 5

export const allowedImageType = ['image/jpeg', 'image/png', 'image/webp']

export const uploadPath = {
  communityLogo: '/c',
  communityBanner: '/c',
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

export const SPACE_URL_REGEXP = /^(?:https?:\/\/)?(?:x|twitter)\.com\/i\/spaces\/([a-zA-Z0-9]{13})\/?(?:peek\/?)?$/
export const TWEET_URL_REGEXP = /^(?:https?:\/\/)?(?:twitter|x)\.com\/.+\/status\/(\d+)/

export const maxCommunityLogoDimension = {
  width: 400,
  height: 400
}

export const maxCommunityBannerDimension = {
  width: 1280,
  height: 720
}

export const minArticleTextLength = 100
export const minBirdTweetTextLength = 20
export const minSpaceLiveLength = 15
export const minSSIM = 0.5

export const maxFetchSpaceIds = 100
export const maxFetchTweetIds = 100

export const VOUCH_SITE_URL = 'https://vouch.zeabur.app'

export const VALID_SUBMISSION_STATUS = ['validated', 'revalidated'] as SubmissionValidateStatus[]

export const privateTaskStatusColorMap: Record<PrivateTaskStatus, ButtonColor> = {
  draft: 'gray',
  auditing: 'yellow',
  executing: 'green',
  waiting_for_validation: 'sky',
  waiting_for_settlement: 'orange',
  settled: 'pink'
}