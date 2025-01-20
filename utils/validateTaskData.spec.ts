import { describe, it, expect } from 'vitest'
import validateTaskData from './validateTaskData'
import { minSpaceLiveLength, minBirdTweetTextLength, minArticleTextLength } from '@/utils/constants'
import { mockBaseTweetInfo, mockBaseTweetTask, mockSpaceInfo, mockSpaceTask, mockSpaceInfoNotEnded, mockSpaceInfoLastsLessThanMinSpaceLiveLength, mockBaseTweetInfoCreatedBeforeTaskStartTime, mockBaseTweetInfoWithShortText, mockArticleTask, mockArticleTweetInfo, mockArticleTypeTweetInfo, mockArticleTweetInfoCreatedBeforeTaskStartTime, mockPromotionTask, mockPromotionTweetInfo, mockPromotionWrongReferencedTweetInfo, mockPromotionTweetInfoCreatedBeforeTaskStartTime, mockArticleTweetInfoWithShortText, mockBaseTweetInfoNoInviteLinkNoCommunityName, mockArticleTweetInfoNoInviteLinkNoCommunityName, mockArticleTweetInfoWithInviteLinkInEntities, mockBaseTweetInfoWithInviteLinkInEntities, mockArticleNoteTweetInfoWithInviteLinkInEntities, mockBaseNoteTweetInfoWithInviteLinkInEntities } from '~/tests/data'

describe('useTaskValidation', () => {

  describe('validateSpaceUrl', () => {
    it('should validate a correct twitter.com space URL', async () => {
      const result = validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })

      expect(result).toEqual(mockSpaceInfo)
    })

    it('should validate a correct x.com space URL', async () => {
      const result = validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })

      expect(result).toEqual(mockSpaceInfo)
    })

    it('should reject space that has not ended', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfoNotEnded,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })).toThrowError('has not ended')
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        communityName: 'testCommunity'
      })).toThrowError('Twitter vouched IDs are not provided.')

      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: [],
        communityName: 'testCommunity'
      })).toThrowError('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the space creator', async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfo,
        mode: 'add',
        twitterVouchedIDs: ['another_user'],
        communityName: 'testCommunity'
      })).toThrowError('not the primary host of space 1234.')
    })

    it(`should reject if the space lasts less than ${minSpaceLiveLength} minutes`, async () => {
      expect(() => validateTaskData({
        task: mockSpaceTask,
        data: mockSpaceInfoLastsLessThanMinSpaceLiveLength,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })).toThrowError(`lasts less than ${minSpaceLiveLength} minutes`)
    })
  })

  describe('validateTweetUrl(bird task)', () => {
    it('should validate a correct twitter.com tweet URL', async () => {
      const result = validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })

      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should validate a correct x.com tweet URL', async () => {
      const result = validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })

      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should reject if vouched IDs are not provided in add mode', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        communityName: 'testCommunity'
      })).toThrowError('Twitter vouched IDs are not provided.')

      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: [],
        communityName: 'testCommunity'
      })).toThrowError('Twitter vouched IDs are not provided.')
    })

    it('should reject if the submitter is not the tweet author', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfo,
        mode: 'add',
        twitterVouchedIDs: ['another_user'],
        communityName: 'testCommunity'
      })).toThrowError('not the tweet author.')
    })

    it('should reject if the tweet is created before task start time', async () => {
      expect(() => validateTaskData({
        task: mockBaseTweetTask,
        data: mockBaseTweetInfoCreatedBeforeTaskStartTime,
        mode: 'add',
        twitterVouchedIDs: ['testuser'],
        communityName: 'testCommunity'
      })).toThrowError('created before task start time')
    })

    describe('validateBirdTweetUrl', () => {
      it(`should reject if the tweet text is less than ${minBirdTweetTextLength} words`, async () => {
        expect(() => validateTaskData({
          task: mockBaseTweetTask,
          data: mockBaseTweetInfoWithShortText,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError(`tweet text is less than ${minBirdTweetTextLength} words`)
      })

      it('should reject if the tweet is an article', async () => {
        expect(() => validateTaskData({
          task: mockBaseTweetTask,
          data: mockArticleTypeTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('article is not supported for bird quest.')
      })

      it('should pass if the tweet text not include invite link but entities includes invite link', async () => {
        expect(validateTaskData({
          task: mockBaseTweetTask,
          data: mockBaseTweetInfoWithInviteLinkInEntities,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toEqual(mockBaseTweetInfoWithInviteLinkInEntities)
      })

      it('should pass if the note_tweet.entities includes invite link', async () => {
        expect(validateTaskData({
          task: mockBaseTweetTask,
          data: mockBaseNoteTweetInfoWithInviteLinkInEntities,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toEqual(mockBaseNoteTweetInfoWithInviteLinkInEntities)
      })

      it('should reject if the tweet text and entities does not include invite link or community name', async () => {
        expect(() => validateTaskData({
          task: mockBaseTweetTask,
          data: mockBaseTweetInfoNoInviteLinkNoCommunityName,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('Invalid tweet URL: tweet does not include invite link or community name.')
      })

      // it('should reject if the tweet text does not include community name', async () => {
      //   expect(() => validateTaskData({
      //     task: mockBaseTweetTask,
      //     data: mockBaseTweetInfoWithoutCommunityName,
      //     mode: 'add',
      //     twitterVouchedIDs: ['testuser'],
      //     communityName: 'testCommunity'
      //   })).toThrowError('tweet text does not include community name testCommunity')
      // })
    })

    describe('validateTweetPromotionUrl', () => {
      it('should validate a correct promotion tweet URL', async () => {
        const result = validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })

        expect(result).toEqual(mockPromotionTweetInfo)
      })

      it('should reject if the referenced tweet is not the task promotion tweet', async () => {
        expect(() => validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionWrongReferencedTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('referenced tweet is not the task promotion tweet.')
      })

      it('should reject if the tweet is created before task start time', async () => {
        expect(() => validateTaskData({
          task: mockPromotionTask,
          data: mockPromotionTweetInfoCreatedBeforeTaskStartTime,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('created before task start time')
      })
    })

    describe('validateTweetArticleUrl', () => {
      it('should validate a correct article tweet URL', async () => {
        expect(validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toEqual(mockArticleTweetInfo)
      })

      it('should reject if the tweet is an article', async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTypeTweetInfo,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('article is not supported for good read quest.')
      })

      it('should reject if the tweet is created before task start time', async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoCreatedBeforeTaskStartTime,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('created before task start time')
      })

      it(`should reject if the article text is less than ${minArticleTextLength} words`, async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoWithShortText,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError(`text length is less than ${minArticleTextLength} words`)
      })

      it('should pass if the tweet text not include invite link but entities includes invite link', async () => {
        expect(validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoWithInviteLinkInEntities,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toEqual(mockArticleTweetInfoWithInviteLinkInEntities)
      })

      it('should pass if the note_tweet.entities includes invite link', async () => {
        expect(validateTaskData({
          task: mockArticleTask,
          data: mockArticleNoteTweetInfoWithInviteLinkInEntities,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toEqual(mockArticleNoteTweetInfoWithInviteLinkInEntities)
      })

      it('should reject if the tweet text and entities does not include invite link or community name', async () => {
        expect(() => validateTaskData({
          task: mockArticleTask,
          data: mockArticleTweetInfoNoInviteLinkNoCommunityName,
          mode: 'add',
          twitterVouchedIDs: ['testuser'],
          communityName: 'testCommunity'
        })).toThrowError('Invalid tweet URL: article does not include invite link or community name.')
      })

      // it('should reject if the article text does not include community name', async () => {
      //   expect(() => validateTaskData({
      //     task: mockArticleTask,
      //     data: mockArticleTweetInfoWithoutCommunityName,
      //     mode: 'add',
      //     twitterVouchedIDs: ['testuser'],
      //     communityName: 'testCommunity'
      //   })).toThrowError('article text does not include community name testCommunity')
      // })
    })
  })
})