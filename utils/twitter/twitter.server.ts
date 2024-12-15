import type { TwitterSpacesInfo, TwitterTweetInfo } from '~/types'
import { maxFetchSpaceIds, maxFetchTweetIds } from '~/utils/constants'
import { chunk } from 'lodash-es'

const { TWITTER_BEARER_TOKEN: token } = process.env
if (!token) throw new Error('Twitter token not configured')

export async function getSpaces(ids: string) {
  // split ids to chunks of maxFetchSpaceIds
  const idsArray = ids.split(',')
  console.log('maxFetchSpaceIds: ', maxFetchSpaceIds)
  const chunks = chunk(idsArray, maxFetchSpaceIds)
  // console.log('chunks: ', chunks)

  const resultChunks = await Promise.all(chunks.map(chunk => {
    const url = 'https://api.twitter.com/2/spaces?ids=' + chunk.join(',') + '&space.fields=creator_id,host_ids,participant_count,started_at,ended_at&expansions=host_ids&user.fields=created_at,profile_image_url'
    console.log('fetch spaces from twitter api: ' + url)
    return $fetch<TwitterSpacesInfo>(url, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token
      },
      async onResponseError({ request, response }) {
        // Log error
        console.error(
          'Fetch twitter api error:',
          request,
          response.status,
          response.body
        )
        throw new Error('Failed to fetch spaces from twitter api.')
      },
    })
  }))
  const result: TwitterSpacesInfo = {
    data: [],
    includes: {
      users: []
    }
  }
  for (const [index, resultChunk] of resultChunks.entries()) {
    console.log('resultChunk ' + index)
    result.data?.push(...resultChunk.data!)
    if (resultChunk.includes) {
      for (const user of resultChunk.includes.users) {
        if (!result.includes!.users.find(u => u.id === user.id)) {
          result.includes!.users?.push(user)
        }
      }
    }
  }

  return result
}

export async function getTweets(ids: string) {
  if (!ids) {
    throw new Error('No tweet ids provided.')
  }
  // split ids to chunks of maxFetchSpaceIds
  const idsArray = ids.split(',')
  const chunks = chunk(idsArray, maxFetchTweetIds)
  console.log('tweet ids chunks: ', chunks.length)

  const resultChunks = await Promise.all(chunks.map(chunk => {
    const url = 'https://api.twitter.com/2/tweets?ids=' + chunk.join(',') + '&tweet.fields=referenced_tweets,created_at,public_metrics,note_tweet&expansions=author_id&user.fields=created_at,profile_image_url'
    
    console.log('fetch tweets from twitter api: ' + url)
    return $fetch<TwitterTweetInfo>(url, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token
      },
      async onResponseError({ request, response }) {
        // Log error
        console.error(
          'Fetch twitter api error:',
          request,
          response.status,
          response.body
        )
        throw new Error('Failed to fetch tweets from twitter api.')
      },
    })
  }))
  console.log('tweet resultChunks length: ', resultChunks.length)
  
  const result: TwitterTweetInfo = {
    data: [],
    includes: {
      users: []
    }
  }
  
  for (const [index, resultChunk] of resultChunks.entries()) {
    console.log('tweet resultChunk ' + index)
    result.data?.push(...resultChunk.data!)
    if (resultChunk.includes) {
      for (const user of resultChunk.includes.users) {
        if (!result.includes!.users.find(u => u.id === user.id)) {
          result.includes!.users?.push(user)
        }
      }
    }
  }
  return result
}
