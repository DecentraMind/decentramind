import type { Task, TaskWithLink, TwitterSpaceInfo, TwitterTweetInfo, ValidatedSpaceInfo, ValidatedTweetInfo } from '~/types'
import { useFetch } from '@vueuse/core'
import { minSpaceLiveLength, minBirdTweetTextLength, minArticleTextLength, TWEET_URL_REGEXP } from '~/utils/constants'

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
  
    if (error.value || !spaceInfo || !spaceInfo.data || !spaceInfo.includes) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate space URL: fetch data failed.')
    }
  
    // console.log('data from twitter = ', spaceInfo)
    if (spaceInfo.errors?.length) {
      const error = spaceInfo.errors[0]
      throw new Error(`Failed to validate space URL, twitter api error: ${error.detail}`)
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
    
    if (minuteDifference < minSpaceLiveLength) {
      throw new Error(`Invalid space URL: space ${spaceId} lasts less than ${minSpaceLiveLength} minutes`)
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
        throw new Error(`Invalid space URL: the submitter is not the primary host of space ${spaceId}.`)
      }
    }
    return spaceInfo as ValidatedSpaceInfo
  }

  const validateTweetUrl = async (url: string) => {
    const matched = url.trim().match(TWEET_URL_REGEXP)

    if (!matched || !matched[1]) {
      throw new Error('Invalid tweet URL: ' + url)
    }
    const id = matched[1]
    const { data, error } = await useFetch(
      '/api/getTwitterTweets?' + new URLSearchParams({ ids: id }),
    ).json<TwitterTweetInfo>()
    const tweetInfo = unref(data)

    if (error.value || !tweetInfo || !tweetInfo.data || !tweetInfo.data.length || !tweetInfo.includes) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate tweet URL: fetch data failed.')
    }

    // console.log('data from twitter = ', tweetInfo)
    if (tweetInfo.errors?.length) {
      const error = tweetInfo.errors[0]
      throw new Error(`Failed to validate tweet URL, twitter api error: ${error.detail}`)
    }

    if (mode === 'add') {
      if (!twitterVouchedIDs || !twitterVouchedIDs.length) {
        throw new Error('Twitter vouched IDs are not provided.')
      }
      const author = tweetInfo.includes.users.find(user => user.id === tweetInfo.data![0].author_id)
      if (!runtimeConfig.public.debug && (!author || !twitterVouchedIDs.find(id => id === author.username))) {
        // console.log({author, twitterVouchedIDs})
        throw new Error('Invalid tweet URL: the submitter is not the tweet author.')
      }
    }

    return tweetInfo as ValidatedTweetInfo
  }

  const validateTweetPromotionUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    const tweetId = (task as TaskWithLink).link.match(TWEET_URL_REGEXP)?.[1]
    if (!tweetInfo.data![0].referenced_tweets?.find((tweet) => tweet.type == 'quoted' && tweet.id == tweetId)) {
      // console.log({promotionTweetId: tweetId, referencedTweets: tweetInfo.data[0].referenced_tweets})
      throw new Error('Invalid promotion URL: referenced tweet is not the task promotion tweet.')
    }
    
    return tweetInfo
  }

  const validateTweetBirdUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    if (tweetInfo.data[0].article) {
      throw new Error('Invalid tweet URL: article is not supported for bird quest.')
    }

    if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
      throw new Error('Invalid tweet URL: tweet is created before task start time.')
    }

    if (wordCount(tweetInfo.data[0].text) < minBirdTweetTextLength) {
      throw new Error(`Invalid tweet URL: tweet text length is less than ${minBirdTweetTextLength}.`)
    }
    
    return tweetInfo
  }

  const validateTweetArticleUrl = async (url: string) => {
    const tweetInfo = await validateTweetUrl(url)

    if (tweetInfo.data[0].article) {
      throw new Error('Invalid tweet URL: article is not supported for good read quest.')
    }

    if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
      throw new Error('Invalid tweet URL: article is created before task start time.')
    }

    if (wordCount(tweetInfo.data[0].note_tweet?.text ?? '') < minArticleTextLength) {
      throw new Error(`Invalid tweet URL: article text length is less than ${minArticleTextLength}.`)
    }
    
    return tweetInfo
  }

  return { validateTaskData }
}