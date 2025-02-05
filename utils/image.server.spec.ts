import { describe, it, expect } from 'vitest'
import { compareImages } from './image.server'


describe('compareImages', () => {
  it('should compare two images and return similarity score', async () => {
    const aUrl = 'https://arweave.4everland.xyz/FcaExQs5fN4KAeYhxgnfHK4Fp9U6Rh62xsBHhxg2AnU'
    const bUrl = 'https://pbs.twimg.com/profile_images/1879741694465454080/468EsS2u.png'
    const result = await compareImages(aUrl, bUrl)
    expect(result).toBeGreaterThan(0.85)
  })
})