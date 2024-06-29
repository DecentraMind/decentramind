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
  

  // const oriUrl = 'https://i3.mjj.rip/2024/06/29/9672a64db746466ab66602f90fc11abb.png'
  // const xxx = await getImageDataFromURL(oriUrl)
  // const {mssim} = ssim(await getImageDataFromURL('https://pbs.twimg.com/profile_images/1806932799250944000/-uW5TZHT_normal.png'), xxx) as ssimType
  // ssimResult.value = mssim
  const la = 'https://pbs.twimg.com/profile_images/1806932799250944000/-uW5TZHT_normal.png'
              // https://pbs.twimg.com/profile_images/1806932799250944000/-uW5TZHT.png
  let resp = la.split('_')
  let url = ''
  for(let i = 0; i < resp.length - 1; ++i){
    url = url + resp[i]
    if(i != resp.length - 2){
      url += '_'
    }
  }
  url = url + '.png'
  console.log('url = ' + url)
}
</script>

<style scoped>
input {
  margin: 10px 0
}
</style>
