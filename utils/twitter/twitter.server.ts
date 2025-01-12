import type { TwitterSpacesInfo, TwitterTweetInfo } from '~/types'
import { maxFetchSpaceIds, maxFetchTweetIds } from '~/utils/constants'
import { chunk, uniq } from 'lodash-es'

const { TWITTER_BEARER_TOKEN: token } = process.env
if (!token) throw new Error('Twitter token not configured')

/**
 * Get space or tweet ids from a map of task pid to space ids
 * @param ids - a map of task pid to space/tweet ids
 * @returns a map of task pid to space/tweet info
 */
export async function getByPid2IdsMap<T extends TwitterSpacesInfo | TwitterTweetInfo>(
  ids: Record<string, string[]>,
  getInfo: (_: string) => Promise<T>
) {
  const idsArray = uniq(Object.values(ids).flat())
  if (!idsArray.length) {
    return {}
  }

  const result = await getInfo(idsArray.join(','))
  const resultMap: Record<string, T> = Object.keys(ids).reduce((acc, taskPid) => {
    acc[taskPid] = {data: [], includes: result.includes, errors: []} as unknown as T
    return acc
  }, {} as Record<string, T>)

  if (!result || !result.data || !result.data.length) {
    if (result.errors) {
      console.warn('Failed to fetch space or tweet info: ', { ids, result, errors: result.errors })
      for (const error of result.errors) {
        const taskPid = Object.keys(ids).find(taskPid => ids[taskPid].includes(error.resource_id))
        if (taskPid) {
          resultMap[taskPid].errors?.push(error)
        }
      }
      return resultMap
    }
    throw new Error('Failed to fetch space or tweet info.')
  }

  for (const data of result.data) {
    // put data to resultMap
    const spaceOrTweetId = data.id
    const taskPid = Object.keys(ids).find(taskPid => ids[taskPid].includes(spaceOrTweetId))
    if (taskPid) {
      resultMap[taskPid] = resultMap[taskPid] || {data: [], includes: {users: []}, errors: []}
      resultMap[taskPid].data!.push(data as any)

      if (result.errors) {
        const relatedError = result.errors.find(e => e.resource_id === spaceOrTweetId)
        if (relatedError) {
          console.info('relatedError insert to resultMap[', taskPid, ']: ', relatedError)
          resultMap[taskPid].errors?.push(relatedError)
        }
      }
    } else {
      console.warn('No pid found for space or tweet id: ', spaceOrTweetId)
    }
  }
  return resultMap
}

/**
 * Get spaces info from Twitter API
 * @param ids - a string or an array of space ids
 * @returns spaces info
 */
export async function getSpaces(ids: string | string[]) {
  // split ids to chunks
  const idsArray = Array.isArray(ids) ? ids : ids.split(',')

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
    },
    errors: []
  }
  for (const [index, resultChunk] of resultChunks.entries()) {
    if (!resultChunk.data || !resultChunk.data.length) {
      if (resultChunk.errors) {
        const error = resultChunk.errors[0].detail
        console.warn('Failed to fetch space info from twitter api: ', { ids, error })
        result.errors?.push(...resultChunk.errors)
      }
      continue
    }

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

/**
 * Get tweets info from Twitter API
 * @param ids - a string or an array of tweet ids
 * @returns tweets info
 */
export async function getTweets(ids: string | string[]) {
  // split ids to chunks
  const idsArray = Array.isArray(ids) ? ids : ids.split(',')
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
    },
    errors: []
  }
  
  for (const [index, resultChunk] of resultChunks.entries()) {
    console.log('tweet resultChunk ' + index)
    // console.log('resultChunk: ', resultChunk)

    // TODO: handle error
    // error example resultChunk: 
    // {
    //   errors: [
    //     {
    //       resource_id: '1872811641529852176',
    //       parameter: 'ids',
    //       resource_type: 'tweet',
    //       section: 'data',
    //       title: 'Authorization Error',
    //       value: '1872811641529852176',
    //       detail: 'Sorry, you are not authorized to see the Tweet with ids: [1872811641529852176].',
    //       type: 'https://api.twitter.com/2/problems/not-authorized-for-resource'
    //     }
    //   ]
    // }
    if (!resultChunk.data || !resultChunk.data.length) {
      if (resultChunk.errors) {
        const error = resultChunk.errors[0].detail
        console.warn('Twitter api results contains error: ', { ids, error })
        result.errors!.push(...resultChunk.errors)
      }
      continue
    }
    
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
