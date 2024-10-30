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
  
  inviteCode?: string

  admins: string[]
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

export type ChainNames = 'AO'

export type Submission = {
  id: number
  taskPid: string
  /** submitter's address */
  address: string
  score: number
  createTime: number
}

export type Scores = {
  id: number;
  score: number;
}[]

interface SpaceSubmission extends Submission {
  brandEffect: number
  inviteCount: number
  audience: number
  url: string
}
interface PromotionSubmission extends Submission {
  url: string
  buzz: number // tweet text length
  discuss: number // public_metrics.reply_count
  identify: number // public_metrics.retweet_count
  popularity: number // public_metrics.like_count
  spread: number // public_metrics.impression_count (times this post was seen)
  friends: number // invite count
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

  type: 'space' | 'promotion'
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
    inviterAddress?: string,
    joinTime?: number
  }>

  submissions: SpaceSubmission[] | PromotionSubmission[]

  inviteCode?: string
}

export type PromotionTask = Task & {
  type: 'promotion'
  /** the tweet url be be referenced by the promotion tweet */
  link: string
}

export type SpaceSubmissionWithCalculatedBounties = SpaceSubmission & {
  calculatedBounties: Task['bounties']
  /**
   * html representation of calculatedBounties 
   * bounty is not included in process reply,
   * this field is calculated at client, only for client display */
  rewardHtml?: string
}

export type PromotionSubmissionWithCalculatedBounties = PromotionSubmission & {
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
  taskName: string
}

export type TaskForm = Omit<Task, 'createTime'|'ownerAddress'|'submittersCount'|'isScoreCalculated'|'isSettled'|'builders'|'submissions'|'bounties'> & {
  bounties: TaskFormBounty[]
}

export type PromotionTaskForm = TaskForm & {
  type: 'promotion'
  link: string
}

// TODO remove
export type InviteInfo = {
  time: number
  inviteeAddress: string
  communityID: string
  inviterAddress?: string
}

export type InviteCodeInfo = {
  type: 'task'|'community'
  taskPid?: string
  communityUuid: string
  inviterAddress: string
  /** invitee address to join time */
  invitees: Record<string, { joinTime: number }>
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
  createdAt?: number
  canCreateCommunity?: boolean
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
    state: 'scheduled' | 'live' | 'ended'
    started_at: string
    ended_at?: string
    creator_id: string
    participant_count: number
    host_ids: string[]
  }
  includes: {
    users: Array<{
      created_at: string
      id: string
      name: string
      profile_image_url: string
      /** twitter handle */
      username: string
    }>
  }
}

export type TwitterTweetInfo = {
  /**
   * example data:
   * 
{"data":[{"referenced_tweets":[{"type":"quoted","id":"1846888057615929553"}],"created_at":"2024-10-20T13:29:19.000Z","public_metrics":{"retweet_count":26,"reply_count":11,"like_count":81,"quote_count":0,"bookmark_count":8,"impression_count":13241},"edit_history_tweet_ids":["1847993500572225638"],"author_id":"406218355","id":"1847993500572225638","text":"xxx…"includes":{"users":[{"profile_image_url":"https://pbs.twimg.com/profile_images/1713818863698341888/C7FqgbAv_normal.jpg","username":"lilyanna_btc","created_at":"2011-11-06T12:13:05.000Z","id":"406218355","name":"Lilyanna"}]}}
  * */
  data: {
    author_id: string
    created_at: string
    id: string
    /** infomation for Tweets longer than 280 characters */
    note_tweet?: {
      text: string
    }
    public_metrics: {
      retweet_count: number
      reply_count: number
      like_count: number
      quote_count: number
      bookmark_count: number
      impression_count: number
    }
    referenced_tweets?: {
      type: string
      id: string
    }[]
    /** tweet text */
    text: string
  }[]
  includes: {
    users: {
      created_at: string
      id: string
      name: string
      profile_image_url: string
      /** twitter handle */
      username: string
    }[]
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
