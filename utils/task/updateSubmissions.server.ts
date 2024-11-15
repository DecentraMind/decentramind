import type { ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { SPACE_URL_REGEXP, TWEET_URL_REGEXP } from '~/utils'
import { getInvitesByInviter, getTask, updateInvalidSubmission, saveTweetTaskSubmitInfo } from '~/utils/task'
import { getSpaces, getTweets } from '~/utils/twitter/twitter.server'
import { getSpaceIds, getTweetIds } from '~/utils/twitter/twitter'
import validateTaskData from '~/utils/validateTaskData'
import fs from 'fs'
import { getCommunity } from '~/utils/community/community'

export const updateSubmissions = async(taskPid: string) => {
  if (!taskPid) {
    return { result: 'error', message: 'taskPid is required' }
  }

  const { TWITTER_BEARER_TOKEN: token, WALLET_PATH: walletPath } = process.env
  if (!token) {
    return { result: 'error', message: 'TWITTER_BEARER_TOKEN is not set' }
  }
  if (!walletPath) {
    return { result: 'error', message: 'WALLET_PATH is not set' }
  }
  console.log('token = ', token)

  const task = await getTask(taskPid)
  if (!task) {
    return { result: 'error', message: 'task not found' }
  }
  // console.log('updateSubmissions: task = ', task)

  const walletJson = fs.readFileSync(walletPath, 'utf-8')
  const wallet = JSON.parse(walletJson)

  const submissions = task.submissions// as AllSubmissionWithCalculatedBounties[]
  switch (task.type) {
    case 'space': {
      const spaceIds = submissions.map(s => {
        const matched = s.url.trim().match(SPACE_URL_REGEXP)
        if (!matched || !matched[1]) {
          return false
        }
        return matched[1]
      }).filter(Boolean).join(',')

      const spacesInfo = await getSpaces(spaceIds, token)

      if (!spacesInfo || !spacesInfo.data || !spacesInfo.data.length || !spacesInfo.includes) {
        console.error('Error fetching spaces:', spacesInfo)
        throw new Error('Failed to validate space URL: fetch data failed.')
      }
      const community = await getCommunity(task.communityUuid)
      if (!community) {
        throw new Error('Community not found.')
      }

      await Promise.all(submissions.map(async s => {
        const spaceId = getSpaceIds([s.url])[0]
        const spaceData = spacesInfo.data?.find(si => si.id === spaceId)
        if (!spaceData) {
          return updateInvalidSubmission({
            submissionId: s.id,
            taskPid,
            wallet,
            validateStatus: 'validation_error',
            validateError: 'Space not found from Twitter API.',
          })
        }
        const spaceInfo = {
          data: [spaceData],
          includes: spacesInfo.includes!,
        }
        let validatedSpaceInfo: ValidatedSpacesInfo
        try {
          validatedSpaceInfo = validateTaskData<ValidatedSpacesInfo>({task, data: spaceInfo, mode: 'update', twitterVouchedIDs: []})
        } catch (error) {
          const validateError = error instanceof Error ? error.message : 'Unknown error'
          return updateInvalidSubmission({
            submissionId: s.id,
            taskPid,
            wallet,
            validateStatus: 'invalid',
            validateError,
          })
        }

        // TODO getInvitesByInviters
        const invites = (await getInvitesByInviter(s.address, 'task')).invites

        console.log('saveTweetTaskSubmitInfo, submission ID = ', s.id)
        
        return saveSpaceTaskSubmitInfo({
          wallet,
          submitterAddress: s.address,
          spaceUrl: s.url,
          spaceInfo: validatedSpaceInfo,
          taskPid,
          communityUuid: task.communityUuid,
          communityLogo: community.logo,
          invites,
          mode: 'update',
          submissionId: s.id,
        })
      }))

      break
    }
    case 'promotion':
    case 'bird':
    case 'article': {
      const tweetIds = submissions.map(s => {
        const matched = s.url.trim().match(TWEET_URL_REGEXP)

        if (!matched || !matched[1]) {
          return false
        }
        return matched[1]
      }).filter(Boolean).join(',')

      const tweets = await getTweets(tweetIds, token)

      if (!tweets || !tweets.data || !tweets.data.length || !tweets.includes) {
        console.error('Error fetching tweets:', tweets)
        throw new Error('Failed to validate tweet URL: fetch data failed.')
      }

      await Promise.all(submissions.map(async s => {
        const tweetId = getTweetIds([s.url])[0]
        const tweetData = tweets.data?.find(t => t.id === tweetId)
        if (!tweetData) {
          // console.error('Tweet not found. tweetId = ', tweetId)
          // throw new Error('Tweet not found.')
          // TODO set submission status to validation error
          console.log('Tweet not found, skip. tweetId = ', tweetId)
          return updateInvalidSubmission({
            submissionId: s.id,
            taskPid,
            wallet,
            validateStatus: 'validation_error',
            validateError: 'Tweet not found from Twitter API.',
          })
        }

        const tweetInfo = {
          data: [tweetData],
          includes: tweets.includes!,
        }

        let validatedTweetInfo
        try {
          validatedTweetInfo = validateTaskData<ValidatedTweetInfo>({task, data: tweetInfo, mode: 'update', twitterVouchedIDs: []})
        } catch (error) {
          console.error('Error validating tweet:', error)
          const validateError = error instanceof Error ? error.message
            : (typeof error === 'string' ? error : 'Unknown error' )
          // set submission status to validation error
          return updateInvalidSubmission({
            submissionId: s.id,
            taskPid,
            wallet,
            validateStatus: 'invalid',
            validateError,
          })
        }
        // TODO getInvitesByInviters
        const invites = (await getInvitesByInviter(s.address, 'task')).invites

        console.log('saveTweetTaskSubmitInfo, submission ID = ', s.id)
        console.log('public metrics = ', validatedTweetInfo.data[0].public_metrics)
        // TODO batch update
        return saveTweetTaskSubmitInfo({
          wallet,
          submitterAddress: s.address,
          taskEndTime: task.endTime,
          data: validatedTweetInfo,
          taskPid,
          communityUuid: task.communityUuid,
          invites,
          mode: 'update',
          url: s.url,
          submissionId: s.id,
        })
      }))
      break
    }
    default:
      throw new Error('Invalid task type.')
  }

  return { result: 'success', message: `submissions of task ${taskPid} updated` }
}