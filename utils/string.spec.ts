import { describe, it, expect } from 'vitest'
import {
  createUuid,
  shortString,
  getDomain,
  getHandle,
  toBase62,
  wordCount,
  getTextRenderWidth
} from './string'

describe('string utils', () => {
  describe('createUuid', () => {
    it('should create a valid UUID', () => {
      const uuid = createUuid()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should create unique UUIDs', () => {
      const uuid1 = createUuid()
      const uuid2 = createUuid()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('shortString', () => {
    it('should shorten long strings', () => {
      expect(shortString('1234567890abcdef')).toBe('123456...cdef')
    })

    it('should return original string if shorter than limit', () => {
      expect(shortString('1234')).toBe('1234')
    })

    it('should handle custom lengths', () => {
      expect(shortString('1234567890abcdef', 4, 2)).toBe('1234...ef')
    })

    it('should handle empty string', () => {
      expect(shortString('')).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(shortString(undefined as unknown as string)).toBe('')
    })
  })

  describe('getDomain', () => {
    it('should extract domain from URL', () => {
      expect(getDomain('https://example.com/path')).toBe('example.com')
    })

    it('should handle URLs without paths', () => {
      expect(getDomain('http://example.com')).toBe('example.com')
    })

    it('should handle empty string', () => {
      expect(getDomain('')).toBe('')
    })
  })

  describe('getHandle', () => {
    it('should extract handle from URL', () => {
      expect(getHandle('https://twitter.com/username')).toBe('username')
    })

    it('should handle URLs with trailing slash', () => {
      expect(getHandle('https://twitter.com/username/')).toBe('username')
    })

    it('should handle URLs with dash or dot', () => {
      expect(getHandle('https://twitter.com/username-123/')).toBe('username-123')
      expect(getHandle('https://twitter.com/username.123/')).toBe('username.123')
      expect(getHandle('https://twitter.com/username_123/')).toBe('username_123')
    })

    it('should handle empty string', () => {
      expect(getHandle('')).toBe('')
    })
  })

  describe('toBase62', () => {
    it('should convert numbers to base62', () => {
      expect(toBase62(0)).toBe('')
      expect(toBase62(1)).toBe('1')
      expect(toBase62(61)).toBe('Z')
      expect(toBase62(62)).toBe('10')
    })
  })

  describe('wordCount', () => {
    it('should count English words', () => {
      expect(wordCount('hello world')).toBe(2)
      expect(wordCount('lorem ipsum dolor sit amet')).toBe(5)
    })

    it('should count all languages words', () => {
      // russian
      expect(wordCount('привет мир')).toBe(2)
      // ukrainian
      expect(wordCount('привіт світ')).toBe(2)
      // belarusian
      expect(wordCount('прывітанне свет')).toBe(2)
      // bulgarian
      expect(wordCount('здравей свят')).toBe(2)
      // greek
      expect(wordCount('γεια σου κόσμος')).toBe(3)
      // turkish
      expect(wordCount('merhaba dünya')).toBe(2)
      // arabic
      expect(wordCount('مرحبا بالعالم')).toBe(2)
      // persian
      expect(wordCount('سلام دنیا')).toBe(2)
      // urdu
      expect(wordCount('ہم سے دنیا')).toBe(3)
      // hindi
      expect(wordCount('नमस्ते दुनिया')).toBe(2)
      // tamil
      expect(wordCount('வணக்கம் உலகம்')).toBe(2)
      // telugu
      expect(wordCount('హల్లో ప్రపంచం')).toBe(2)
      // malayalam
      expect(wordCount('ഹലോ പ്രപംചം')).toBe(2)
      // kannada
      expect(wordCount('ಹಲೋ ಪ್ರಪಂಚಂ')).toBe(2)
      // marathi
      expect(wordCount('होण सर्व')).toBe(2)
      // nepali
      expect(wordCount('नमस्ते दुनिया')).toBe(2)
      // punjabi
      expect(wordCount('ਸ਼ਰਾਹੀ ਸ਼ੁਰਾਹੀ')).toBe(2)
    })

    it('should count CJK characters as words', () => {
      // chinese
      expect(wordCount('你好世界')).toBe(4)
      expect(wordCount('你好 世界')).toBe(4)
      // japanese
      expect(wordCount('こんにちは世界')).toBe(3)
      // korean
      expect(wordCount('안녕하세요 세계')).toBe(2)
    })

    it('should handle CJK and mixed content', () => {
      expect(wordCount('hello 世界')).toBe(3)
      expect(wordCount('wintermute和NEIRO')).toBe(3)
      // numbers and CJK and emoji
      expect(wordCount('105.04美金')).toBe(4)
      expect(wordCount('100块')).toBe(2)
      expect(wordCount('100块💲')).toBe(3)
      expect(wordCount('100块💰')).toBe(3)
      // expect(wordCount('100💵')).toBe(2)
    })

    it('should handle punctuation', () => {
      expect(wordCount('hello, world!')).toBe(2)
    })

    it('should handle empty string', () => {
      expect(wordCount('')).toBe(0)
    })

    it('should handle number+suffix', () => {
      expect(wordCount('5th episode')).toBe(2)
    })

    it('should handle newlines', () => {
      expect(wordCount('hello\nworld')).toBe(2)
      expect(wordCount(`here

Enjoy!`)).toBe(2)
    })

    it('should handle emoji correctly', () => {
      expect(wordCount('👋')).toBe(1)
      expect(wordCount('hello 👋')).toBe(2)
      expect(wordCount('😀 😃 😄')).toBe(3)
      expect(wordCount('hello 🌍 world')).toBe(3)
      expect(wordCount('❤️')).toBe(1)
      expect(wordCount('🇺🇸')).toBe(1) // Flag emoji
      
      // Additional test cases for composed emoji
      expect(wordCount('👨‍👩‍👧‍👦')).toBe(1) // Family emoji
      expect(wordCount('👨‍💻')).toBe(1) // Person technologist emoji
      expect(wordCount('👩‍🦰')).toBe(1) // Woman with red hair
      expect(wordCount('👨‍👩‍👧')).toBe(1) // Family with one child
      expect(wordCount('🏳️‍🌈')).toBe(1) // Rainbow flag
      expect(wordCount('👩‍🔬')).toBe(1) // Woman scientist
    })

    it('should handle crypto addresses', () => {
      // ethereum address
      expect(wordCount('-0xf8f3d934777f3a5dd8964ac58abbbe732d7c030b……')).toBe(1)
      // solana address
      expect(wordCount('5xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')).toBe(1)
      // bitcoin address
      expect(wordCount('1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH')).toBe(1)
      // arweave address
      expect(wordCount('96nQROiF0ahfpMzTtyfpRNa_gu7s7OUWPUhsHSsz5aI')).toBe(1)
      expect(wordCount('fmTpIBFrCbAyUjV-f3VOq7Szs5RaMovb1Pf9MlUnjVk')).toBe(1)
    })

    // Test mixed content
    it('should handle mixed emoji and text correctly', () => {
      expect(wordCount('Hello 👨‍👩‍👧‍👦 World')).toBe(3)
      expect(wordCount('👨‍💻 Coding 🎮 Gaming')).toBe(4)
      expect(wordCount('🇺🇸 USA 🗽 Liberty')).toBe(4)
      // real world example
      expect(wordCount('Here’s the.')).toBe(2)
      expect(wordCount('👇Here')).toBe(2)
      expect(wordCount('👇Here\'s')).toBe(2)
      expect(wordCount('👇Here’s the 5th episode of how to create a community.')).toBe(11)
      expect(wordCount(`-0xf8f3d934777f3a5dd8964ac58abbbe732d7c030b
105.04美金 获得951.5w枚

在推上能找到的wintermute和NEIRO的po文记录最早是在0809`)).toBe(31)
    })
  })

  // Note: getTextRenderWidth tests would need to be run in a browser environment
  // as it requires DOM APIs. Consider using jsdom or similar for these tests.
  // describe('getTextRenderWidth', () => {
  //   it('should return a number', () => {
  //     const width = getTextRenderWidth('test', 16)
  //     expect(typeof width).toBe('number')
  //     expect(width).toBeGreaterThan(0)
  //   })
  // })
}) 