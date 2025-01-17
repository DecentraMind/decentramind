import type { TaskValidationParams, TaskWithLink, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { minSpaceLiveLength, minBirdTweetTextLength, minArticleTextLength, TWEET_URL_REGEXP } from '~/utils/constants'
import { wordCount } from '~/utils/string'

const validateSpaceData = ({ task, data: spaceInfo, mode, twitterVouchedIDs }: TaskValidationParams<ValidatedSpacesInfo>) => {
  if (!spaceInfo) {
    throw new Error('Invalid space URL: space info is not provided.')
  }

  const {
    started_at,
    ended_at,
    id: spaceId
  } = spaceInfo.data[0]

  if (!ended_at || spaceInfo.data[0].state !== 'ended') {
    throw new Error(`Invalid space URL: space ${spaceId} has not ended.`)
  }

  const spaceStartAt = new Date(started_at).getTime()
  const spaceEndedAt = new Date(ended_at).getTime()

  if (spaceStartAt < task.createTime) {
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
    const hostID = spaceInfo.data[0].creator_id
    const host = spaceInfo.includes.users.find(user => user.id === hostID)
    const hostHandle = host?.username

    if (!host || !twitterVouchedIDs.find(id => id === hostHandle)) {
      throw new Error(`Invalid space URL: the submitter is not the primary host of space ${spaceId}.`)
    }
  }
  return spaceInfo as ValidatedSpacesInfo
}

const validateTweetData = ({ data: tweetInfo, mode, twitterVouchedIDs }: TaskValidationParams<ValidatedTweetInfo>) => {
  if (!tweetInfo) {
    throw new Error('Invalid tweet URL: tweet info is not provided.')
  }
  if (mode === 'add') {
    if (!twitterVouchedIDs || !twitterVouchedIDs.length) {
      throw new Error('Twitter vouched IDs are not provided.')
    }
    const author = tweetInfo.includes.users.find(user => user.id === tweetInfo.data![0].author_id)
    if (!author || !twitterVouchedIDs.find(id => id === author.username)) {
      // console.log({author, twitterVouchedIDs})
      throw new Error('Invalid tweet URL: the submitter is not the tweet author.')
    }
  }

  return tweetInfo as ValidatedTweetInfo
}

const validateTweetPromotionData = ({ task, data, mode, twitterVouchedIDs, communityName }: TaskValidationParams<ValidatedTweetInfo>) => {
  const tweetInfo = validateTweetData({ task, data, mode, twitterVouchedIDs, communityName })

  // check if tweet created before task start time
  if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
    throw new Error('Invalid promotion URL: tweet is created before task start time.')
  }

  const tweetId = (task as TaskWithLink).link.match(TWEET_URL_REGEXP)?.[1]
  if (!tweetInfo.data![0].referenced_tweets?.find((tweet) => tweet.type == 'quoted' && tweet.id == tweetId)) {
    // console.log({promotionTweetId: tweetId, referencedTweets: tweetInfo.data[0].referenced_tweets})
    throw new Error('Invalid promotion URL: referenced tweet is not the task promotion tweet.')
  }

  return tweetInfo
}

const validateTweetBirdData = ({ task, data, mode, twitterVouchedIDs, communityName }: TaskValidationParams<ValidatedTweetInfo>) => {
  const tweetInfo = validateTweetData({ task, data, mode, twitterVouchedIDs, communityName })

  if (tweetInfo.data[0].article) {
    throw new Error('Invalid tweet URL: article is not supported for bird quest.')
  }

  if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
    throw new Error('Invalid tweet URL: tweet is created before task start time.')
  }

  if (wordCount(tweetInfo.data[0].text) < minBirdTweetTextLength) {
    throw new Error(`Invalid tweet URL: tweet text length is less than ${minBirdTweetTextLength}.`)
  }

  // disable this for now, beacua twitter api returned text will transform invite link into t.co link
  // if (!tweetInfo.data[0].text.toLowerCase().includes('decentramind.club/i/')) {
  //   console.log({ tweetInfo: JSON.stringify(tweetInfo) })
  //   throw new Error('Invalid tweet URL: tweet text does not include invite link.')
  // }

  // if (!tweetInfo.data[0].text.toLowerCase().includes(communityName.toLowerCase())) {
  //   throw new Error(`Invalid tweet URL: tweet text does not include community name ${communityName}.`)
  // }

  return tweetInfo
}

const validateTweetArticleData = ({ task, data, mode, twitterVouchedIDs, communityName }: TaskValidationParams<ValidatedTweetInfo>) => {
  const tweetInfo = validateTweetData({ task, data, mode, twitterVouchedIDs, communityName })

  if (tweetInfo.data[0].article) {
    throw new Error('Invalid tweet URL: article is not supported for good read quest.')
  }

  if (new Date(tweetInfo.data[0].created_at).getTime() < task.startTime) {
    throw new Error('Invalid tweet URL: article is created before task start time.')
  }

  if (wordCount(tweetInfo.data[0].note_tweet?.text ?? '') < minArticleTextLength) {
    throw new Error(`Invalid tweet URL: article text length is less than ${minArticleTextLength}.`)
  }

  // disable this for now, beacua twitter api returned text will transform invite link into t.co link
  // if (!tweetInfo.data[0].note_tweet?.text?.toLowerCase().includes('decentramind.club/i/')) {
  //   throw new Error('Invalid tweet URL: article text does not include invite link.')
  // }

  // if (!tweetInfo.data[0].note_tweet?.text?.toLowerCase().includes(communityName.toLowerCase())) {
  //   throw new Error(`Invalid tweet URL: article text does not include community name ${communityName}.`)
  // }

  return tweetInfo
}

/**
 * validate twitter space or tweet data
 * @param params - task validation parameters
 * @returns validated task data if validation passed, otherwise throw error
 */
export default function validateTaskData<T extends ValidatedSpacesInfo | ValidatedTweetInfo>(params: TaskValidationParams<T>) {
  switch (params.task.type) {
    case 'space':
      return validateSpaceData(params as TaskValidationParams<ValidatedSpacesInfo>) as T
    case 'promotion':
      return validateTweetPromotionData(params as TaskValidationParams<ValidatedTweetInfo>) as T
    case 'bird':
      return validateTweetBirdData(params as TaskValidationParams<ValidatedTweetInfo>) as T
    case 'article':
      return validateTweetArticleData(params as TaskValidationParams<ValidatedTweetInfo>) as T
    default:
      throw new Error('Invalid task type.')
  }
}