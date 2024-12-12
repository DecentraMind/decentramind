import type { Task, TwitterSpacesInfo, TwitterTweetInfo, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { getInvitesByInviter, updateInvalidSubmission, saveTweetTaskSubmitInfo } from '~/utils/task'
import { getSpaceIds, getTweetIds } from '~/utils/twitter/twitter'
import validateTaskData from '~/utils/validateTaskData'
import fs from 'fs'
import { getCommunity } from '~/utils/community/community'

export const updateSubmissions = async(task: Task, data: TwitterSpacesInfo | TwitterTweetInfo) => {
  const taskPid = task.processID

  const { TWITTER_BEARER_TOKEN: token, WALLET_PATH: walletPath } = process.env
  if (!token) {
    return { result: 'error', message: 'TWITTER_BEARER_TOKEN is not set' }
  }
  if (!walletPath) {
    return { result: 'error', message: 'WALLET_PATH is not set' }
  }

  // console.log('updateSubmissions: task = ', task)

  const walletJson = fs.readFileSync(walletPath, 'utf-8')
  const wallet = JSON.parse(walletJson)

  const submissions = task.submissions// as AllSubmissionWithCalculatedBounties[]
  if (submissions.length <= 0) {
    return { result: 'success', message: 'no submissions, no data to update.' }
  }

  switch (task.type) {
    case 'space': {

      const spacesInfo = data as TwitterSpacesInfo

      const community = await getCommunity(task.communityUuid)
      if (!community) {
        throw new Error('Community not found.')
      }

      await Promise.all(submissions.map(async s => {
        const spaceId = getSpaceIds([s.url])[0]
        const spaceData = spacesInfo.data?.find(si => si.id === spaceId)
        if (!spaceData) {
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error') {
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'validation_error',
              validateError: 'Space not found from Twitter API.',
            })
          }
          return
        }
        const spaceInfo = {
          data: [spaceData],
          includes: spacesInfo.includes!,
        }
        let validatedSpaceInfo: ValidatedSpacesInfo
        try {
          validatedSpaceInfo = validateTaskData<ValidatedSpacesInfo>({
            task,
            data: spaceInfo,
            mode: 'update',
            twitterVouchedIDs: [],
            communityName: community.name,
          })
        } catch (error) {
          console.error('Error validating submission:', error)
          const validateError = error instanceof Error ? error.message
            : (typeof error === 'string' ? error : 'Unknown error.' )
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error' || s.validateStatus == 'invalid') {
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'invalid',
              validateError,
            })
          }
        }

        try {
          // TODO getInvitesByInviters
          const invites = (await getInvitesByInviter(s.address, 'task')).invites

          console.log('saveTweetTaskSubmitInfo, submission ID = ', s.id)
          
          return saveSpaceTaskSubmitInfo({
            wallet,
            submitterAddress: s.address,
            spaceInfo: validatedSpaceInfo!,
            taskPid,
            communityUuid: task.communityUuid,
            communityLogo: community.logo,
            invites,
            submissionId: s.id,
            validateStatus: s.validateStatus == 'waiting_for_validation' 
              ? 'validated' : 'revalidated',
          })
        } catch (error) {
          const validateError = error instanceof Error ? error.message : 'Unknown error'
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error') {
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'validation_error',
              validateError,
            })
          }
        }
      }))

      break
    }
    case 'promotion':
    case 'bird':
    case 'article': {
      const tweets = data as TwitterTweetInfo
      if (!tweets || !tweets.data || !tweets.data.length || !tweets.includes) {
        console.error('Error fetching tweets:', tweets)
        throw new Error('Failed to validate tweet URL: fetch data failed.')
      }

      const community = await getCommunity(task.communityUuid)
      if (!community) {
        throw new Error('Community not found.')
      }

      await Promise.all(submissions.map(async s => {
        const tweetId = getTweetIds([s.url])[0]
        const tweetData = tweets.data?.find(t => t.id === tweetId)
        if (!tweetData) {
          // console.error('Tweet not found. tweetId = ', tweetId)
          // throw new Error('Tweet not found.')
          console.log('Tweet not found, skip. tweetId = ', tweetId)
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error') {
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'validation_error',
              validateError: 'Tweet not found from Twitter API.',
            })
          }
          return
        }

        const tweetInfo = {
          data: [tweetData],
          includes: tweets.includes!,
        }

        let validatedTweetInfo
        try {
          validatedTweetInfo = validateTaskData<ValidatedTweetInfo>({
            task, data: tweetInfo, mode: 'update', twitterVouchedIDs: [], communityName: community.name,
          })
        } catch (error) {
          console.error('Error validating tweet:', error)
          const validateError = error instanceof Error ? error.message
            : (typeof error === 'string' ? error : 'Unknown error' )
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error' || s.validateStatus == 'invalid') {
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'invalid',
              validateError,
            })
          }
        }

        try {
          // TODO getInvitesByInviters
          const invites = (await getInvitesByInviter(s.address, 'task')).invites

          console.log('saveTweetTaskSubmitInfo, submission ID = ', s.id)
          console.log('public metrics = ', validatedTweetInfo!.data[0].public_metrics)
          // TODO batch update
          return saveTweetTaskSubmitInfo({
            wallet,
            submitterAddress: s.address,
            taskEndTime: task.endTime,
            data: validatedTweetInfo!,
            taskPid,
            communityUuid: task.communityUuid,
            invites,
            submissionId: s.id,
            validateStatus: s.validateStatus == 'waiting_for_validation' 
              ? 'validated' : 'revalidated',
          })
        } catch (error) {
          console.error('Error update submission:', error)
          const validateError = error instanceof Error ? error.message
            : (typeof error === 'string' ? error : 'Unknown error' )
          if (s.validateStatus == 'waiting_for_validation' || s.validateStatus == 'validation_error') {
            // set submission status to validation error
            return updateInvalidSubmission({
              submissionId: s.id,
              taskPid,
              wallet,
              validateStatus: 'validation_error',
              validateError,
            })
          }
        }
      }))
      break
    }
    default:
      throw new Error('Invalid task type.')
  }

  return { result: 'success', message: `submissions of task ${taskPid} updated` }
}