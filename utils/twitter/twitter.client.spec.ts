import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSpacesInfo, fetchTweetInfo } from './twitter.client'
import { mockBaseTweetInfo, mockBaseTweetInfoWithTwitterApiError, mockSpaceInfo, mockSpaceInfoWithTwitterApiError } from '~/tests/data'

const mockJsonResponse = vi.fn()

vi.mock('@vueuse/core', () => ({
  useFetch: () => ({
    json: mockJsonResponse
  }),
  unref: (x: any) => x
}))

describe('twitter.client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSpacesInfo', () => {
    it('should fetch and return space info for valid URLs', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfo,
        error: { value: null },
      } as any)
      const result = await fetchSpacesInfo(['https://twitter.com/i/spaces/1234/'])
      expect(result).toEqual(mockSpaceInfo)
    })

    it('should throw error when fetch fails', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: null,
        error: { value: 'error' },
      })
      await expect(fetchSpacesInfo(['https://twitter.com/i/spaces/1234/'])).rejects.toThrow('Failed to validate space URL: fetch data failed.')
    })

    it('should throw error when Twitter API returns errors', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockSpaceInfoWithTwitterApiError,
        error: { value: null },
      } as any)
      await expect(
        fetchSpacesInfo(['https://twitter.com/i/spaces/1234/'])
      ).rejects.toThrow('Failed to validate space URL, twitter api error')
    })

    it('should throw error when response data is invalid', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: { data: [] }, // missing 'includes'
        error: { value: null },
      } as any)
      await expect(
        fetchSpacesInfo(['https://twitter.com/i/spaces/1234/'])
      ).rejects.toThrow('Failed to validate space URL: fetch data failed.')
    })
  })

  describe('fetchTweetInfo', () => {
    it('should fetch and return tweet info for valid URLs', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfo,
        error: { value: null },
      } as any)

      const result = await fetchTweetInfo(['https://twitter.com/user/status/123456789'])
      expect(result).toEqual(mockBaseTweetInfo)
    })

    it('should throw error when fetch fails', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: null,
        error: { value: 'error' },
      })

      await expect(
        fetchTweetInfo(['https://twitter.com/user/status/123456789'])
      ).rejects.toThrow('Failed to validate tweet URL: fetch data failed.')
    })

    it('should throw error when Twitter API returns errors', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: mockBaseTweetInfoWithTwitterApiError,
        error: { value: null },
      })

      await expect(
        fetchTweetInfo(['https://twitter.com/user/status/123456789'])
      ).rejects.toThrow('Failed to validate tweet URL, twitter api error')
    })

    it('should throw error when response data is invalid', async () => {
      mockJsonResponse.mockResolvedValueOnce({
        data: { data: [] }, // missing 'includes'
        error: { value: null },
      })

      await expect(
        fetchTweetInfo(['https://twitter.com/user/status/123456789'])
      ).rejects.toThrow('Failed to validate tweet URL: fetch data failed.')
    })

    // TODO max 100 tweets
    // it('should throw error when more than 100 tweets are fetched', async () => {
    // })
  })
}) 