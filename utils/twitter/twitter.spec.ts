import { describe, it, expect } from 'vitest'
import { getSpaceIds, getTweetIds } from './twitter'

describe('twitter utils', () => {
  
  describe('getSpaceIds', () => {
    it('should extract space IDs from valid URLs', () => {
      const urls = ['https://twitter.com/i/spaces/xeve', 'https://x.com/i/spaces/5678']
      const result = getSpaceIds(urls)
      expect(result).toEqual(['xeve', '5678'])
    })

    it('should throw error for invalid URLs', () => {
      const urls = ['https://twitter.com/spaces/invalid']
      expect(() => getSpaceIds(urls)).toThrow('Invalid space URL:')
    })

    it('should handle URLs with trailing and leading spaces', () => {
      const urls = [' https://twitter.com/i/spaces/z12test34 ', 'https://x.com/i/spaces/5678 ']
      const result = getSpaceIds(urls)
      expect(result).toEqual(['z12test34', '5678'])
    })

    it('should handle URLs with/without http or https', () => {
      const urls = ['twitter.com/i/spaces/z12test34', 'x.com/i/spaces/5678', 'http://twitter.com/i/spaces/jyjyj', 'https://x.com/i/spaces/ccrrg']
      const result = getSpaceIds(urls)
      expect(result).toEqual(['z12test34', '5678', 'jyjyj', 'ccrrg'])
    })

    it('should handle URLs with tailing slash and /peek', () => {
      const urls = ['https://twitter.com/i/spaces/1234/', 'https://x.com/i/spaces/atEcgesfe/peek']
      const result = getSpaceIds(urls)
      expect(result).toEqual(['1234', 'atEcgesfe'])
    })
  })

  describe('getTweetIds', () => {
    it('should extract tweet IDs from valid URLs', () => {
      const urls = [
        'https://twitter.com/user/status/123456789',
        'https://x.com/user/status/987654321',
      ]
      const result = getTweetIds(urls)
      expect(result).toEqual(['123456789', '987654321'])
    })

    it('should throw error for invalid URLs', () => {
      const urls = ['https://twitter.com/user/invalid']
      expect(() => getTweetIds(urls)).toThrow('Invalid tweet URL:')
    })

    it('should handle URLs with trailing and leading spaces', () => {
      const urls = [' https://twitter.com/user/status/123456789 ', 'https://x.com/user/status/987654321 ']
      const result = getTweetIds(urls)
      expect(result).toEqual(['123456789', '987654321'])
    })

    it('should handle URLs with tailing slash', () => {
      const urls = ['https://twitter.com/user/status/123456789/']
      const result = getTweetIds(urls)
      expect(result).toEqual(['123456789'])
    })
  })
}) 