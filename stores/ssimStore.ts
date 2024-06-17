
import { ssim } from 'ssim.js'
// import imageCompression from 'browser-image-compression'

export const ssimStore = defineStore('ssimStore', () => {
  // const image1 = ref<ImageData | null>(null)
  // const image2 = ref<ImageData | null>(null)
  // const ssimResult = ref<number | null>(null)

  // const onFileChange = async (event: Event, imageNumber: number): Promise<void> => {
  //   const files = (event.target as HTMLInputElement).files
  //   if (files && files.length > 0) {
  //     const file = files[0]
  //     const imageData = await getImageData(file)
  //     if (imageNumber === 1) {
  //       image1.value = imageData
  //     } else {
  //       image2.value = imageData
  //     }
  //   }
  // }
  const getImageDataFromURL = async (url: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // 解决跨域问题
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        resolve(ctx.getImageData(0, 0, img.width, img.height))
      }
      img.onerror = reject
      img.src = url
    })
  }
  // const getImageData = async (file: File): Promise<ImageData> => {
  //   const options = { maxSizeMB: 1, useWebWorker: true }
  //   const compressedFile = await imageCompression(file, options)
  //   const imageBitmap = await createImageBitmap(compressedFile)
  //   const canvas = document.createElement('canvas')
  //   canvas.width = imageBitmap.width
  //   canvas.height = imageBitmap.height
  //   const ctx = canvas.getContext('2d')!
  //   ctx.drawImage(imageBitmap, 0, 0)
  //   return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
  // }
  const getImageDataFromBase64 = async (base64: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // 解决跨域问题
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        resolve(ctx.getImageData(0, 0, img.width, img.height))
      }
      img.onerror = reject
      img.src = base64
    })
  }
  const compareImages = async (communityAvatar: string, twitterAvatar: string) => {
    try {
      // 获取图像数据
      const twitterImageData = await getImageDataFromURL(twitterAvatar)
      const communityImageData = await getImageDataFromBase64(communityAvatar)
      // 计算 SSIM
      const {mssim} = ssim(twitterImageData, communityImageData)

      // 输出和返回结果
      console.log('mssim = ' + mssim)
      return mssim

    } catch (error) {
      // 处理错误
      console.error('Error processing images:', error)
      // throw error
    }
  }

  return $$({ compareImages })
})
