import { maxFetchTweetIds } from '~/utils'
import { getTweets } from '~/utils/twitter/twitter.server'

export default eventHandler(async (event) => {
  const { ids } = getQuery(event) as { ids?: string }
  console.log('get twitter tweets info, ids = ' + ids)
  
  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  try{
    if (!ids) {
      throw new Error('ids is required')
    }

    // limit to maxFetchTweetIds, otherwise the url will be too long
    const idsArray = ids.split(',')
    if (idsArray.length > maxFetchTweetIds) {
      throw new Error(`ids should not be more than ${maxFetchTweetIds}`)
    }

    if (!token) {
      throw new Error('TWITTER_BEARER_TOKEN is not set')
    }

    const data = await getTweets(ids, token)

    return data
  } catch (error) {
    console.error('get twitter tweets info error = ', error)
    return null
  }
})