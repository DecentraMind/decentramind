import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: Avatar;
  status: UserStatus;
  location: string;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: User;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  name: string;
  username: string;
  role: 'member' | 'owner';
  avatar: Avatar;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
}

export interface Wallettoken {
  id: number;
  token: string;
  chain: string;
  balance: string;
  balance_u: string;
  avatar?: Avatar;
  status: UserStatus;
  location: string;
}

export interface Tasks {
  id: number;
  name: string;
  from: string;
  balance: string;
  status: UserStatus;
  location: string;
}

export type Period = 'daily' | 'weekly' | 'monthly';

export interface Range {
  start: Date;
  end: Date;
}

export type Community = {
  /** total supply of community token */
  alltoken: string
  banner: `banner${6 | 7 | 8 | 9 | 10}`
  bounty: TokenName[]
  /** how many user joined in this community */
  buildnum: string
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
  timestamp: string
  tokensupply: TokenSupply[]
  twitter: string
  uuid: string
  website: string
}

export type CommunityListItem = Community & {
  whitebook: string
  isJoined?: boolean
  joinTime?: string
}

export type CommunityList = CommunityListItem[]

/**
 * type of community setting form
 * */
export type CommunitySetting = {
  owner: string | undefined;
  creator: string | undefined;
  logoBase64Data: string | undefined;
  banner: string;
  input: string | undefined;
  inputMenu: string | undefined;
  name: string | undefined;
  /** TODO rename this to desc */
  inbro: string | undefined;
  website: string | undefined;
  twitter: string | undefined;
  github: string | undefined;
  builderNum: string | undefined;
  allReward: string | undefined;
  /** TODO rename this to bountyTokenNames */
  typeReward: TokenName[];
  /** 是否有发行 token */
  isPublished: boolean;
  tokenName: string | undefined;
  showTokenName: boolean;
  isTradable: boolean | undefined;
  tradePlatform: TradePlatform[];
  /** 分配的 token 总量  */
  allToken: string | undefined;
  communityToken: string | undefined;
  communityChatID: string | undefined;
  /** string of timestamp */
  time: string | undefined;
}

export type CreateToken = {
  ticker: string;
  name: string;
  balance: number;
}

export type Tokens = {
  [key: string]: {
    ticker: string;
    label: string;
    processID: string;
  }
}

export type TradePlatform = 'ArSwap' | 'Permaswap' | 'Binance' | 'Coinbase'

export type Task = {
  buildNumber: number;
  communityId: string;
  endTime: string;
  isBegin: 'Y' | 'N';
  isCal: 'Y' | 'N';
  isSettle: 'Y' | 'N';
  joined: number;
  ownerId: string;
  processId: string;
  rewardTotal: string;
  startTime: string;
  taskId: string;
  taskInfo: string;
  taskLogo: string;
  taskName: string;
  taskRule: string;
  tokenChain: string;
  tokenChain1: string;
  tokenNumber: number;
  tokenNumber1: number;
  tokenType: string;
  tokenType1: string;
  zone: string;
  createTime: number;
}

export type InviteInfo = {
  /** inviter address */
  userId: string
  communityId: string
  /** invitee address */
  invited: string
  inviteTime: string
  /** invitee's user info */
  userInfo?: {
    avatar: string
    name: string
  }[]
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
 * user info from aoCommunity Process getInfo
 */
export type UserInfo = {
  avatar : string
  name : string
}
