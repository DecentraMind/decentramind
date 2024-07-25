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

export type CommunitySetting = {
  owner: string | undefined;
  creator: string | undefined;
  logoBase64Data: string | undefined;
  banner: string;
  input: string | undefined;
  inputMenu: string | undefined;
  name: string | undefined;
  inbro: string | undefined;
  website: string | undefined;
  twitter: string | undefined;
  github: string | undefined;
  builderNum: string | undefined;
  allReward: string | undefined;
  typeReward: string | undefined;
  /** 是否有发行 token */
  isPublished: boolean;
  tokenName: string | undefined;
  showTokenName: boolean;
  isTradable: boolean | undefined;
  tradePlatform: string | undefined;
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
