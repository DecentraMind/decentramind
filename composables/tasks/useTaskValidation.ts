import type { Task, TaskWithLink, TwitterSpaceInfo, TwitterTweetInfo } from '~/types'
import { useFetch } from '@vueuse/core'
import { TWEET_URL_REGEXP } from '~/utils/constants'

export function useTaskValidation(task: Task, url: string, mode: 'add' | 'update', twitterVouchedIDs?: string[]) {
  const runtimeConfig = useRuntimeConfig()

  const validateTaskData = async <T extends TwitterSpaceInfo | TwitterTweetInfo>(): Promise<T> => {
    switch (task.type) {
      case 'space':
        return await validateSpaceUrl(url) as T
      case 'promotion':
        return await validateTweetPromotionUrl(url) as T
      case 'bird':
        return await validateTweetBirdUrl(url) as T
      case 'article':
        return await validateTweetArticleUrl(url) as T
      default:
        throw new Error('Invalid task type.')
    }
  }

  const validateSpaceUrl = async (url: string) => {
    const matched = url.trim().match(/(?:x|twitter)\.com\/i\/spaces\/([^/]+)\/?/)
  
    if (!matched || !matched[1]) {
      throw new Error('Invalid space URL: ' + url)
    }
    const spaceId = matched[1]
  
    const { data, error } = await useFetch(
      '/api/getTwitterSpace?' + new URLSearchParams({ spaceId }),
    ).json<TwitterSpaceInfo>()
    const spaceInfo = unref(data)
  
    if (error.value || !spaceInfo) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate space URL: fetch data failed.')
    }
  
    console.log('data from twitter = ', spaceInfo)
    type SpaceInfoError = {
      detail: string
      type: string
    }
    if ((spaceInfo as unknown as {errors: SpaceInfoError[]} ).errors?.length) {
      const error = (spaceInfo as unknown as {errors: SpaceInfoError[]}).errors[0]
      throw new Error(`Failed to validate space URL: ${error.detail}`)
    }

    const {
      started_at,
      ended_at,
    } = spaceInfo.data

    if (!ended_at || spaceInfo.data.state !== 'ended') {
      throw new Error(`Invalid space URL: space ${spaceId} has not ended.`)
    }

    const spaceStartAt = new Date(started_at).getTime()
    const spaceEndedAt = new Date(ended_at).getTime()

    if (spaceStartAt < task.createTime && !runtimeConfig.public.debug) {
      throw new Error(`Invalid space URL: space ${spaceId} starts before task is created.`)
    }
  
    const minuteDifference = (spaceEndedAt - spaceStartAt) / (1000 * 60)
    
    if (minuteDifference < 15) {
      throw new Error(`Invalid space URL: space ${spaceId} lasts less than 15 minutes`)
    }
  
    if (mode === 'add') {
      if (!twitterVouchedIDs || !twitterVouchedIDs.length) {
        throw new Error('Twitter vouched IDs are not provided.')
      }
      /** the primary host ID */
      const hostID = spaceInfo.data.creator_id
      const host = spaceInfo.includes.users.find(user => user.id === hostID)
      const hostHandle = host?.username
      
      if (!runtimeConfig.public.debug && (!host || !twitterVouchedIDs.find(id => id === hostHandle))) {
        throw new Error(`Invalid space URL: you are not the primary host of space ${spaceId}.`)
      }
    }
    return spaceInfo
  }

  const validateTweetUrl = async (url: string) => {
    const matched = url.trim().match(TWEET_URL_REGEXP)

    if (!matched || !matched[1]) {
      throw new Error('Invalid promotion URL: ' + url)
    }
    const id = matched[1]
    const { data, error } = await useFetch(
      '/api/getTwitterTweets?' + new URLSearchParams({ ids: id }),
    ).json<TwitterTweetInfo>()
    const tweetInfo = unref(data)

    if (error.value || !tweetInfo) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate promotion URL: fetch data failed.')
    }

    console.log('data from twitter = ', tweetInfo)
    type TweetInfoError = {
      detail: string
      type: string
    }
    if ((tweetInfo as unknown as {errors: TweetInfoError[]} ).errors?.length) {
      const error = (tweetInfo as unknown as {errors: TweetInfoError[]}).errors[0]
      throw new Error('Failed to validate promotion URL: ' + error.detail)
    }

    if (mode === 'add') {
      if (!twitterVouchedIDs || !twitterVouchedIDs.length) {
        throw new Error('Twitter vouched IDs are not provided.')
      }
      const author = tweetInfo.includes.users.find(user => user.id === tweetInfo.data[0].author_id)
      if (!runtimeConfig.public.debug && (!author || !twitterVouchedIDs.find(id => id === author.username))) {
        console.log({author, twitterVouchedIDs})
        throw new Error('Invalid promotion URL: you are not the promotion tweet author.')
      }
    }

    return tweetInfo
  }

  const validateTweetPromotionUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    const tweetId = (task as TaskWithLink).link.match(TWEET_URL_REGEXP)?.[1]
    if (!tweetInfo.data[0].referenced_tweets?.find((tweet) => tweet.type == 'quoted' && tweet.id == tweetId)) {
      console.log({promotionTweetId: tweetId, referencedTweets: tweetInfo.data[0].referenced_tweets})
      throw new Error('Invalid promotion URL: referenced tweet is not the task promotion tweet.')
    }
    
    return tweetInfo
  }

  const validateTweetBirdUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
      throw new Error('Invalid tweet URL: tweet is created before task start time.')
    }
    
    return tweetInfo
  }

  const validateTweetArticleUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
      throw new Error('Invalid tweet URL: article is created before task start time.')
    }
    
    return tweetInfo
  }

  return { validateTaskData }
}