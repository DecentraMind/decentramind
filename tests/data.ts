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
    resource_id: '1234',
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockSpaceInfoWithTwitterApiError: TwitterSpacesInfo = {
  ...mockSpaceInfo,
  errors: [{
    resource_id: '1234',
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
    text: 'https://decentramind.club/i/abcdefg testCommunity text text long long long long long long long long long long long long long long long long enough',
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
    resource_id: '1234',
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

export const mockBaseTweetInfoWithTwitterApiError: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  errors: [{
    resource_id: '1234',
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

export const mockBaseTweetInfoNoInviteLinkNoCommunityName: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    text: mockBaseTweetInfo.data[0].text.replace('decentramind.club/i/', '').replace('testCommunity', '')
  }]
}

export const mockBaseTweetInfoWithInviteLinkInEntities: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    entities: {
      urls: [{
        unwound_url: 'https://decentramind.club/i/ix6pkPV6',
        start: 0,
        end: 10,
        url: 'https://t.co/bre7olKIvN',
        expanded_url: 'https://decentramind.club/i/ix6pkPV6',
        display_url: 'decentramind.club/i/ix6pkPV6'
      }]
    }
  }]
}

export const mockBaseNoteTweetInfoWithInviteLinkInEntities: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    note_tweet: {
      text: '[摘要]：本文提出了一种完全通过点对点技术实现的电子现金系统，它使得在线支付能够直接由一方发起并支付给另外一方，中间不需要通过任何的金融机构。\n\n1⃣简介\n\n互联网上的贸易，几乎都需要借助金融机构作为可资信赖的第三方来处理电子支付信息。虽然这类系统在绝大多数情况下都运作良好，但是这类系统仍然内生性地受制于“基于信用的模式”的弱点。',
      entities: {
        urls: [{
          start: 0,
          end: 10,
          url: 'https://t.co/bre7olKIvN',
          expanded_url: 'https://decentramind.club/i/ix6pkPV6',
          display_url: 'decentramind.club/i/ix6pkPV6'
        }]
      }
    }
  }]
}

// export const mockBaseTweetInfoWithoutCommunityName: ValidatedTweetInfo = {
//   ...mockBaseTweetInfo,
//   data: [{
//     ...mockBaseTweetInfo.data[0],
//     text: mockBaseTweetInfo.data[0].text.replace('testCommunity', 'otherCommunity')
//   }]
// }

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
      text: 'https://decentramind.club/i/abcdefg [摘要]：本文提出了一种完全通过点对点技术实现的电子现金系统，它使得在线支付能够直接由一方发起并支付给另外一方，中间不需要通过任何的金融机构。\n\n1⃣简介\n\n互联网上的贸易，几乎都需要借助金融机构作为可资信赖的第三方来处理电子支付信息。虽然这类系统在绝大多数情况下都运作良好，但是这类系统仍然内生性地受制于“基于信用的模式”的弱点。this is a testCommunity article.'
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
    note_tweet: { text: 'short testCommunity' }
  }]
}

export const mockArticleTweetInfoNoInviteLinkNoCommunityName: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    note_tweet: { text: mockArticleTweetInfo.data[0].note_tweet!.text.replace('https://decentramind.club/i/', '').replace('testCommunity', '') }
  }]
}

export const mockArticleTweetInfoWithInviteLinkInEntities: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    entities: {
      urls: [{
        unwound_url: 'https://decentramind.club/i/ix6pkPV6',
        start: 0,
        end: 10,
        url: 'https://t.co/bre7olKIvN',
        expanded_url: 'https://decentramind.club/i/ix6pkPV6',
        display_url: 'decentramind.club/i/ix6pkPV6'
      }]
    }
  }]
}

export const mockArticleNoteTweetInfoWithInviteLinkInEntities: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    note_tweet: {
      text: mockArticleTweetInfo.data[0].note_tweet!.text,
      entities: {
        urls: [{
          unwound_url: 'https://decentramind.club/i/ix6pkPV6',
          start: 0,
          end: 10,
          url: 'https://t.co/bre7olKIvN',
          expanded_url: 'https://decentramind.club/i/ix6pkPV6',
          display_url: 'decentramind.club/i/ix6pkPV6'
        }]
      }
    }
  }]
}

export const mockArticleTweetInfoWithoutCommunityName: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    note_tweet: { text: mockArticleTweetInfo.data[0].note_tweet!.text.replace('testCommunity', '') }
  }]
}

export const mockSingleSpacesSuccessResponse1: TwitterSpacesInfo = {
  data: [
    {
      participant_count: 3363,
      creator_id: '1557376757342564352',
      host_ids: [
        '1557376757342564352',
        '928827107974701056',
        '202457967'
      ],
      id: '1YqGovqmZvMKv',
      started_at: '2024-08-07T11:06:17.000Z',
      ended_at: '2024-08-07T13:31:54.000Z',
      state: 'ended'
    }
  ],
  errors: [],
  includes: {
    users: [
      {
        created_at: '2022-08-10T14:42:27.000Z',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1714969617259692032/pfuj9r_X_normal.jpg',
        username: 'cxo_no',
        name: 'CXO.Adam👁💎',
        id: '1557376757342564352'
      },
      {
        created_at: '2017-11-10T03:30:14.000Z',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1681285909583650816/BcT_-5jd_normal.jpg',
        username: 'garymetaz',
        name: 'GARY',
        id: '928827107974701056'
      },
      {
        created_at: '2010-10-14T02:32:01.000Z',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1816771232844709888/Qm7XOEZO_normal.jpg',
        username: 'CKN_ACEE',
        name: 'ACE',
        id: '202457967'
      }
    ]
  }
}

export const mockSingleSpacesSuccessResponse2: TwitterSpacesInfo = {
  data: [
    {
      state: 'ended',
      ended_at: '2024-03-27T14:04:54.000Z',
      host_ids: [
        '1772108008212029440'
      ],
      id: '1kvJpvQNwODKE',
      creator_id: '1772108008212029440',
      participant_count: 92,
      started_at: '2024-03-27T12:50:54.000Z'
    }
  ],
  errors: [],
  includes: {
    users: [
      {
        created_at: '2024-03-25T03:47:39.000Z',
        username: 'decentramindcn',
        id: '1772108008212029440',
        name: 'DecentraMind中文社区',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1793641844511010816/ujO5zVLk_normal.jpg'
      }
    ]
  }
}

export const mockMultipleSpacesSuccessResponse: TwitterSpacesInfo = {
  data: [
    ...mockSingleSpacesSuccessResponse1.data!,
    ...mockSingleSpacesSuccessResponse2.data!
  ],
  errors: [],
  includes: {
    users: [
      ...mockSingleSpacesSuccessResponse1.includes!.users!,
      ...mockSingleSpacesSuccessResponse2.includes!.users!
    ]
  }
}

export const mockTweetsResponse1: TwitterTweetInfo = {
  data: [{
    id: '1',
    text: 'Test tweet',
    author_id: '32423987987',
    created_at: '2024-01-01T00:00:00Z',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 0,
      quote_count: 0,
      bookmark_count: 0,
      impression_count: 0
    }
  }],
  errors: [],
  includes: {
    users: [{
      id: '32423987987',
      name: 'author1_name',
      username: 'author1_handle',
      created_at: '2020-01-01T00:00:00Z',
      profile_image_url: 'https://example.com/image.jpg'
    }]
  }
}

export const mockTweetsResponse2: TwitterTweetInfo = {
  data: [
    {
      id: '1848308061611683852',
      public_metrics: {
        retweet_count: 0,
        reply_count: 0,
        like_count: 3,
        quote_count: 2,
        bookmark_count: 0,
        impression_count: 634
      },
      author_id: '1759580709143171072',
      created_at: '2024-10-21T10:19:16.000Z',
      text: '🎊We launched its video tutorial series!'
    }
  ],
  errors: [],
  includes: {
    users: [
      {
        name: 'DecentraMind',
        created_at: '2024-02-19T14:08:57.000Z',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1806545056436043776/XgEzPPcz_normal.jpg',
        id: '1759580709143171072',
        username: 'decentramindio'
      }
    ]
  }
}

export const mockMultipleTweetsResponse: TwitterTweetInfo = {
  data: [...mockTweetsResponse1.data!, ...mockTweetsResponse2.data!],
  errors: [],
  includes: {
    users: [...mockTweetsResponse1.includes!.users!, ...mockTweetsResponse2.includes!.users!]
  }
}
