import sharp from 'sharp'
import { ssim } from 'ssim.js'

export const getImageData = async (url: string, width?: number, height?: number): Promise<ImageData> => {
  // Fetch and process image
  const buffer = await fetch(url).then(res => res.arrayBuffer())
  let sharpInstance = sharp(buffer)

  // Resize if dimensions provided
  if (width !== undefined && height !== undefined) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
  }

  // Extract raw pixels in RGBA format
  const { data, info } = await sharpInstance
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Return in ImageData compatible format
  return {
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
    colorSpace: 'srgb'
  } as ImageData
}

export const compareImages = async (communityAvatar: string, twitterAvatar: string) => {
  const twitterImageData = await getImageData(twitterAvatar, 100, 100)
  const communityImageData = await getImageData(communityAvatar, 100, 100)
  const { mssim } = ssim(twitterImageData, communityImageData)

  console.log('mssim = ' + mssim)
  return mssim
}
