import { dryrun, dryrunResult, messageResultCheck, createDataItemSigner } from '~/utils/ao'
import type { Task, AllSubmissionWithCalculatedBounties, AllSubmission, Community, InviteCodeInfo, SpaceSubmission, ValidatedTweetInfo, TweetSubmission, ValidatedSpacesInfo, RelatedUserMap, Submission } from '~/types'
import { extractResult, wordCount } from '~/utils'
import { DM_PROCESS_ID } from '~/utils/processID'
import { compareImages } from '~/utils/image'
import { gateways, arUrl } from '~/utils/arAssets'
import { cloneDeep } from 'lodash-es'

const taskManagerProcessID = DM_PROCESS_ID
export async function getTask(taskPid: string, address?: string): Promise<Task> {
  if (!taskPid) {
    throw new Error('Task process ID is required to get task info.')
  }

  const tags = [
    { name: 'Action', value: 'GetTask' },
    { name: 'ProcessID', value: taskPid }
  ]
  if (address) {
    tags.push({ name: 'Address', value: address })
  }

  const res = await dryrun({
    process: taskManagerProcessID,
    tags
  })

  const resp = extractResult<string>(res)
  const task = JSON.parse(resp) as Task & { submissions: AllSubmissionWithCalculatedBounties[] }

  task.submissions = task.submissions.map(submission => {
    return {
      ...submission,
      calculatedBounties: (submission as AllSubmissionWithCalculatedBounties).calculatedBounties || cloneDeep(task.bounties.map(bounty => {
        const ret = cloneDeep(bounty)
        ret.amount = 0
        ret.quantity = BigInt(0)
        return ret
      }))
    }
  })
  return task
}

/**
 * TODO: update using admin wallet
 * update specific submission
 * @param submission 
 * @param taskPid 
 * @returns 
 */
export const updateSubmission = async (
  submission: Pick<AllSubmission, 'id'> & Partial<Omit<AllSubmission, 'createTime' | 'updateTime'>>,
  taskPid: string,
  wallet?: Parameters<typeof createDataItemSigner>[0]
) => {
  console.log('update submission', submission)
  
  if (!globalThis.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to update submission')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.arweaveWallet),
    tags: [
      { name: 'Action', value: 'UpdateSubmission' },
      { name: 'TaskPid', value: taskPid },
      { name: 'SubmissionID', value: submission.id.toString() }
    ],
    data: JSON.stringify(submission)
  })
}

/**
 * update all submissions of a task
 * @param taskPid 
 * @param submissions 
 * @returns 
 */
export const updateTaskSubmissions = async (taskPid: string, submissions: AllSubmissionWithCalculatedBounties[], wallet?: Parameters<typeof createDataItemSigner>[0]) => {
  console.log('update task submissions', submissions)
  if (!globalThis.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to submit task')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.arweaveWallet),
    tags: [
      { name: 'Action', value: 'UpdateTaskSubmissions' },
      { name: 'TaskPid', value: taskPid }
    ],
    data: JSON.stringify(submissions, bigintReplacer)
  })
}

export const saveSpaceTaskSubmitInfo = async function ({submitterAddress, spaceUrl, spaceInfo, taskPid, communityUuid, communityLogo, invites, mode, submissionId, wallet, validateStatus, validateError}: {submitterAddress: string, spaceUrl: string, spaceInfo: ValidatedSpacesInfo, taskPid: string, communityUuid: string, communityLogo: string, invites: InviteCodeInfo[], mode: 'add' | 'update', submissionId?: number, wallet?: Parameters<typeof createDataItemSigner>[0], validateStatus?: Submission['validateStatus'], validateError?: string}) {
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
  const host = spaceInfo.includes.users.find(user => user.id === hostID)
  if (!host) {
    throw new Error('Failed to get space host avatar.')
  }

  // avatar of space host
  const userAvatar = host.profile_image_url.replace(/_(normal|bigger|mini).jpg$/, '.jpg')
  
  const ssim = userAvatar
    ? await compareImages(arUrl(communityLogo, gateways.ario), userAvatar)
    : 0
  // console.log({ ssim, communityLogo: arUrl(communityInfo.logo, gateways.ario), twitterUserAvatar: userAvatar})
  
  // 品牌效应
  const brandEffect = ssim && ssim >= 0.8 ? 10 : 0
  // 听众
  const audience = participantCount
  // 邀请人数
  const inviteCount = invites.filter(inviteInfo => {
    return (
      inviteInfo.inviterAddress === submitterAddress &&
      inviteInfo.communityUuid === communityUuid
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


  if (mode === 'add') {
    const spaceSubmission:Omit<SpaceSubmission, 'id'|'createTime'|'updateTime'> = {
      taskPid,
      address: submitterAddress,
      inviteCount,
      audience,
      brandEffect,
      url: spaceUrl,
      // TODO calculate score at server side or at AO
      score: 0
    }
    await submitTask(spaceSubmission)
  } else if (mode === 'update') {
    if (!submissionId) {
      throw new Error('Submission ID is required')
    }
    if (!validateStatus) {
      throw new Error('Validate status is required')
    }

    const spaceSubmission:Omit<SpaceSubmission, 'createTime'|'brandEffect'|'audience'|'score'|'taskPid'|'address'|'updateTime'> = {
      id: submissionId!,
      inviteCount,
      url: spaceUrl,
      validateStatus: 'validated',
      validateTime: new Date().getTime()
    }
    
    await updateSubmission(spaceSubmission, taskPid, wallet)
  } else {
    throw new Error('Invalid mode')
  }
}

/**
 * update invalid or validation error submission
 */
export const updateInvalidSubmission = async function({submissionId, taskPid, wallet, validateStatus, validateError}: {submissionId: number, taskPid: string, wallet?: Parameters<typeof createDataItemSigner>[0], validateStatus: Submission['validateStatus'], validateError?: string}) {
  if (!validateStatus || !['invalid', 'validation_error'].includes(validateStatus)) {
    throw new Error('Invalid validate status')
  }
  const submission:Pick<Submission, 'id'|'validateStatus'|'validateError'|'validateTime'> = {
    id: submissionId,
    validateStatus,
    validateError,
    validateTime: new Date().getTime()
  }
  await updateSubmission(submission, taskPid, wallet)
}

/**
 * save validated tweet task submission
 */
export const saveTweetTaskSubmitInfo = async function({url, submitterAddress, taskEndTime, data, invites, taskPid, communityUuid, mode, submissionId, wallet, }: {url: string, submitterAddress: string, taskEndTime: number, data: ValidatedTweetInfo, invites: InviteCodeInfo[], taskPid: string, communityUuid: string, mode: 'add' | 'update', submissionId?: number, wallet?: Parameters<typeof createDataItemSigner>[0], validateStatus?: Submission['validateStatus'], validateError?: string}) {
  console.log('save promotion task submit info')
  const tweetInfo = data.data[0]
  
  const tweetCreateTime = new Date(tweetInfo.created_at).getTime()

  // TODO pass invite count as a parameter
  const inviteCount = invites.filter(inviteInfo => {
    return (
      inviteInfo.inviterAddress === submitterAddress &&
      inviteInfo.communityUuid === communityUuid
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
  const submission:Omit<TweetSubmission, 'id'|'createTime'|'updateTime'|'validateStatus'|'validateError'|'validateTime'|'validator'> = {
    url,
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
  if (mode === 'add') {
    await submitTask(submission)
  } else if (mode === 'update') {
    if (!submissionId) {
      throw new Error('Submission ID is required')
    }
    
    const updateSubmissionData: Omit<TweetSubmission, 'createTime'|'address'|'updateTime'> = {
      id: submissionId!,
      ...submission,
      validateStatus: 'validated',
      validateTime: new Date().getTime()
    }
    
    await updateSubmission(updateSubmissionData, taskPid, wallet)
  } else {
    throw new Error('Invalid mode')
  }
}

/**
 * submit a task submission
 * @param submission 
 * @returns 
 */
export const submitTask = async (submission: Omit<AllSubmission, 'id'|'createTime'|'updateTime'>, 
  wallet?: Parameters<typeof createDataItemSigner>[0]) => {
  if (!globalThis.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to submit task')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.arweaveWallet),
    tags: [{ name: 'Action', value: 'AddSubmission' }],
    data: JSON.stringify(submission)
  })
}

export const getInvitesByInviter = async (inviter: string, type?: 'task' | 'community') => {
  const tags = [{ name: 'Action', value: 'GetInvitesByInviter' }, { name: 'Inviter', value: inviter }]
  if (type) {
    tags.push({ name: 'InviteType', value: type })
  }
  const data = await dryrunResult<string>({
    process: taskManagerProcessID,
    tags
  })

  return JSON.parse(data) as {
    invites: InviteCodeInfo[],
    relatedUsers: RelatedUserMap,
    relatedTasks: Record<string, Task>,
    relatedCommunities: Record<string, Community>
  }
}