import { ssim } from 'ssim.js'

export function getImageElementFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve(img)
      }
      img.onerror = (e) => {
        reject(e)
      }
      img.src = e?.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function resizeCrop(src: HTMLImageElement, width: number, height: number) {
  const crop = width == 0 || height == 0
  // not resize
  if (src.width <= width && height == 0) {
    width = src.width
    height = src.height
  }
  // resize
  if (src.width > width && height == 0) {
    height = src.height * (width / src.width)
  }

  // check scale
  const xScale = width / src.width
  const yScale = height / src.height
  const scale = crop ? Math.min(xScale, yScale) : Math.max(xScale, yScale)
  // create empty canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if(!ctx) {
    throw new Error('Failed to get 2d context.')
  }

  canvas.width = width ? width : Math.round(src.width * scale)
  canvas.height = height ? height : Math.round(src.height * scale)
  ctx.scale(scale, scale)
  // crop it top center
  ctx.drawImage(
    src,
    ((src.width * scale) - canvas.width) * -.5,
    ((src.height * scale) - canvas.height) * -.5
  )

  return canvas
}

export const getImageDataFromURL = async (url: string, width?: number, height?: number): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // 解决跨域问题

    img.onload = () => {
      // 如果提供了width和height，进行裁剪和缩放
      let canvas: HTMLCanvasElement
      if (width !== undefined && height !== undefined) {
        canvas = resizeCrop(img, width, height)
      } else {
        // 否则，使用原始尺寸
        canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
      }

      const ctx = canvas.getContext('2d')!
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }

    img.onerror = reject
    img.src = url
  })
}

export const compareImages = async (communityAvatar: string, twitterAvatar: string) => {
  const twitterImageData = await getImageDataFromURL(twitterAvatar, 100, 100)
  const communityImageData = await getImageDataFromURL(communityAvatar, 100, 100)
  const { mssim } = ssim(twitterImageData, communityImageData)

  console.log('mssim = ' + mssim)
  return mssim
}
