import { useFetch } from '@vueuse/core'
import type { TwitterSpacesInfo, TwitterTweetInfo, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { getSpaceIds, getTweetIds } from './twitter'
import { API_URL_BASE } from '~/utils/constants'

export async function fetchSpacesInfo(urls: string[]): Promise<ValidatedSpacesInfo> {
  const ids = getSpaceIds(urls)
  const { data, error } = await useFetch(
    API_URL_BASE + '/api/getTwitterSpaces?' + new URLSearchParams({ ids: ids.join(',') }),
  ).json<TwitterSpacesInfo>()
  const spaceInfo = unref(data)

  if (error.value || !spaceInfo || !spaceInfo.data || !spaceInfo.includes) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to validate space URL: fetch data failed.')
  }

  // console.log('data from twitter = ', spaceInfo)
  if (spaceInfo.errors?.length) {
    const error = spaceInfo.errors[0]
    throw new Error(`Failed to validate space URL, twitter api error: ${error.detail}`)
  }

  return spaceInfo as ValidatedSpacesInfo
}


export async function fetchTweetInfo(urls: string[]): Promise<ValidatedTweetInfo> {
  const ids = getTweetIds(urls)
  const { data, error } = await useFetch(
    API_URL_BASE + '/api/getTwitterTweets?' + new URLSearchParams({ ids: ids.join(',') }),
  ).json<TwitterTweetInfo>()
  const tweetInfo = unref(data)

  if (error.value || !tweetInfo || !tweetInfo.data || !tweetInfo.data.length || !tweetInfo.includes) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to validate tweet URL: fetch data failed.' + JSON.stringify(tweetInfo))
  }

  // console.log('data from twitter = ', tweetInfo)
  if (tweetInfo.errors?.length) {
    const error = tweetInfo.errors[0]
    throw new Error(`Failed to validate tweet URL, twitter api error: ${error.detail}`)
  }

  return tweetInfo as ValidatedTweetInfo
}