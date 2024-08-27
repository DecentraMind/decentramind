import type { Avatar } from '#ui/types'

export type AoTag = {
  name: string
  value: string
}

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

type MailCache = {
  id: number
  isPending: boolean
  Timestamp: number
  From: string
  Data: string
  index?: number
}
type InboxState = {
  name: string
  latestMsgTime: number
  createdAt: number
  inboxCount?: number
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
  /** AR tx ID */
  logo: string
  name: string
  /** description */
  desc: string
  banner: `banner${6 | 7 | 8 | 9 | 10}`
  website?: string
  github?: string
  twitter?: string

  bounty: TokenName[]
  communitytoken: CommunityToken[]
  ispublished: boolean

  istradable: boolean
  /** trade platforms */
  support: TradePlatform[]

  /** total supply of community token */
  alltoken?: number
  tokensupply: TokenSupply[]

  /** how many user joined in this community */
  buildnum: number
  // TODO replace chatroom ID with chatroom process ID
  /** ID of community's chatroom */
  communitychatid: string
  creator: string
  /** owner's address */
  owner: string
  /** created time */
  timestamp: number
  uuid: string

  isJoined: boolean
  joinTime?: number
}

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
  allTokenSupply?: number
  /** community token allocations */
  tokenAllocations: TokenSupply[]
}

export type CreateToken = {
  logo: string
  ticker: string
  name: string
  totalSupply: string
}

export type Tokens = {
  [key: string]: {
    ticker: string
    label: string
    processID: string
  }
}

export type TradePlatform = 'ArSwap' | 'Permaswap' | 'Binance' | 'Coinbase'

type ChainNames = 'AO'

type Submission = {
  id: number
  taskPid: string
  /** submitter's address */
  address: string
  score: number
  createTime: number
}

interface SpaceSubmission extends Submission {
  brandEffect: number
  inviteCount: number
  audience: number
  url: string
}

export type TaskFormBounty = {
  /** Human readable number of bounty amount. amount = quantity / Math.pow(10, token.denomination) */
  amount: number
  tokenName: string
  tokenProcessID: string
  chain: ChainName
}

export type Task = {
  /** process ID as unique primary key */
  processID: string

  type: 'space'
  visible: 'public' | 'private'
  communityUuid: string
  name: string
  intro: string
  rule: string
  banner: string
  totalChances: number
  timezone: Timezone
  startTime: number
  endTime: number

  createTime: number
  ownerAddress: string
  submittersCount: number

  isScoreCalculated: boolean
  isSettled: boolean

  bounties: Array<TaskFormBounty & {
    /**
     * BitInt string of bounty quantity. Human readable amount = quantity / Math.pow(10, token.denomination)
     * */
    quantity: bigint
  }>

  builders: Record<[address: string], {
    address: string,
    inviterAddress?: string
  }>

  submissions: SpaceSubmission[]
}

export type SpaceSubmissionWithCalculatedBounties = SpaceSubmission & {
  calculatedBounties: Task['bounties']
  /**
   * html representation of calculatedBounties 
   * bounty is not included in process reply,
   * this field is calculated at client, only for client display */
  rewardHtml?: string
}

/** bounty item for SendBounty action of task process */
export type Bounty = {
  taskPid: string
  sender: string
  recipient: string
  tokenProcessID: string
  amount: number
  /** BitInt of bounty quantity. Human readable amount = quantity / Math.pow(10, token.denomination) */
  quantity: bigInt
}

export type BountySendHistory = Bounty & {
  tokenName: string
  communityUuid: string
  communityName: string
}

export type TaskForm = Omit<Task, 'createTime'|'ownerAddress'|'submittersCount'|'isScoreCalculated'|'isSettled'|'builders'|'submissions'|'bounties'> & {
  bounties: TaskFormBounty[]
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

/**
 * user info from aoCommunity Process getUses
 */
export type UserInfo = {
  name: string
  avatar: string
}

export type UserInfoWithMuted = UserInfo & { muted: boolean }
export type UserInfoWithAddress = UserInfoWithMuted & { address: string }

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
