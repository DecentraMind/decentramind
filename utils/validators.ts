import type { TwitterTweetInfo, ValidatedTweetInfo } from '~/types'

export const validateTweetUrl = async (url: string, tweetInfos: TwitterTweetInfo, twitterVouchedIDs: string[], mode: 'add' | 'update') => {
  const matched = url.trim().match(TWEET_URL_REGEXP)

  if (!matched || !matched[1]) {
    throw new Error('Invalid tweet URL: ' + url)
  }
  const id = matched[1]

  if (!tweetInfos || !tweetInfos.data || !tweetInfos.data.length || !tweetInfos.includes) {
    console.error('Error fetching tweets data:', tweetInfos)
    throw new Error('Failed to validate tweet URL: fetch data failed.')
  }

  // console.log('data from twitter = ', tweetInfo)
  if (tweetInfos.errors?.length) {
    const error = tweetInfos.errors[0]
    throw new Error(`Failed to validate tweet URL, twitter api error: ${error.detail}`)
  }

  const tweetData = tweetInfos.data.find(data => data.id === id)
  if (!tweetData) {
    throw new Error('Failed to validate tweet URL: tweet data not found.')
  }
  const author = tweetInfos.includes.users.find(user => user.id === tweetData?.author_id)
  if (!author) {
    throw new Error('Failed to validate tweet URL: author not found.')
  }
  const tweetInfo: ValidatedTweetInfo = {
    data: [tweetData],
    includes: tweetInfos.includes,
  }


  if (mode === 'add') {
    if (!twitterVouchedIDs || !twitterVouchedIDs.length) {
      throw new Error('Twitter vouched IDs are not provided.')
    }
    const author = tweetInfos.includes.users.find(user => user.id === tweetInfo.author_id)
    if (!author || !twitterVouchedIDs.find(id => id === author.username)) {
      // console.log({author, twitterVouchedIDs})
      throw new Error('Invalid tweet URL: the submitter is not the tweet author.')
    }
  }

  return tweetInfo as ValidatedTweetInfo
}