import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'

export interface User {
  id: number
  name: string
  email: string
  avatar?: Avatar
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: Avatar
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export interface Wallettoken {
  id: number
  token: string
  chain: string
  balance: string
  balance_u: string
  avatar?: Avatar
  status: UserStatus
  location: string
}

export interface Tasks {
  id: number
  name: string
  from: string
  balance: string
  status: UserStatus
  location: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export type Community = {
  /** total supply of community token */
  alltoken: string
  banner: `banner${6 | 7 | 8 | 9 | 10}`
  bounty: TokenName[]
  /** how many user joined in this community */
  buildnum: number
  /** ID of community's chatroom */
  communitychatid: string
  communitytoken: CommunityToken[]
  /** creator's address TODO rename this to 'creator' */
  creater: string
  /** description */
  desc: string
  github: string
  ispublished: boolean
  istradable: boolean
  /** base64 encoded data URI */
  logo: string
  name: string
  /** owner's address */
  owner: string
  /** trade platforms */
  support: TradePlatform[]
  /** created time */
  timestamp: number
  tokensupply: TokenSupply[]
  twitter: string
  uuid: string
  website: string
  logoARHash?: string
}

export type CommunityListItem = Community & {
  whitebook: string
  isJoined?: boolean
  joinTime?: number
}

export type CommunityList = CommunityListItem[]

/**
 * type of community setting form
 * */
export type CommunitySetting = {
  logo: string
  name: string
  desc: string
  banner: string
  website?: string
  twitter?: string
  github?: string
  bountyTokenNames: TokenName[]
  /** 是否有发行 token */
  isPublished: boolean
  isTradable: boolean
  tradePlatforms: TradePlatform[]
  /** 分配的 community token 总量  */
  allTokenSupply?: string
  /** community token allocations */
  tokenAllocations: TokenSupply[]
}

export type CreateToken = {
  logo: string
  ticker: string
  name: string
  totalSupply: number
}

export type Tokens = {
  [key: string]: {
    ticker: string
    label: string
    processID: string
  }
}

export type TradePlatform = 'ArSwap' | 'Permaswap' | 'Binance' | 'Coinbase'

export type Task = {
  buildNumber: number
  communityId: string
  endTime: string
  isBegin: 'Y' | 'N'
  isCal: 'Y' | 'N'
  isSettle: 'Y' | 'N'
  joined: number
  ownerId: string
  processId: string
  rewardTotal: number
  startTime: string
  taskId: string
  taskInfo: string
  taskLogo: string
  taskName: string
  taskRule: string
  tokenChain: string
  tokenChain1: string
  tokenNumber: number
  tokenNumber1: number
  tokenType: string
  tokenType1: string
  zone: string
  createTime: number
}

export type InviteInfo = {
  time: number
  inviteeAddress: string
  communityID: string
  inviterAddress?: string
}

export type RelatedUserMap = {
  [address: string]: UserInfo
}

export type Bounty = {
  communityId: string
  communityName: string
  receive: string
  send: string
  taskId: string
  taskName: string
  tokenNumber: number
  tokenType: string
}

/**
 * user info from aoCommunity Process getUses
 */
export type UserInfo = {
  name: string
  avatar: string
}

export type UploadResponse = {
  url?: string
  ARHash?: string
  success: boolean
  message: string
}

export type TwitterSpaceInfo = {
  data: {
    id: string
    state: string
    started_at: string
    ended_at: string
    creator_id: string
    participant_count: number
    speaker_ids: string[]
  }
  includes: {
    users: Array<{
      created_at: string
      username: string
      profile_image_url: string
      /** twitter handle */
      name: string
      id: string
    }>
  }
}

/**
 * eg:
 * {"X-Value":"0-USD","Vouches-For":"xb...3B4","Vouchers":{"Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8":{"Country":"","Identifier":"vico","Value":"0-USD"}},"Sub-IDs":[],"Total-Value":"0-USD","Values":["0-USD"]}
 * */
type VouchData = {
  X_Value: string
  Vouches_For: string
  Vouchers: {
    [key: string]: {
      Country: string
      Identifier: string
      Value: string
    }
  }
  Sub_IDs: string[]
  Total_Value: string
  Values: string[]
}
