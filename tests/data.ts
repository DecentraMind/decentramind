import type { Task, TaskWithLink, TwitterSpacesInfo, TwitterTweetInfo, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'

export const baseTask: Task = {
  type: 'space',
  createTime: 1600000000000,
  startTime: 1610000000000,
  processID: '-agSrQeAfvSJqFAsEO22obrk0ZJpZDRPt-GoLLIBK0o',
  visible: 'public',
  communityUuid: '123456',
  name: 'test',
  endTime: 1600000000000,
  timezone: 'GMT+8:00',
  totalChances: 10,
  intro: 'test',
  rule: 'test',
  banner: 'test',
  bounties: [],
  builders: {},
  submissions: [],
  ownerAddress: 'test',
  submittersCount: 0,
  isScoreCalculated: false,
  isSettled: false
}

export const mockSpaceTask: Task = {
  ...baseTask,
  type: 'space'
}

export const mockSpaceInfo: ValidatedSpacesInfo = {
  data: [{
    id: '1234',
    state: 'ended',
    started_at: '2024-01-01T10:00:00Z',
    ended_at: '2024-01-01T10:30:00Z',
    creator_id: '123456',
    participant_count: 10,
    host_ids: ['123456']
  }],
  includes: {
    users: [{
      id: '123456',
      username: 'testuser',
      created_at: '2024-01-01T10:00:00Z',
      name: 'testuser',
      profile_image_url: 'https://example.com/profile.jpg'
    }]
  }
}

export const mockImcompleteSpaceInfo: TwitterSpacesInfo = {
  data: mockSpaceInfo.data,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockSpaceInfoWithTwitterApiError: TwitterSpacesInfo = {
  ...mockSpaceInfo,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockSpaceInfoNotEnded: ValidatedSpacesInfo = {
  ...mockSpaceInfo,
  data: [{
    ...mockSpaceInfo.data[0],
    state: 'live'
  }]
}

export const mockSpaceInfoLastsLessThanMinSpaceLiveLength: ValidatedSpacesInfo = {
  ...mockSpaceInfo,
  data: [{
    ...mockSpaceInfo.data[0],
    started_at: '2024-01-01T10:00:00Z',
    ended_at: '2024-01-01T10:05:00Z'
  }]
}


export const mockBaseTweetTask: TaskWithLink = {
  ...baseTask,
  type: 'bird',
  link: 'https://twitter.com/user_handle/status/9876'
}
export const mockBaseTweetInfo: ValidatedTweetInfo = {
  data: [{
    id: '1234',
    author_id: '123456',
    created_at: '2024-01-01T10:00:00Z',
    text: 'test text text text long long long long long long long long long long long long long long long enough',
    public_metrics: {
      retweet_count: 10,
      reply_count: 10,
      like_count: 10,
      quote_count: 10,
      bookmark_count: 10,
      impression_count: 10
    }
  }],
  includes: {
    users: [{
      id: '123456',
      username: 'testuser',
      created_at: '2024-01-01T10:00:00Z',
      name: 'testuser',
      profile_image_url: 'https://example.com/profile.jpg'
    }]
  }
}

export const mockImcompleteTweetInfo: TwitterTweetInfo = {
  data: { ...mockBaseTweetInfo.data },
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockBaseTweetInfoWithTwitterApiError: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockBaseTweetInfoCreatedBeforeTaskStartTime: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data![0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

export const mockBaseTweetInfoWithShortText: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    text: 'short'
  }]
}

export const mockPromotionTask: TaskWithLink = {
  ...baseTask,
  type: 'promotion',
  link: 'https://twitter.com/user_handle/status/9876'
}
export const mockPromotionTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    referenced_tweets: [{
      type: 'quoted',
      id: '9876'
    }]
  }]
}
export const mockPromotionWrongReferencedTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    referenced_tweets: [{
      type: 'quoted',
      id: '404'
    }]
  }]
}
export const mockPromotionTweetInfoCreatedBeforeTaskStartTime: ValidatedTweetInfo = {
  ...mockPromotionTweetInfo,
  data: [{
    ...mockPromotionTweetInfo.data[0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

export const mockArticleTask: TaskWithLink = {
  ...baseTask,
  type: 'article',
  link: 'https://x.com/testuser/status/1852369896291946531'
}
export const mockArticleTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data![0],
    note_tweet: {
      text: '[摘要]：本文提出了一种完全通过点对点技术实现的电子现金系统，它使得在线支付能够直接由一方发起并支付给另外一方，中间不需要通过任何的金融机构。\n\n1⃣简介\n\n互联网上的贸易，几乎都需要借助金融机构作为可资信赖的第三方来处理电子支付信息。虽然这类系统在绝大多数情况下都运作良好，但是这类系统仍然内生性地受制于“基于信用的模式”的弱点。'
    }
  }]
}

export const mockArticleTypeTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data![0],
    article: {
      title: 'test title'
    },
    text: 'https://t.co/yweEIZcMrA'
  }]
}

export const mockArticleTweetInfoCreatedBeforeTaskStartTime: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data![0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

export const mockArticleTweetInfoWithShortText: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    note_tweet: { text: 'short' }
  }]
}