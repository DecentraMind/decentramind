import { describe, it, expect, vi, beforeEach } from 'vitest'
import validateTaskData from './validateTaskData'
import { minSpaceLiveLength, minBirdTweetTextLength, minArticleTextLength } from '@/utils/constants'
import { mockBaseTweetInfo, mockBaseTweetTask, mockSpaceInfo, mockSpaceTask, mockSpaceInfoNotEnded, mockSpaceInfoLastsLessThanMinSpaceLiveLength, mockBaseTweetInfoCreatedBeforeTaskStartTime, mockBaseTweetInfoWithShortText, mockArticleTask, mockArticleTweetInfo, mockArticleTypeTweetInfo, mockArticleTweetInfoCreatedBeforeTaskStartTime, mockPromotionTask, mockPromotionTweetInfo, mockPromotionWrongReferencedTweetInfo, mockPromotionTweetInfoCreatedBeforeTaskStartTime, mockArticleTweetInfoWithShortText } from '~/tests/data'

describe('useTaskValidation', () => {

  describe('validateSpaceUrl', () => {
    it('should validate a correct twitter.com space URL', async () => {
      const result = validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })

      expect(result).toEqual(mockSpaceInfo)
    })

    it('should validate a correct x.com space URL', async () => {
      const result = validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })

      expect(result).toEqual(mockSpaceInfo)
    })

    it('should reject space that has not ended', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfoNotEnded,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })).toThrowError('has not ended')
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add'
      })).toThrowError('Twitter vouched IDs are not provided.')

      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: []
      })).toThrowError('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the space creator', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['another_user']
      })).toThrowError('not the primary host of space 1234.')
    })

    it(`should reject if the space lasts less than ${minSpaceLiveLength} minutes`, async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfoLastsLessThanMinSpaceLiveLength,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })).toThrowError(`lasts less than ${minSpaceLiveLength} minutes`)
    })
  })

  describe('validateTweetUrl(bird task)', () => {
    it('should validate a correct twitter.com tweet URL', async () => {
      const result = validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })

      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should validate a correct x.com tweet URL', async () => {
      const result = validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })

      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add'
      })).toThrowError('Twitter vouched IDs are not provided.')

      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: []
      })).toThrowError('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the tweet author', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['another_user']
      })).toThrowError('not the tweet author.')
    })

    it('should reject if the tweet is created before task start time', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfoCreatedBeforeTaskStartTime,
        mode: 'add',
        twitterVouchedIDs: ['testuser']
      })).toThrowError('created before task start time')
    })

    describe('validateBirdTweetUrl', () => {
      it(`should reject if the tweet text length is less than ${minBirdTweetTextLength}`, async () => {
        expect(() => validateTaskData({
          task: mockBaseTweetTask,
          data: mockBaseTweetInfoWithShortText,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError(`tweet text length is less than ${minBirdTweetTextLength}`)
      })

      it('should reject if the tweet is an article', async () => {
        expect(() => validateTaskData({
          task: mockBaseTweetTask,
          data: mockArticleTypeTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError('article is not supported for bird quest.')
      })
    })

    describe('validateTweetPromotionUrl', () => {
      it('should validate a correct promotion tweet URL', async () => {
        const result = validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })

        expect(result).toEqual(mockPromotionTweetInfo)
      })

      it('should reject if the referenced tweet is not the task promotion tweet', async () => {
        expect(() => validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionWrongReferencedTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError('referenced tweet is not the task promotion tweet.')
      })

      it('should reject if the tweet is created before task start time', async () => {
        expect(() => validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionTweetInfoCreatedBeforeTaskStartTime,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError('created before task start time')
      })
    })

    describe('validateTweetArticleUrl', () => {
      it('should validate a correct article tweet URL', async () => {
        expect(validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toEqual(mockArticleTweetInfo)
      })

      it('should reject if the tweet is an article', async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTypeTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError('article is not supported for good read quest.')
      })

      it('should reject if the tweet is created before task start time', async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoCreatedBeforeTaskStartTime,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError('created before task start time')
      })

      it(`should reject if the article text length is less than ${minArticleTextLength}`, async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoWithShortText,
          mode: 'add',
          twitterVouchedIDs: ['testuser']
        })).toThrowError(`article text length is less than ${minArticleTextLength}`)
      })
    })
  })
})