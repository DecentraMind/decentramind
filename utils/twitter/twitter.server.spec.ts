import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSpaces, getTweets } from './twitter.server'
import { mockSingleSpacesSuccessResponse1, mockMultipleSpacesSuccessResponse, mockSingleSpacesSuccessResponse2, mockTweetsResponse1, mockTweetsResponse2, mockMultipleTweetsResponse } from '~/tests/data'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

registerEndpoint('https://api.twitter.com/2/spaces?ids=1YqGovqmZvMKv', {
  method: 'GET',
  handler: () => mockSingleSpacesSuccessResponse1
})

describe('twitter.server', () => {
  beforeEach(() => {
    // Reset all module registries
    vi.resetModules()
    // clear all mocks
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('getSpaces', () => {

    it('should fetch single spaces successfully', async () => {
      // @ts-ignore
      globalThis.$fetch = vi.fn().mockResolvedValueOnce(mockSingleSpacesSuccessResponse1)
      const result = await getSpaces('1YqGovqmZvMKv')

      expect(result).toEqual(mockSingleSpacesSuccessResponse1)
    })

    it('should fetch multiple spaces successfully', async () => {
      vi.doMock('~/utils/constants', async (importOriginal) => {
        const actual = await importOriginal() as any
        return {
          ...actual,
          maxFetchSpaceIds: 100
        }
      })
      // @ts-ignore
      globalThis.$fetch = vi.fn().mockResolvedValueOnce(mockMultipleSpacesSuccessResponse)
      const { getSpaces } = await import('./twitter.server')

      const result = await getSpaces('1YqGovqmZvMKv,1kvJpvQNwODKE')

      expect(result).toEqual(mockMultipleSpacesSuccessResponse)
    })

    it('shold fetch multiple spaces when space ids are more than maxFetchSpaceIds', async () => {
      vi.doMock('~/utils/constants', async (importOriginal) => {
        const actual = await importOriginal() as any
        return {
          ...actual,
          maxFetchSpaceIds: 1
        }
      })
      // @ts-ignore
      globalThis.$fetch = vi.fn()
        .mockResolvedValueOnce(mockSingleSpacesSuccessResponse1)
        .mockResolvedValueOnce(mockSingleSpacesSuccessResponse2)
      const { getSpaces } = await import('./twitter.server')

      const result = await getSpaces('1YqGovqmZvMKv,1kvJpvQNwODKE')

      expect(result).toEqual(mockMultipleSpacesSuccessResponse)
    })

    it('should throw error if no space ids provided', async () => {
      await expect(getSpaces('')).rejects.toThrow('No space ids provided.')
    })

    it('should handle API errors', async () => {
      // TODO: Implement this test
    })
  })

  describe('getTweets', () => {
    it('should fetch tweets successfully', async () => {
      // @ts-ignore
      globalThis.$fetch = vi.fn().mockResolvedValueOnce(mockTweetsResponse1)
      const result = await getTweets('1')

      expect(result).toEqual(mockTweetsResponse1)
    })

    it('should throw error if no tweet ids provided', async () => {
      await expect(getTweets(''))
        .rejects
        .toThrow('No tweet ids provided.')
    })

    it('should fetch multiple tweets successfully', async () => {
      vi.doMock('~/utils/constants', async (importOriginal) => {
        const actual = await importOriginal() as any
        return {
          ...actual,
          maxFetchTweetIds: 100
        }
      })
      // @ts-ignore
      globalThis.$fetch = vi.fn().mockResolvedValueOnce(mockMultipleTweetsResponse)
      const { getTweets } = await import('./twitter.server')

      const result = await getTweets('1,1848308061611683853')

      expect(result).toEqual(mockMultipleTweetsResponse)
    })

    it('should fetch multiple tweets when tweet ids are more than maxFetchTweetIds', async () => {
      vi.doMock('~/utils/constants', async (importOriginal) => {
        const actual = await importOriginal() as any
        return {
          ...actual,
          maxFetchTweetIds: 1
        }
      })
      // @ts-ignore
      globalThis.$fetch = vi.fn()
        .mockResolvedValueOnce(mockTweetsResponse1)
        .mockResolvedValueOnce(mockTweetsResponse2)
      const { getTweets } = await import('./twitter.server')

      const result = await getTweets('1,1848308061611683853')

      expect(result).toEqual(mockMultipleTweetsResponse)
    })

    it('should handle API errors', async () => {
      // TODO: Implement this test
    })

  })
}) 