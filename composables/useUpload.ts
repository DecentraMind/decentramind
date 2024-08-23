import { unref, readonly } from 'vue'
import { useFetch } from '@vueuse/core'
import type { UploadResponse } from '~/types'
import { allowedImageType as imageTypes, type UploadPath } from '~/utils/constants'

export function useUpload() {
  // eslint-disable-next-line prefer-const
  let uploadError = $ref<Error>()
  // eslint-disable-next-line prefer-const
  let isUploading = $ref(false)
  // eslint-disable-next-line prefer-const
  let uploadResponse = $ref<UploadResponse>()

  async function upload(options: {
    fileName: string,
    pathName: keyof UploadPath,
    file?: File,
    maxSizeKB?: number
    maxWidth?: number
    maxHeight?: number
    allowedImageType?: `image/${string}`[]
  }) {
    const { fileName, pathName, file, maxSizeKB=150, maxWidth, maxHeight, allowedImageType=imageTypes } = options

    // TODO useResize before uploading

    try {
      isUploading = true
      uploadError = undefined
      uploadResponse = undefined

      if (!file) {
        throw new Error('No file selected.')
      }

      const { size, type } = file
      if (size > maxSizeKB * 1000) {
        throw new Error('Max size of upload image is 150KB.')
      }
      if (!allowedImageType.includes(type)) {
        throw new Error('Only jpg and png files are allowed.')
      } 
      if (maxWidth || maxHeight) {
        const img = await getImageElementFromFile(file)
        if ((maxWidth && img.width > maxWidth) || (maxHeight && img.height > maxHeight)) {
          throw new Error(`Image dimensions error. Max width ${maxWidth}px, Max height ${maxHeight}px.`)
        }
      }

      const formData = new FormData()
      formData.append('fileName', fileName.slice(-4))
      formData.append('pathName', pathName)
      formData.append('file', file)

      const { data, error } = await useFetch<UploadResponse>('/api/upload', {
        method: 'PUT',
        body: formData,
      }).json()
      const res = unref(data)
      const err = unref(error)

      if (err || !res || !res.success || !res.url || !res.ARHash) {
        let message = err instanceof Error ? err.message : (typeof err === 'string' ? err : '')
        if (res && res.message) {
          message += ' ' + res.message
        }
        throw new Error(message)
      }

      uploadResponse = res
    } catch (e) {
      if (e instanceof Error) {
        uploadError = e
      }
    }

    isUploading = false
  }

  return $$({
    upload,
    uploadResponse,
    isUploading: readonly(isUploading),
    uploadError
  })
}
