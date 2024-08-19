import { defineTask } from '#imports'
import {
  createDataItemSigner,
  message,
  dryrun,
} from '@permaweb/aoconnect'
import { Community } from '~/types'
import { aoCommunityProcessID } from '~/utils/processID'
import { extractResult, retry, toBase62 } from '~/utils/util'
import { S3, PutObjectCommand } from '@aws-sdk/client-s3'
import { uploadPath } from '~/utils/constants'

const {
  EVERLAND_API_ENDPOINT: endpoint,
  EVERLAND_API_KEY: apiKey,
  EVERLAND_API_SECRET: secret,
  EVERLAND_API_REGION: region,
  EVERLAND_BUCKET_NAME: bucketName,
  WALLET: walletJson
} = import.meta.env
const EverLandUrlPrefix = `https://${bucketName}.4everland.store`
const wallet = JSON.parse(walletJson)

const s3 = new S3({
  endpoint: endpoint,
  credentials: {
    accessKeyId: apiKey,
    secretAccessKey: secret
  },
  region: region,
})

async function uploadBase64Image(base64Image: string, key: string) {
  // Extract MIME type and base64 data from the data URI
  const matches = base64Image.match(/^data:(.+);base64,(.*)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image data')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, 'base64')

  await s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentEncoding: 'base64', // required to handle binary data correctly
    ContentType: mimeType // Set content type based on extracted MIME type
  })
}

const getCommunity = async (uuid: any) => {
  const result = await dryrun({
    process: aoCommunityProcessID,
    tags: [
      { name: 'Action', value: 'getCommunity' },
      { name: 'uuid', value: uuid }
    ]
  })

  const json = extractResult<string>(result)
  if (!json) return

  return JSON.parse(json) as Community
}


export default defineTask({
  meta: {
    name: 'ReplaceImage',
    description: 'Upload images to arweave, and replace base64 data URI to 4Everland url and AR tx ID.',
  },
  async run({ payload, context }) {
    try {
      const community = await getCommunity('873901d5-f550-4ebc-b03d-56ef683b8c44')
      console.log({ community })

      if (community && /^data:/.test(community.logo)) {
        // save base64 data URI as local tmp file
        const key = uploadPath.communityLogo + '/' + community.uuid.slice(-4) + '@' + toBase62(new Date().getTime())
        await uploadBase64Image(community.logo, key)

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
        console.log('uploaded image:', data)

        community.logo = EverLandUrlPrefix + key
        community.logoARHash = data!.Metadata!['arweave-hash']
        console.log('set community:', community.uuid, community.logo, community.logoARHash)
        await updateCommunity(community)
      }
      return {
        result: community,
        // community
      }
    } catch (error) {
      console.error('replace image error = ' + error)
      return { result: null }
    }
  },
})

async function updateCommunity (
  community: Community
) {
  const communitySubmitList = [{
    ...community
  }]
  const jsonString = JSON.stringify(communitySubmitList)
  await message({
    process: aoCommunityProcessID,
    tags: [
      { name: 'Action', value: 'communitysetting' },
      { name: 'userAddress', value: '' }
    ],
    signer: createDataItemSigner(wallet),
    data: jsonString,
  })
}
