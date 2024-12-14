import type {
  Task,
  ValidatedSpacesInfo,
  ValidatedTweetInfo,
  SubmissionValidateStatus,
  SpaceSubmission,
  TweetSubmission
} from '~/types'
import {
  getInvitesByInviter,
  saveTweetTaskSubmitInfo,
  saveSpaceTaskSubmitInfo,
  updateInvalidSubmission
} from '~/utils/task'
import { getSpaceIds, getTweetIds } from '~/utils/twitter/twitter'
import validateTaskData from '~/utils/validateTaskData'
import fs from 'fs'
import { getCommunity } from '~/utils/community/community'

// Common validation logic for both spaces and tweets
const validateSubmissionData = <T extends ValidatedSpacesInfo | ValidatedTweetInfo>(
  task: Task,
  data: T,
  contentId: string,
  communityName: string
) => {
  const xData = task.type === 'space'
    ? (data as ValidatedSpacesInfo).data?.find(s => s.id === contentId)
    : (data as ValidatedTweetInfo).data?.find(t => t.id === contentId)

  if (task.type === 'space') {
    // Prepare data for validation
    const spaceOrTweetData: ValidatedSpacesInfo = {
      data: [xData as ValidatedSpacesInfo['data'][0]],
      includes: data.includes!
    }
    return validateTaskData<ValidatedSpacesInfo>({
      task,
      data: spaceOrTweetData,
      mode: 'update',
      twitterVouchedIDs: [],
      communityName,
    })
  } else {
    // Prepare data for validation
    const spaceOrTweetData: ValidatedTweetInfo = {
      data: [xData as ValidatedTweetInfo['data'][0]],
      includes: data.includes!
    }
    return validateTaskData<ValidatedTweetInfo>({
      task,
      data: spaceOrTweetData,
      mode: 'update',
      twitterVouchedIDs: [],
      communityName,
    })
  }
}

// Save validated submission data
const saveValidatedSubmission = async <T extends ValidatedSpacesInfo | ValidatedTweetInfo>(
  submission: SpaceSubmission | TweetSubmission,
  validatedData: T,
  task: Task,
  wallet: any,
  communityLogo: string
) => {
  const invites = (await getInvitesByInviter(submission.address, 'task')).invites
  const validateStatus: SubmissionValidateStatus = submission.validateStatus === 'waiting_for_validation'
    ? 'validated'
    : 'revalidated'

  const saveParams = {
    taskPid: task.processID,
    submissionId: submission.id,
    submitterAddress: submission.address,
    communityUuid: task.communityUuid,
    wallet,
    invites,
    validateStatus,
  }

  if (task.type === 'space') {
    return saveSpaceTaskSubmitInfo({
      ...saveParams,
      spaceInfo: validatedData as ValidatedSpacesInfo,
      communityLogo,
    })
  } else {
    return saveTweetTaskSubmitInfo({
      ...saveParams,
      taskEndTime: task.endTime,
      data: validatedData as ValidatedTweetInfo,
    })
  }
}

export const updateSubmissions = async (task: Task, data: ValidatedSpacesInfo | ValidatedTweetInfo) => {
  // Validate environment
  const { TWITTER_BEARER_TOKEN: token, WALLET_PATH: walletPath } = process.env
  if (!token) return { result: 'error', message: 'TWITTER_BEARER_TOKEN is not set' }
  if (!walletPath) return { result: 'error', message: 'WALLET_PATH is not set' }

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))
  const submissions = task.submissions
  if (submissions.length <= 0) {
    return { result: 'success', message: 'no submissions, no data to update.' }
  }

  const community = await getCommunity(task.communityUuid)
  if (!community) throw new Error('Community not found.')

  await Promise.all(submissions.map(async submission => {
    try {
      // Get content ID and data based on task type
      const contentId = task.type === 'space'
        ? getSpaceIds([submission.url])[0]
        : getTweetIds([submission.url])[0]

      const xData = task.type === 'space'
        ? (data as ValidatedSpacesInfo).data?.find(s => s.id === contentId)
        : (data as ValidatedTweetInfo).data?.find(t => t.id === contentId)

      if (!xData) {
        if (submission.validateStatus == 'waiting_for_validation' || submission.validateStatus == 'validation_error') {
          return updateInvalidSubmission({
            submissionId: submission.id,
            taskPid: task.processID,
            wallet,
            validateStatus: 'validation_error',
            validateError: `${task.type === 'space' ? 'Space' : 'Tweet'} not found from Twitter API.`
          })
        }
        return
      }

      let validatedData: ValidatedSpacesInfo | ValidatedTweetInfo
      try{
        validatedData = validateSubmissionData(task, data, contentId, community.name)
      } catch (error) {
        console.error('Error validating submission:', error)
        const validateError = error instanceof Error ? error.message
          : (typeof error === 'string' ? error : 'Unknown error.' )
        if (submission.validateStatus == 'waiting_for_validation' || submission.validateStatus == 'validation_error' || submission.validateStatus == 'invalid') {
          return updateInvalidSubmission({
            submissionId: submission.id,
            taskPid: task.processID,
            wallet,
            validateStatus: 'invalid',
            validateError,
          })
        }
        return
      }

      if (validatedData) {
        await saveValidatedSubmission(submission, validatedData, task, wallet, community.logo)
      }

    } catch (error) {
      const validateError = error instanceof Error ? error.message : 'Unknown error'
      await updateInvalidSubmission({
        submissionId: submission.id,
        taskPid: task.processID,
        wallet,
        validateStatus: 'validation_error',
        validateError
      })
    }
  }))

  return {
    result: 'success',
    message: `submissions of task ${task.processID} updated`
  }
}