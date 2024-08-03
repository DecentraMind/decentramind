import { ref, unref, readonly } from 'vue'
import { useFetch } from '@vueuse/core'
import type { UploadResponse } from '~/types'
import { allowedImageType, type UploadPath } from '~/utils/constants'

export function useUpload() {
  // eslint-disable-next-line prefer-const
  let uploadError = ref<Error>()
  // eslint-disable-next-line prefer-const
  let isUploading = ref(false)
  // eslint-disable-next-line prefer-const
  let uploadResponse = ref<UploadResponse>()

  async function upload(options: {
    fileName: string,
    pathName: keyof UploadPath,
    file?: File,
    maxSizeKB?: number
  }) {
    const { fileName, pathName, file, maxSizeKB=150 } = options

    try {
      isUploading.value = true
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

      const formData = new FormData()
      formData.append('fileName', fileName.slice(-4))
      formData.append('pathName', pathName)
      formData.append('file', file)

      const { data: response, error } = await useFetch<UploadResponse>('/api/upload', {
        method: 'PUT',
        body: formData,
      }).json()
      const res = unref(response)
      const err = unref(error)

      if (err || !res || !res.success || !res.url || !res.ARHash) {
        let message = err instanceof Error ? err.message : (typeof err === 'string' ? err : '')
        if (res && res.message) {
          message += ' ' + res.message
        }
        throw new Error(message)
      }

      uploadResponse.value = res
    } catch (e) {
      if (e instanceof Error) {
        uploadError.value = e
      }
    }

    isUploading.value = false
  }

  return {
    upload,
    uploadResponse,
    isUploading: readonly(isUploading),
    uploadError
  }
}
