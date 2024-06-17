<template>
  <div>
    <h1>Image Similarity Comparison</h1>
    <input type="file" @change="onFileChange($event, 1)" />
    <input type="file" @change="onFileChange($event, 2)" />
    <button @click="compareImages">Compare</button>
    <p v-if="ssimResult !== null">SSIM: {{ ssimResult }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ssimType, ssim } from 'ssim.js'
import imageCompression from 'browser-image-compression'

const image1 = ref<ImageData | null>(null)
const image2 = ref<ImageData | null>(null)
const ssimResult = ref<number | null>(null)

const onFileChange = async (event: Event, imageNumber: number): Promise<void> => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]
    const imageData = await getImageData(file)
    if (imageNumber === 1) {
      image1.value = imageData
    } else {
      image2.value = imageData
    }
  }
}
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
const getImageData = async (file: File): Promise<ImageData> => {
  const options = { maxSizeMB: 1, useWebWorker: true }
  const compressedFile = await imageCompression(file, options)
  const imageBitmap = await createImageBitmap(compressedFile)
  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageBitmap, 0, 0)
  return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
}
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
const compareImages = async (): void => {
  const base = 'data:image/jpeg;base64,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'
  const {mssim} = ssim(await getImageDataFromURL('https://pbs.twimg.com/profile_images/1801571505647849473/Zbu80-_C_normal.jpg'), await getImageDataFromBase64(base)) as ssimType
  ssimResult.value = mssim
}
</script>

<style scoped>
input {
  margin: 10px 0
}
</style>
