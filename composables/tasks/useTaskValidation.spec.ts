import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTaskValidation } from './useTaskValidation'
import type { Task, TaskWithLink, TwitterSpaceInfo, TwitterTweetInfo, ValidatedSpaceInfo, ValidatedTweetInfo } from '@/types'
import { minSpaceLiveLength, minBirdTweetTextLength, minArticleTextLength } from '@/utils/constants'

const mockJsonResponse = vi.fn()

vi.mock('@vueuse/core', () => ({
  useFetch: () => ({
    json: mockJsonResponse
  }),
  unref: (x: any) => x,
  createSharedComposable: vi.fn()
}))

const baseTask: Task = {
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

const mockSpaceTask: Task = {
  ...baseTask,
  type: 'space'
}

const mockSpaceInfo: ValidatedSpaceInfo = {
  data: {
    id: '1234',
    state: 'ended',
    started_at: '2024-01-01T10:00:00Z',
    ended_at: '2024-01-01T10:30:00Z',
    creator_id: '123456',
    participant_count: 10,
    host_ids: ['123456']
  },
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

const mockImcompleteSpaceInfo: TwitterSpaceInfo = {
  data: mockSpaceInfo.data,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

const mockSpaceInfoWithTwitterApiError: TwitterSpaceInfo = {
  ...mockSpaceInfo,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

const mockSpaceInfoNotEnded: ValidatedSpaceInfo = {
  ...mockSpaceInfo,
  data: {
    ...mockSpaceInfo.data,
    state: 'live'
  }
}

const mockSpaceInfoLastsLessThanMinSpaceLiveLength: ValidatedSpaceInfo = {
  ...mockSpaceInfo,
  data: {
    ...mockSpaceInfo.data,
    started_at: '2024-01-01T10:00:00Z',
    ended_at: '2024-01-01T10:05:00Z'
  }
}

const mockBaseTweetTask: TaskWithLink = {
  ...baseTask,
  type: 'bird',
  link: 'https://twitter.com/user_handle/status/9876'
}
const mockBaseTweetInfo: ValidatedTweetInfo = {
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

const mockImcompleteTweetInfo: TwitterTweetInfo = {
  data: mockBaseTweetInfo.data,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

const mockBaseTweetInfoWithTwitterApiError: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  errors: [{
    detail: 'Could not find user with creator_id: [1234].',
    title: 'Not Found Error',
    type: 'https://api.twitter.com/2/problems/resource-not-found'
  }]
}

const mockBaseTweetInfoCreatedBeforeTaskStartTime: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data![0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

const mockBaseTweetInfoWithShortText: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    text: 'short'
  }]
}

const mockPromotionTask: TaskWithLink = {
  ...baseTask,
  type: 'promotion',
  link: 'https://twitter.com/user_handle/status/9876'
}
const mockPromotionTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    referenced_tweets: [{
      type: 'quoted',
      id: '9876'
    }]
  }]
}
const mockPromotionWrongReferencedTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    referenced_tweets: [{
      type: 'quoted',
      id: '404'
    }]
  }]
}

const mockArticleTask: TaskWithLink = {
  ...baseTask,
  type: 'article',
  link: 'https://x.com/testuser/status/1852369896291946531'
}
const mockArticleTweetInfo: ValidatedTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data![0],
    article: {
      title: 'test title'
    },
    text: 'https://t.co/yweEIZcMrA',
    note_tweet: {
      text: '[摘要]：本文提出了一种完全通过点对点技术实现的电子现金系统，它使得在线支付能够直接由一方发起并支付给另外一方，中间不需要通过任何的金融机构。\n\n1⃣简介\n\n互联网上的贸易，几乎都需要借助金融机构作为可资信赖的第三方来处理电子支付信息。虽然这类系统在绝大多数情况下都运作良好，但是这类系统仍然内生性地受制于“基于信用的模式”的弱点。'
    }
  }]
}
const mockArticleTweetInfoCreatedBeforeTaskStartTime: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data![0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

const mockArticleTweetInfoWithShortText: ValidatedTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    note_tweet: { text: 'short' }
  }]
}

describe('useTaskValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateSpaceUrl', () => {

    it('should validate a correct twitter.com space URL', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )

      const result = await validateTaskData()
      expect(result).toEqual(mockSpaceInfo)
    })

    it('should validate a correct x.com space URL', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://x.com/i/spaces/1234',
        'add',
        ['testuser']
      )

      const result = await validateTaskData()
      expect(result).toEqual(mockSpaceInfo)
    })

    it('should reject invalid space URL', async () => {
      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/invalid/url',
        'add',
        ['testuser']
      )

      await expect(validateTaskData()).rejects.toThrow('Invalid space URL')
    })

    it('should reject if fetch error', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: null,
        error: { value: 'error' }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('fetch data failed.')
    })

    it('should reject if the space info is incomplete', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockImcompleteSpaceInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('fetch data failed.')
    })

    it('should reject if twitter api returns error', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfoWithTwitterApiError,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('twitter api error')
    })

    it('should reject space that has not ended', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfoNotEnded,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )

      await expect(validateTaskData()).rejects.toThrow('has not ended')
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null }
      })
      const { validateTaskData: validateTaskData1 } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add'
      )
      await expect(validateTaskData1()).rejects.toThrow('Twitter vouched IDs are not provided.')

      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null }
      })
      const { validateTaskData: validateTaskData2 } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        []
      )
      await expect(validateTaskData2()).rejects.toThrow('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the space creator', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null }
      })
      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['another_user']
      )
      await expect(validateTaskData()).rejects.toThrow('not the primary host of space 1234.')
    })

    it(`should reject if the space lasts less than ${minSpaceLiveLength} minutes`, async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfoLastsLessThanMinSpaceLiveLength,
        error: { value: null }
      })
      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/i/spaces/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow(`lasts less than ${minSpaceLiveLength} minutes`)
    })
  })

  describe('validateTweetUrl(bird task)', () => {
    it('should validate a correct twitter.com tweet URL', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/user/status/1234',
        'add',
        ['testuser']
      )

      const result = await validateTaskData()
      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should validate a correct x.com tweet URL', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://x.com/user/status/1234',
        'add',
        ['testuser']
      )

      const result = await validateTaskData()
      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should reject if fetch error', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: null,
        error: { value: 'error' }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/a/status/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('fetch data failed.')
    })

    it('should reject if the space info is incomplete', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockImcompleteTweetInfo,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/user/status/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('fetch data failed.')
    })

    it('should reject if twitter api returns error', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfoWithTwitterApiError,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/a/status/1234',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('twitter api error')
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null }
      })
      const { validateTaskData: validateTaskData2 } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/user/status/1234',
        'add'
      )
      await expect(validateTaskData2()).rejects.toThrow('Twitter vouched IDs are not provided.')

      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null }
      })
      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/user/status/1234',
        'add',
        []
      )
      await expect(validateTaskData()).rejects.toThrow('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the tweet author', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null }
      })
      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/user/status/1234',
        'add',
        ['another_user']
      )
      await expect(validateTaskData()).rejects.toThrow('not the tweet author.')
    })

    it('should reject invalid tweet URL', async () => {
      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://twitter.com/a/status/invalidUrl',
        'add',
        ['testuser']
      )

      await expect(validateTaskData()).rejects.toThrow('Invalid tweet URL')
    })

    it('should reject if the tweet is created before task start time', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfoCreatedBeforeTaskStartTime,
        error: { value: null }
      })

      const { validateTaskData } = useTaskValidation(
        mockBaseTweetTask,
        'https://x.com/testuser/status/1852369896291946531',
        'add',
        ['testuser']
      )
      await expect(validateTaskData()).rejects.toThrow('created before task start time')
    })

    describe('validateBirdTweetUrl', () => {
      it(`should reject if the tweet text length is less than ${minBirdTweetTextLength}`, async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockBaseTweetInfoWithShortText,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockBaseTweetTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow(`tweet text length is less than ${minBirdTweetTextLength}`)
      })

      it('should reject if the tweet is an article', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockArticleTweetInfo,
          error: { value: null }
        })
        const { validateTaskData } = useTaskValidation(
          mockBaseTweetTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow('article is not supported for bird quest.')
      })
    })

    describe('validateTweetPromotionUrl', () => {
      it('should validate a correct promotion tweet URL', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockPromotionTweetInfo,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockPromotionTask,
          'https://twitter.com/user/status/1234',
          'add',
          ['testuser']
        )

        const result = await validateTaskData()
        expect(result).toEqual(mockPromotionTweetInfo)
      })

      it('should reject if the referenced tweet is not the task promotion tweet', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockPromotionWrongReferencedTweetInfo,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockPromotionTask,
          'https://twitter.com/user/status/1234',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow('referenced tweet is not the task promotion tweet.')
      })
    })

    describe('validateTweetArticleUrl', () => {
      it('should validate a correct article tweet URL', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockArticleTweetInfo,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockArticleTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )

        const result = await validateTaskData()
        expect(result).toEqual(mockArticleTweetInfo)
      })

      it('should reject if the tweet is not an article', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockBaseTweetInfo,
          error: { value: null }
        })
        const { validateTaskData } = useTaskValidation(
          mockArticleTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow('not an article.')
      })

      it('should reject if the tweet is created before task start time', async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockArticleTweetInfoCreatedBeforeTaskStartTime,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockArticleTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow('created before task start time')
      })

      it(`should reject if the article text length is less than ${minArticleTextLength}`, async () => {
        mockJsonResponse.mockResolvedValueOnce({
          data: mockArticleTweetInfoWithShortText,
          error: { value: null }
        })

        const { validateTaskData } = useTaskValidation(
          mockArticleTask,
          'https://x.com/testuser/status/1852369896291946531',
          'add',
          ['testuser']
        )
        await expect(validateTaskData()).rejects.toThrow(`article text length is less than ${minArticleTextLength}`)
      })
    })
  })
})