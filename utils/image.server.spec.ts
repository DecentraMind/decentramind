import { describe, it, expect } from 'vitest'
import { compareImages } from './image.server'
import { minSSIM } from './constants'

describe('compareImages', () => {
  it('should compare two images and return similarity score', async () => {
    const aUrl = 'https://arweave.4everland.xyz/FcaExQs5fN4KAeYhxgnfHK4Fp9U6Rh62xsBHhxg2AnU'
    const bUrl = 'https://pbs.twimg.com/profile_images/1879741694465454080/468EsS2u.png'
    const result = await compareImages(aUrl, bUrl)
    expect(result).toBeGreaterThan(0.85)
  })
  it('should compare two exact same images and return similarity score equal to 1', async () => {
    const aUrl = 'https://arweave.4everland.xyz/rFetd2fFtK9ObNaDTcdGdsoItErgvAyn0ivZap9T6Xo'
    const bUrl = 'https://arweave.4everland.xyz/rFetd2fFtK9ObNaDTcdGdsoItErgvAyn0ivZap9T6Xo'
    const result = await compareImages(aUrl, bUrl)
    expect(result).toBe(1)
  })
  it('should compare two images and return similarity score greater than minSSIM', async () => {
    const aUrl = 'https://arweave.4everland.xyz/rFetd2fFtK9ObNaDTcdGdsoItErgvAyn0ivZap9T6Xo'
    const bUrl = 'https://pbs.twimg.com/profile_images/1895443362313867264/MZcIB5u8.jpg'
    const result = await compareImages(aUrl, bUrl)
    expect(result).toBeGreaterThan(minSSIM)
  })
  // it('should compare two images(transparent background and white background) and return similarity score greater than minSSIM', async () => {
  //   const aUrl = 'https://arweave.4everland.xyz/FcaExQs5fN4KAeYhxgnfHK4Fp9U6Rh62xsBHhxg2AnU'
  //   const bUrl = 'https://pbs.twimg.com/profile_images/1895443362313867264/MZcIB5u8.jpg'
  //   const result = await compareImages(aUrl, bUrl)
  //   expect(result).toBeGreaterThan(minSSIM)
  // })
})