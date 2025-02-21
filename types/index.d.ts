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
  banner: string
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
  privateUnlockTime?: number
  inviteCode?: string

  admins: string[]
  /** Whether community members can apply to join the private area */
  isPrivateApplicable: boolean
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

export type TradePlatform = 'ArSwap' | 'Permaswap' | 'Binance' | 'Coinbase' | 'Botega'

export type ChainNames = 'AO'
export type SubmissionValidateStatus = 'waiting_for_validation' | 'validated' | 'invalid' | 'validation_error' | 'revalidated'
export type Submission = {
  id: number
  taskPid: string
  /** submitter's address */
  address: string
  score: number
  createTime: number
  updateTime: number
  validateStatus?: SubmissionValidateStatus
  validateError?: string
  validateTime?: number
  validator?: string
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
interface TweetSubmission extends Submission {
  url: string
  buzz: number // tweet text length
  discuss: number // public_metrics.reply_count
  identify: number // public_metrics.retweet_count
  popularity: number // public_metrics.like_count
  spread: number // public_metrics.impression_count (times this post was seen)
  friends: number // invite count
}
interface PromotionSubmission extends TweetSubmission {}
interface BirdSubmission extends TweetSubmission {}
interface ArticleSubmission extends TweetSubmission {}

export type AllSubmission = SpaceSubmission | PromotionSubmission | BirdSubmission | ArticleSubmission
export type AllSubmissions = SpaceSubmission[] | PromotionSubmission[] | BirdSubmission[] | ArticleSubmission[]

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

  type: 'space' | 'promotion' | 'bird' | 'article' | 'invite'
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

  submissions: AllSubmissions

  inviteCode?: string
}

export type TaskWithLink = Task & {
  /** tweet url */
  link: string
}

type ExtraCalculatedFields = {
  calculatedBounties: Task['bounties']
}
export type SpaceSubmissionWithCalculatedBounties = SpaceSubmission & ExtraCalculatedFields

export type TweetSubmissionWithCalculatedBounties = TweetSubmission & ExtraCalculatedFields

export type AllSubmissionWithCalculatedBounties = AllSubmission & ExtraCalculatedFields

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
  communityUuid: string
  communityName: string
  taskName: string
}

export type TaskForm = Omit<Task, 'createTime'|'ownerAddress'|'submittersCount'|'isScoreCalculated'|'isSettled'|'builders'|'submissions'|'bounties'> & {
  bounties: TaskFormBounty[]
}

export type TaskFormWithLink = TaskForm & {
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
export type CommunityMember = UserInfoWithAddress & {
  joinTime: number
  inviteCode?: string
  inviterAddress?: string
  inviterName?: string
  /** timestamp when the private area application is approved, if it is not undefined, the invitee can access the private area */
  privateUnlockTime?: number
}

export type UploadResponse = {
  url?: string
  ARHash?: string
  success: boolean
  message: string
}

export type TwitterError = {
  detail: string
  title: string
  type: string
  resource_id: string
}

export type TwitterSpaceInfo = {
  data?: {
    id: string
    state: 'scheduled' | 'live' | 'ended'
    started_at: string
    ended_at?: string
    creator_id: string
    participant_count: number
    host_ids: string[]
  }
  includes?: {
    users: Array<{
      created_at: string
      id: string
      name: string
      profile_image_url: string
      /** twitter handle */
      username: string
    }>
  }
  errors?: TwitterError[]
}
export type ValidatedSpaceInfo = {
  data: NonNullable<TwitterSpaceInfo['data']>,
  includes: NonNullable<TwitterSpaceInfo['includes']>
}
export type TwitterSpacesInfo = {
  data?: {
    id: string
    state: 'scheduled' | 'live' | 'ended'
    started_at: string
    ended_at?: string
    creator_id: string
    participant_count: number
    host_ids: string[]
  }[]
  includes?: {
    users: Array<{
      created_at: string
      id: string
      name: string
      profile_image_url: string
      /** twitter handle */
      username: string
    }>
  }
  errors?: TwitterError[]
}
export type ValidatedSpacesInfo = {
  data: NonNullable<TwitterSpacesInfo['data']>,
  includes: NonNullable<TwitterSpacesInfo['includes']>
}

type TwitterEntities = {
  urls?: {
    start: number
    end: number
    // the transformed t.co url like "https://t.co/bre7olKIvN"
    url: string
    // real full url like "https://decentramind.club/i/ix6pkPV6"
    expanded_url: string
    // display url like "decentramind.club/i/ix6pkPV6"
    display_url: string
    // unwound url like "https://decentramind.club/i/ix6pkPV6"
    unwound_url?: string
    /** media key for image */
    media_key?: string
  }[]
}

export type TwitterTweetInfo = {
  data?: {
    author_id: string
    created_at: string
    id: string
    entities?: TwitterEntities
    /** infomation for Tweets longer than 280 characters */
    note_tweet?: {
      text: string
      entities?: TwitterEntities
    }
    /** infomation for article */
    article?: {
      title: string
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
    /** tweet text. If it's an article, it's the url of the article page */
    text: string
  }[]
  includes?: {
    users: {
      created_at: string
      id: string
      name: string
      profile_image_url: string
      /** twitter handle */
      username: string
    }[]
  }
  errors?: TwitterError[]
}

// TODO rename to ValidatedTweetsInfo
export type ValidatedTweetInfo = {
  data: NonNullable<TwitterTweetInfo['data']>,
  includes: NonNullable<TwitterTweetInfo['includes']>
}

/**
 * eg:
 * {"X-Value":"0-USD","Vouches-For":"xb...3B4","Vouchers":{"Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8":{"Country":"","Identifier":"vico","Value":"0-USD"}},"Sub-IDs":[],"Total-Value":"0-USD","Values":["0-USD"]}
 * */
type VouchData = {
  'X-Value': string
  'Vouches-For': string
  Vouchers: {
    [voucherAddress: string]: {
      Identifier: string
      ['Vouch-For']: string
      Value: string
      Country: string
      Method: string
    }
  }
  'Sub-IDs': string[]
  'Total-Value': string
  Values: string[]
}

export interface TaskValidationParams<T extends ValidatedSpacesInfo | ValidatedTweetInfo> {
  task: Task
  data?: T
  mode: 'add' | 'update'
  twitterVouchedIDs?: string[]
  communityName: string
}

export type SubmissionUpdateResponse = {
  result: 'success' | 'error'
  message: string
}

export type PrivateApplication = {
  address: string
  name: string
  avatar: string
  answers: string[]
}

export type Log = {
  operation: string
  communityUuid: string
  operator: string
  operatorName?: string
  operatorAvatar?: string
  params: Record<string, any>
  timestamp: number
}
