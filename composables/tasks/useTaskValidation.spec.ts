import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTaskValidation } from './useTaskValidation'
import type { Task, TaskWithLink, TwitterSpaceInfo, TwitterTweetInfo } from '@/types'


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

const mockSpaceInfo: TwitterSpaceInfo = {
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

const createMockSpaceInfoNotEnded = (): TwitterSpaceInfo => ({
  ...mockSpaceInfo,
  data: {
    ...mockSpaceInfo.data,
    state: 'live'
  }
})

const mockBaseTweetTask: TaskWithLink = {
  ...baseTask,
  type: 'bird',
  link: 'https://twitter.com/user_handle/status/9876'
}
const mockBaseTweetInfo: TwitterTweetInfo = {
  data: [{
    id: '1234',
    author_id: '123456',
    created_at: '2024-01-01T10:00:00Z',
    text: 'test',
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
const mockBaseTweetInfoCreatedBeforeTaskStartTime: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}

const mockPromotionTask: TaskWithLink = {
  ...baseTask,
  type: 'promotion',
  link: 'https://twitter.com/user_handle/status/9876'
}
const mockPromotionTweetInfo: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    referenced_tweets: [{
      type: 'quoted',
      id: '9876'
    }]
  }]
}
const mockPromotionWrongReferencedTweetInfo: TwitterTweetInfo = {
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
const mockArticleTweetInfo: TwitterTweetInfo = {
  ...mockBaseTweetInfo,
  data: [{
    ...mockBaseTweetInfo.data[0],
    note_tweet: {
      text: 'long long long test'
    }
  }]
}
const mockArticleTweetInfoCreatedBeforeTaskStartTime: TwitterTweetInfo = {
  ...mockArticleTweetInfo,
  data: [{
    ...mockArticleTweetInfo.data[0],
    created_at: '2017-01-01T09:00:00Z'
  }]
}


describe('useTaskValidation', () => {
  let mockSpaceInfoNotEnded: TwitterSpaceInfo
  beforeEach(() => {
    vi.clearAllMocks()
    mockSpaceInfoNotEnded = createMockSpaceInfoNotEnded()
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

    it('should reject if twitter api returns error', async () => {
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

    it('should reject invalid space URL', async () => {
      const { validateTaskData } = useTaskValidation(
        mockSpaceTask,
        'https://twitter.com/invalid/url',
        'add',
        ['testuser']
      )

      await expect(validateTaskData()).rejects.toThrow('Invalid space URL')
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

    it('should reject if twitter api returns error', async () => {
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
    })
  })
})