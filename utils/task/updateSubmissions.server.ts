import type {
  Task,
  ValidatedSpacesInfo,
  ValidatedTweetInfo,
  SubmissionValidateStatus,
  SpaceSubmission,
  TweetSubmission,
  InviteCodeInfo,
  Submission,
  TwitterError
} from '~/types'
import {
  getInvitesByInviter,
  updateInvalidSubmission,
  updateSubmission
} from '~/utils/task'
import { getSpaceIds, getTweetIds } from '~/utils/twitter/twitter'
import validateTaskData from '~/utils/validateTaskData'
import fs from 'fs'
import { getCommunity } from '~/utils/community/community'
import { compareImages } from '~/utils/image.server'
import { gateways, arUrl } from '~/utils/arAssets'
import { wordCount } from '~/utils/string'
import { delay } from '~/utils/util'
import type { Wallet } from '~/utils/ao'
import { minSSIM } from '~/utils/constants'

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
  const invites = (await getInvitesByInviter({inviter: submission.address, type: 'task'})).invites
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

/**
 * update all *not invalid* submissions of a task
 */
export const updateSubmissions = async <T extends ValidatedSpacesInfo | ValidatedTweetInfo>(
  task: Task,
  data: T,
  errors?: TwitterError[]
) => {
  // Validate environment
  const { TWITTER_BEARER_TOKEN: token, WALLET_PATH: walletPath } = process.env
  if (!token) return { result: 'error', message: 'TWITTER_BEARER_TOKEN is not set' }
  if (!walletPath) return { result: 'error', message: 'WALLET_PATH is not set' }

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))

  // filter out invalid submissions
  const submissions = task.submissions.filter(submission => submission.validateStatus !== 'invalid')
  if (submissions.length <= 0) {
    return { result: 'success', message: 'no submissions, no data to update.' }
  }

  const community = await getCommunity(task.communityUuid)
  if (!community) throw new Error('Community not found.')

  // 使用顺序调用替代并发 Promise.all
  for (const submission of submissions) {
    try {
      // Get content ID and data based on task type
      const contentId = task.type === 'space'
        ? getSpaceIds([submission.url])[0]
        : getTweetIds([submission.url])[0]

      const xData = task.type === 'space'
        ? (data as ValidatedSpacesInfo).data?.find(s => s.id === contentId)
        : (data as ValidatedTweetInfo).data?.find(t => t.id === contentId)
      const relatedError = errors?.find(e => e.resource_id === contentId)

      if (!xData) {
        if (submission.validateStatus == 'waiting_for_validation' || submission.validateStatus == 'validation_error') {
          if (relatedError && relatedError.title === 'Not Found Error') {
            // this tweet or space is deleted by Twitter or not publicly available
            await updateInvalidSubmission({
              submissionId: submission.id,
              taskPid: task.processID,
              wallet,
              validateStatus: 'invalid',
              validateError: relatedError.detail
            })
          } else {
            await updateInvalidSubmission({
              submissionId: submission.id,
              taskPid: task.processID,
              wallet,
              validateStatus: 'validation_error',
              validateError: `${task.type === 'space' ? 'Space' : 'Tweet'} not found from Twitter API.`
            })
          }
        }
        continue
      }

      let validatedData: ValidatedSpacesInfo | ValidatedTweetInfo
      try{
        validatedData = validateSubmissionData(task, data, contentId, community.name)
      } catch (error) {
        console.warn(`Error validating submission ${submission.id} task ${task.processID}:`, error)
        const validateError = error instanceof Error ? error.message
          : (typeof error === 'string' ? error : 'Unknown error.' )
        if (submission.validateStatus == 'waiting_for_validation' || submission.validateStatus == 'validation_error' || submission.validateStatus == 'invalid' || submission.validateStatus == undefined) {
          await updateInvalidSubmission({
            submissionId: submission.id,
            taskPid: task.processID,
            wallet,
            validateStatus: 'invalid',
            validateError,
          })
        }
        continue
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
    
    // add 1 second delay after each submission processing to prevent AO calculation unit overload
    await delay(1000)
  }

  return {
    result: 'success',
    message: `submissions of task ${task.processID} updated`
  }
}

type SaveSpaceTaskSubmitInfoParams = {
  taskPid: string
  submissionId: number
  submitterAddress: string
  spaceInfo: ValidatedSpacesInfo
  communityUuid: string
  communityLogo: string
  invites: InviteCodeInfo[]
  wallet?: Wallet
  validateStatus: Submission['validateStatus']
  validateError?: string
}

/**
 * update space task submission, only for server side validation(trigger by cron job or task owner)
 */
export const saveSpaceTaskSubmitInfo = async function ({
  taskPid,
  submissionId,
  submitterAddress,
  spaceInfo,
  communityUuid,
  communityLogo,
  invites,
  wallet,
  validateStatus,
  validateError
}: SaveSpaceTaskSubmitInfoParams) {
  const {
    ended_at,
    participant_count: participantCount,
  } = spaceInfo.data[0]

  if (!ended_at) {
    throw new Error('Invalid space URL: space has not ended.')
  }

  const spaceEndedAt = new Date(ended_at).getTime()
  const validJoinStartAt = new Date(
    spaceEndedAt - 24 * 60 * 60 * 1000,
  ).getTime()

  const hostID = spaceInfo.data[0].creator_id
  console.log('spaceInfo', spaceInfo)
  const host = spaceInfo.includes.users.find(user => user.id === hostID)
  if (!host) {
    throw new Error('Failed to get space host avatar.')
  }

  // avatar of space host
  // e.g. https://pbs.twimg.com/profile_images/1879741694465454080/468EsS2u_normal.png
  // e.g. https://pbs.twimg.com/profile_images/1881670048193945600/H-FWznAE_normal.jpg
  const userAvatar = host.profile_image_url.replace(/_(normal|bigger|mini)(\.[^.]+)$/, '$2')
  
  const ssim = userAvatar
    ? await compareImages(arUrl(communityLogo, gateways.ario), userAvatar)
    : 0
  // console.log({ ssim, communityLogo: arUrl(communityInfo.logo, gateways.ario), twitterUserAvatar: userAvatar})
  
  // 品牌效应
  const brandEffect = ssim && ssim >= minSSIM ? 10 : 0
  // 听众
  const audience = participantCount
  // 邀请人数
  const inviteCount = invites.filter(inviteInfo => {
    return (
      inviteInfo.inviterAddress === submitterAddress &&
      inviteInfo.communityUuid === communityUuid &&
      inviteInfo.type === 'task' &&
      inviteInfo.taskPid === taskPid
    )
  }).reduce((total, inviteInfo) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validInvitees = Object.entries<{ joinTime: number }>(inviteInfo.invitees).filter(([_, invitee]) => {
      const { joinTime } = invitee
      return joinTime < spaceEndedAt && joinTime > validJoinStartAt
    })
    total += validInvitees.length
    return total
  }, 0)

  if (!submissionId) {
    throw new Error('Submission ID is required')
  }

  if (validateStatus === 'validated') {
    // from 'waiting_for_validation' to 'validated'
    const spaceSubmission:Omit<SpaceSubmission, 'url'|'createTime'|'updateTime'|'score'|'taskPid'|'address'> = {
      id: submissionId,
      inviteCount,
      audience,
      brandEffect,
      validateStatus,
      validateTime: new Date().getTime()
    }
    await updateSubmission(spaceSubmission, taskPid, wallet)
  } else if (validateStatus === 'revalidated') {
    // from 'validated' to 'revalidated'
    const spaceSubmission:Omit<SpaceSubmission, 'url'|'createTime'|'brandEffect'|'audience'|'score'|'taskPid'|'address'|'updateTime'> = {
      id: submissionId,
      inviteCount,
      validateStatus,
      validateTime: new Date().getTime()
    }
    if (validateError) {
      spaceSubmission.validateError = validateError
    }
    
    await updateSubmission(spaceSubmission, taskPid, wallet)
  } else if (validateStatus === 'invalid' || validateStatus === 'validation_error') {
    // from 'waiting_for_validation' to 'invalid' or 'validation_error'
    await updateInvalidSubmission({submissionId, taskPid, wallet, validateStatus, validateError})
  } else {
    throw new Error('Invalid validate status')
  }
}

type SaveTweetTaskSubmitInfoParams = {
  taskPid: string,
  submissionId: number,
  submitterAddress: string,
  taskEndTime: number,
  data: ValidatedTweetInfo,
  invites: InviteCodeInfo[],
  communityUuid: string,
  wallet?: Wallet,
  validateStatus: Submission['validateStatus'],
  validateError?: string
}
/**
 * update tweet task submission, only for server side validation(trigger by cron job or task owner)
 */
export const saveTweetTaskSubmitInfo = async function({
  taskPid,
  submissionId,
  submitterAddress,
  taskEndTime,
  data,
  invites,
  communityUuid,
  wallet,
  validateStatus,
  validateError
}: SaveTweetTaskSubmitInfoParams) {
  if (!submissionId) {
    throw new Error('Submission ID is required')
  }

  console.log('save tweet task submit info')
  const tweetInfo = data.data[0]
  
  const tweetCreateTime = new Date(tweetInfo.created_at).getTime()

  // TODO pass invite count as a parameter
  const inviteCount = invites.filter(inviteInfo => {
    return (
      inviteInfo.inviterAddress === submitterAddress &&
      inviteInfo.communityUuid === communityUuid &&
      inviteInfo.type === 'task' &&
      inviteInfo.taskPid === taskPid
    )
  }).reduce((total, inviteInfo) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validInvitees = Object.entries<{ joinTime: number }>(inviteInfo.invitees).filter(([_, invitee]) => {
      const { joinTime } = invitee
      return joinTime > tweetCreateTime && joinTime < taskEndTime
    })
    total += validInvitees.length
    return total
  }, 0)
  
  const tweetLength = wordCount(tweetInfo.note_tweet ? tweetInfo.note_tweet.text : tweetInfo.text)
  const submission:Omit<TweetSubmission, 'url' | 'createTime'|'updateTime'|'validateError'|'validateTime'|'validator'> = {
    id: submissionId,
    taskPid,
    address: submitterAddress,
    buzz: tweetLength,
    discuss: tweetInfo.public_metrics.reply_count,
    identify: tweetInfo.public_metrics.quote_count + tweetInfo.public_metrics.retweet_count,
    popularity: tweetInfo.public_metrics.like_count,
    spread: tweetInfo.public_metrics.impression_count,
    friends: inviteCount,
    // TODO calculate score at server side or at AO
    score: 0
  }
  if (validateStatus === 'validated') {
    // from 'waiting_for_validation' to 'validated'
    const updateSubmissionData: Omit<TweetSubmission, 'url' | 'createTime'|'address'|'updateTime'> = {
      ...submission,
      validateStatus,
    }
    await updateSubmission(updateSubmissionData, taskPid, wallet)
  } else if (validateStatus === 'revalidated') {
    // from 'validated' to 'revalidated'
    const updateSubmissionData: Omit<TweetSubmission, 'url' | 'createTime'|'address'|'updateTime'> = {
      ...submission,
      validateStatus,
      validateTime: new Date().getTime()
    }
    if (validateError) {
      updateSubmissionData.validateError = validateError
    }
    
    await updateSubmission(updateSubmissionData, taskPid, wallet)
  } else if (validateStatus === 'invalid' || validateStatus === 'validation_error') {
    // from 'waiting_for_validation' to 'invalid' or 'validation_error'
    await updateInvalidSubmission({submissionId, taskPid, wallet, validateStatus, validateError})
  } else {
    throw new Error('Invalid validate status')
  }
}