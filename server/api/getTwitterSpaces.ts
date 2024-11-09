import { maxFetchSpaceIds } from '~/utils'
import { getSpaces } from '~/utils/twitter/twitter.server'

export default eventHandler(async (event) => {
  const { spaceIds } = getQuery(event) as { spaceIds?: string }
  console.log('get twitter spaces info, spaceIds = ' + spaceIds)
  
  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  try{
    if (!spaceIds) {
      throw new Error('spaceIds is required')
    }

    // limit to maxFetchTweetIds, otherwise the url will be too long
    const idsArray = spaceIds.split(',')
    if (idsArray.length > maxFetchSpaceIds) {
      throw new Error(`spaceIds should not be more than ${maxFetchSpaceIds}`)
    }

    if (!token) {
      throw new Error('TWITTER_BEARER_TOKEN is not set')
    }

    const data = await getSpaces(spaceIds, token)

    return data
  } catch (error) {
    console.error('get twitter tweets info error = ', error)
    return null
  }
})
