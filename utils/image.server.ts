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
  console.log('getImageData from URL', url)

  // Extract raw pixels in RGBA format
  const { data, info } = await sharpInstance
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Return in ImageData compatible format
  return {
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
    // colorSpace: 'srgb'
  } as ImageData
}

export const compareImages = async (aUrl: string, bUrl: string) => {
  const aImageData = await getImageData(aUrl, 500, 500)
  const bImageData = await getImageData(bUrl, 500, 500)
  const { mssim } = ssim(aImageData, bImageData)

  console.log({ aUrl, bUrl, mssim })
  return mssim
}
