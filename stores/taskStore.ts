import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import { defineStore } from 'pinia'
import type { Bounty, RelatedUserMap, Task, SpaceSubmission, TaskForm, SpaceSubmissionWithCalculatedBounties, Scores, BountySendHistory, InviteCodeInfo, Community, TwitterSpaceInfo, TwitterTweetInfo, PromotionSubmission, PromotionSubmissionWithCalculatedBounties } from '~/types'
import { sleep, retry, messageResult, messageResultCheck, extractResult, dryrunResult } from '~/utils'
import { moduleID, schedulerID, MU, DM_PROCESS_ID } from '~/utils/processID'
import { useFetch } from '@vueuse/core'
import { unref } from 'vue'
import { compareImages } from '~/utils/image'
import { gateways, arUrl } from '~/utils/arAssets'
import taskProcessCode from '~/AO/Task.tpl.lua?raw'


export const useTaskStore = defineStore('task', () => {
  const taskManagerProcessID = DM_PROCESS_ID

  const allTasks = $ref([])

  const createTask = async (data: TaskForm, communityName: string) => {
    // create a task process，then add process ID to task info
    const taskProcessID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Name', value: data.name + ' - ' + communityName + ' Task'
      }, {
        name: 'App-Name', value: 'DecentraMind'
      }, {
        name: 'App-Process', value: taskManagerProcessID,
      }, {
        name: 'Authority', value: MU
      }, {
        name: 'Authority', value: taskManagerProcessID
      }]
    })
    data.processID = taskProcessID
    data.bounties = (data.bounties as Task['bounties'])
      .filter(bounty => bounty.tokenProcessID && bounty.amount > 0 && bounty.chain)
      .map(bounty => {
        const token = tokensByProcessID[bounty.tokenProcessID]
        if (!token) {
          throw new Error(`Bounty token ${bounty.tokenName} not supported.`)
        }
        bounty.quantity = BigInt(bounty.amount * Math.pow(10, token.denomination))
        return bounty
      })

    // wait for process creating until you can send message to it
    await sleep(3000)

    console.log('create task data:', JSON.stringify(data, bigintReplacer))
    console.log('newProcessId = ' + taskProcessID)

    // set task process handlers
    await retry({
      fn: async () => {
        return await evalTaskProcess(taskProcessID)
      },
      maxAttempts: 3,
      interval: 5000
    })

    // send bounty tokens to task process
    const transferedTokens: {
        tokenProcessID: string;
        tokenName: string;
    }[] = []
    const bountiesToBeTransfered = (data.bounties as Task['bounties']).filter(bounty => bounty.quantity)
    for (const bounty of bountiesToBeTransfered) {
      console.log('transfer bounty:', bounty.tokenName)
      transferedTokens.push(await transferBounty(taskProcessID, bounty))
    }
    console.log({transferedTokens})

    const createdTaskInfo = await retry({
      fn: async () => {
        return await messageResult({
          process: taskManagerProcessID,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [{ name: 'Action', value: 'CreateTask' }],
          data: JSON.stringify(data, bigintReplacer)
        })
      },
      maxAttempts: 3,
      interval: 5000
    })

    // set task process owner to nil
    await retry({
      fn: async () => {
        await messageResultCheck({
          process: taskProcessID,
          tags: [
            { name: 'Action', value: 'SetOwnerNil' }
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        })
      },
      maxAttempts: 3,
      interval: 1000
    })

    return createdTaskInfo
  }

  async function evalTaskProcess(processID: string) {
    console.log('eval at process:', processID)
    return await messageResultCheck({
      process: processID,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: taskProcessCode.replace('__TaskManagerProcess__', taskManagerProcessID),
      signer: createDataItemSigner(window.arweaveWallet),
    })
  }

  const getTask = async (taskPid: string): Promise<Task> => {
    if(!taskPid) {
      throw new Error('Task process ID is required to get task info.')
    }

    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [
        { name: 'Action', value: 'GetTask' },
        { name: 'ProcessID', value: taskPid },
      ],
    })

    const resp = extractResult<string>(res)
    const task = JSON.parse(resp) as Task
    
    task.submissions = task.submissions.map(submission => {
      return {
        ...submission,
        calculatedBounties: (submission as SpaceSubmissionWithCalculatedBounties).calculatedBounties || useCloneDeep(task.bounties.map(bounty => {
          const ret = useCloneDeep(bounty)
          ret.amount = 0
          ret.quantity = BigInt(0)
          return ret
        }))
      }
    })
    return task
  }

  const getTasksByCommunityUuid = async (communityUuid: string) => {
    if(!communityUuid) {
      throw new Error('communityUuid is required.')
    }

    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [
        { name: 'Action', value: 'GetTasksByCommunityUuid' },
        { name: 'CommunityUuid', value: communityUuid },
      ],
    })

    const resp = extractResult<string>(res)
    const tasks = JSON.parse(resp) as Task[]

    return tasks.sort((a, b) => {
      return a.createTime >= b.createTime ? -1 : 1
    }).map(task => {
      // TODO this is a temp fix of submittersCount, remove this if TaskManger process reply correct submittersCount
      task.submittersCount = task.submissions.reduce((set, submission) => {
        return set.add(submission.address) 
      }, new Set()).size
      return task
    })
  }

  const getTasksByOwner = async (address: string) => {
    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [
        { name: 'Action', value: 'GetTasksByOwner' },
        { name: 'Address', value: address }
      ]
    })
    const resp = extractResult<string>(res)
    return JSON.parse(resp) as Task[]
  }

  const joinTask = async (taskPid: string, inviteCode?: string) => {
    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Action', value: 'JoinTask'
      }, {
        name: 'TaskPid', value: taskPid
      }].concat(inviteCode ? [{
        name: 'InviteCode', value: inviteCode
      }] : [])
    })
  }

  // TODO calc brandEffect, inviteCount(getPerson), audience before task owner send bounty
  const submitTask = async (spaceSubmission: Omit<SpaceSubmission, 'id'|'createTime'> | Omit<PromotionSubmission, 'id'|'createTime'>) => {
    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'AddSubmission' }],
      data: JSON.stringify(spaceSubmission)
    })
  }

  /**
   * update specific submission
   * @param spaceSubmission 
   * @returns 
   */
  const updateSubmission = async (spaceSubmission: Pick<SpaceSubmission, 'id'> & Partial<Omit<SpaceSubmission, 'id' | 'createTime'>>, taskPid: string) => {
    console.log('update submission', spaceSubmission)
    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'UpdateSubmission' },
        { name: 'TaskPid', value: taskPid },
        { name: 'SubmissionID', value: spaceSubmission.id.toString() }
      ],
      data: JSON.stringify(spaceSubmission)
    })
  }

  const updateTaskScores = async (taskPid: string, scores: Scores) => {
    console.log('update task calculation scores', scores)

    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'UpdateTaskScores' },
        { name: 'TaskPid', value: taskPid },
      ],
      data: JSON.stringify(scores)
    })
  }

  const updateTaskSubmissions = async (taskPid: string, submissions: SpaceSubmissionWithCalculatedBounties[] | PromotionSubmissionWithCalculatedBounties[]) => {
    console.log('update task submissions', submissions)

    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'UpdateTaskSubmissions' },
        { name: 'TaskPid', value: taskPid }
      ],
      data: JSON.stringify(submissions, bigintReplacer)
    })
  }

  /**
   * Send bounty tokens from task process
   * @param taskPid task process ID
   * @param bounties
   * @returns
   */
  const sendBounty = async (taskPid: string, bounties: Bounty[]) => {
    console.log('bounties to send ')
    console.log('taskProcessId = ' + taskPid)

    // throw Error('stop')

    bounties.forEach(bounty => {
      if (bounty.amount < 0) {
        throw new Error('Bounty calculation error.')
      }
    })

    // TODO fix bug here: can not get error if send bounty before task end.
    const isSuccess = await messageResultCheck({
      process: taskPid,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'SendBounty' }],
      data: JSON.stringify(bounties, bigintReplacer)
    })

    console.log('return messages = ', isSuccess)
    return isSuccess
  }

  /**
   * store bounty send history
   * @param bounties
   * @returns
   */
  const storeBounty = async (taskPid: string, bounties: Bounty[]) => {
    const messageId = await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'StoreBountySendHistory' },
        { name: 'TaskPid', value: taskPid }
      ],
      data: JSON.stringify(bounties, bigintReplacer)
    })
    console.log('return message = ' + messageId)
    return messageId
  }

  const getAllBounty = async () => {
    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [{ name: 'Action', value: 'GetAllBounties' }]
    })
    // console.log('all bounties = ' + res.Messages[0].Data)
    const bountyMap = JSON.parse(res.Messages[0].Data) as Record<string, Bounty[]>
    return Object.values(bountyMap).flat()
  }

  const getBountiesByCommunityID = async (communityUuid: string) => {
    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [{
        name: 'Action', value: 'GetBountiesByCommunityID'
      }, {
        name: 'CommunityUuid', value: communityUuid
      }]
    })
    const data = extractResult<string>(res)
    return JSON.parse(data) as (Bounty & {recipientName: string})[]
  }

  const getBountiesByAddress = async (address: string) => {
    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [{
        name: 'Action', value: 'GetBountiesByAddress'
      }, {
        name: 'Address', value: address
      }]
    })
    const data = extractResult<string>(res)
    return JSON.parse(data) as {
      published: BountySendHistory[],
      awarded: BountySendHistory[]
    }
  }

  const createTaskInviteCode  = async (taskPid: string) => {
    const code = await messageResult<string>({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'CreateInviteCode' }, { name: 'TaskPid', value: taskPid }],
    })
    return code
  }

  const getInviteByCode = async (code: string) => {
    const data = await dryrunResult<string>({
      process: taskManagerProcessID,
      tags: [
        { name: 'Action', value: 'GetInviteByCode' },
        { name: 'Code', value: code }
      ]
    })
    
    return JSON.parse(data) as { invite: InviteCodeInfo, task?: Task, community: Community }
  }

  const getInvitesByInviter = async (inviter: string, type?: 'task' | 'community') => {
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

  const savePromotionTaskSubmitInfo = async function({url, submitterAddress, taskEndTime, data, invites, taskPid, communityUuid, mode, submissionId} : {url: string, submitterAddress: string, taskEndTime: number, data: TwitterTweetInfo, invites: InviteCodeInfo[], taskPid: string, communityUuid: string, mode: 'add' | 'update', submissionId?: number}) {
    console.log('save promotion task submit info')
    const tweetInfo = data.data[0]
    
    const tweetCreateTime = new Date(tweetInfo.created_at).getTime()

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
    const submission:Omit<PromotionSubmission, 'id'|'createTime'> = {
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
      
      const updateSubmissionData: Omit<PromotionSubmission, 'createTime'|'address'> = {
        id: submissionId!,
        ...submission
      }
      await updateSubmission(updateSubmissionData, taskPid)
    } else {
      throw new Error('Invalid mode')
    }
  }

  const saveSpaceTaskSubmitInfo = async function ({submitterAddress, spaceUrl, taskPid, taskCreateTime, communityInfo, invites, mode, submissionId}: {submitterAddress: string, spaceUrl: string, taskPid: string, taskCreateTime: number, communityInfo: Community, invites: InviteCodeInfo[], mode: 'add' | 'update', submissionId?: number}) {
    const runtimeConfig = useRuntimeConfig()
    const { twitterVouchedIDs } = $(communityStore())
  
    const matched = spaceUrl.trim().match(/(x|twitter)\.com\/i\/spaces\/([^/]+)\/?/)
  
    if (!matched || !matched[2]) {
      throw new Error('Invalid space URL.')
    }
    const spaceId = matched[2]
  
    const { data, error } = await useFetch(
      '/api/getTwitterSpace?' + new URLSearchParams({ spaceId }),
    ).json<TwitterSpaceInfo>()
    const spaceInfo = unref(data)
  
    if (error.value || !spaceInfo) {
      console.error('Error fetching data:', error)
      throw new Error('Failed to validate space URL.')
    }
  
    console.log('data from twitter = ', spaceInfo)
    type SpaceInfoError = {
      detail: string
      type: string
    }
    if ((spaceInfo as unknown as {errors: SpaceInfoError[]} ).errors?.length) {
      const error = (spaceInfo as unknown as {errors: SpaceInfoError[]}).errors[0]
      throw new Error('Failed to validate space URL: ' + error.detail)
    }
  
    const {
      started_at,
      ended_at,
      participant_count: participantCount,
    } = spaceInfo.data
    const spaceStartAt = new Date(started_at).getTime()
    const spaceEndedAt = new Date(ended_at).getTime()
    const validJoinStartAt = new Date(
      spaceEndedAt - 24 * 60 * 60 * 1000,
    ).getTime()

    if (spaceStartAt < taskCreateTime) {
      throw new Error('Invalid space URL: space starts before task is created.')
    }
  
    const minuteDifference = (spaceEndedAt - spaceStartAt) / (1000 * 60)
    
    if (minuteDifference < 15 && !runtimeConfig.public.debug) {
      throw Error('Invalid space URL: space lasts less than 15 minutes')
    }
  
    const hostID = spaceInfo.data.creator_id
    const host = spaceInfo.includes.users.find(user => user.id === hostID)
    const hostHandle = host?.username
    
    if (!runtimeConfig.public.debug && (!host || !twitterVouchedIDs.find(id => id === hostHandle))) {
      throw new Error('Invalid space URL: you are not the space host.')
    }
  
    // avatar of space host
    const userAvatar = host?.profile_image_url.replace(/_(normal|bigger|mini).jpg$/, '.jpg')
    
    const ssim = userAvatar
      ? await compareImages(arUrl(communityInfo.logo, gateways.ario), userAvatar)
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
        inviteInfo.communityUuid === communityInfo.uuid
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
      const spaceSubmission:Omit<SpaceSubmission, 'id'|'createTime'> = {
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
      const spaceSubmission:Omit<SpaceSubmission, 'createTime'|'brandEffect'|'score'|'taskPid'|'address'> = {
        id: submissionId!,
        inviteCount,
        audience,
        url: spaceUrl
      }
      await updateSubmission(spaceSubmission, taskPid)
    } else {
      throw new Error('Invalid mode')
    }
  }
  

  return {
    createTask, getTask, getTasksByCommunityUuid, getTasksByOwner,
    allTasks,

    sendBounty, storeBounty, getAllBounty, getBountiesByCommunityID, getBountiesByAddress,

    submitTask, updateSubmission, saveSpaceTaskSubmitInfo, savePromotionTaskSubmitInfo,

    updateTaskSubmissions, updateTaskScores,

    joinTask,

    // TODO move this to communityStore
    // getInvitesByInviter,
    createTaskInviteCode, getInviteByCode, getInvitesByInviter
  }
})

async function transferBounty(receiver: string, token: Task['bounties'][number]) {
  const { tokenProcessID, tokenName, quantity } = token

  if (!tokenProcessID) {
    throw new Error(`Bounty token ${tokenName} not supported.`)
  }
  console.log('sending ', tokenName, ' token processID: ', tokenProcessID)
  console.log({tokenName, amount: quantity, receiver})

  let mTags
  try {
    mTags = await retry({
      fn: async () => {
        const messageId = await message({
          process: tokenProcessID,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            { name: 'Recipient', value: receiver },
            { name: 'Quantity', value: quantity.toString() }
          ]
        })
        const { Messages } = await result({
          // the arweave TXID of the message
          message: messageId,
          // the arweave TXID of the process
          process: tokenProcessID,
        })
        return Messages[0].Tags as {name: string, value: string}[]
      },
      maxAttempts: 1,
      interval: 500
    })
  } catch(e) {
    if (e instanceof Error && e.message.includes('Cannot read properties of undefined')) {
      throw new Error(`Transfer token ${tokenName} failed.`)
    }
  }

  if (!mTags) {
    throw new Error('Pay bounty failed.')
  }

  let transError = false
  let errorMessage = ''
  for (let k = 0; k < mTags.length; ++k) {
    const tag = mTags[k]
    if (tag.name === 'Error') {
      errorMessage = tag.value
      transError = true
      break
    }
  }

  if (transError) {
    throw new Error('Pay bounty failed. ' + errorMessage)
  } else {
    console.info(`You have sent ${quantity} ${tokenName} to ${receiver}`)
    return {tokenProcessID, tokenName}
  }
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot))