import type { EventHandlerRequest, H3Event } from 'h3'
import { PutObjectCommandInput, S3 } from '@aws-sdk/client-s3'
import { allowedImageType, uploadPath, type UploadPath } from '~/utils/constants'
import { retry, sleep, toBase62 } from '~/utils'
import type { UploadResponse } from '~/types'

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>): Promise<UploadResponse> => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  const pathName = formData.get('pathName')
  const fileName = formData.get('fileName')?.slice(-4)

  try {
    const path = uploadPath[pathName as keyof UploadPath]
    if (!path) {
      console.error('upload path not found.')
      throw new Error('Upload path not found.')
    }

    if (!file) {
      console.error('No file uploaded.')
      throw new Error('No file uploaded.')
    }
    if (!allowedImageType.includes(file.type)) {
      throw new Error('Only jpg and png files are allowed.')
    }
    if (file.size > 150000) {
      throw new Error('Max size of upload image is 150KB.')
    }

    const {
      EVERLAND_API_ENDPOINT: endpoint,
      EVERLAND_API_KEY: apiKey,
      EVERLAND_API_SECRET: secret,
      EVERLAND_API_REGION: region,
      EVERLAND_BUCKET_NAME: bucketName
    } = import.meta.env
    const EverLandUrlPrefix = `https://${bucketName}.4everland.store`

    const s3 = new S3({
      endpoint: endpoint,
      credentials: {
        accessKeyId: apiKey,
        secretAccessKey: secret
      },
      region: region,
    })

    // TODO compress image before uploading if needed

    const key = path + '/' + fileName + '@' + toBase62(new Date().getTime())
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: file.type,
      Body: await file.arrayBuffer(),
      ACL: 'public-read'
    } as PutObjectCommandInput

    await s3.putObject(params)

    await sleep(500)

    const data = await retry({
      fn: async () => {
        const data = await s3.headObject({
          Bucket: bucketName,
          Key: key,
        })
        if (!data || !data.Metadata) {
          console.error('Failed to get uploaded file info.')
          throw new Error('Failed to get uploaded file info.')
        }
        if (data.Metadata['arweave-status'] === 'syncing') {
          throw new Error('File is syncing to Arweave.')
        }
        return data
      },
      maxAttempts: 3,
      interval: 800
    })

    if (!data || !data.Metadata) {
      throw new Error('Failed to get uploaded file info.')
    }
    console.log('uploaded object:', data.Metadata)

    return {
      url: EverLandUrlPrefix + key,
      ARHash: data.Metadata['arweave-hash'],
      success: true,
      message: ''
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : e as string
    console.error('upload failed:', message)
    return { success: false, message }
  }

})
