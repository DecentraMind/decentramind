import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '~/utils/ao'

import { defineStore } from 'pinia'
import type { Bounty, Task, TaskForm, Scores, BountySendHistory, InviteCodeInfo, Community } from '~/types'
import { sleep, retry, messageResult, messageResultCheck, extractResult, dryrunResult } from '~/utils'
import { moduleID, schedulerID, MU, DM_PROCESS_ID } from '~/utils/processID'

import taskProcessCode from '~/AO/Task.tpl.lua?raw'
import { getTask, updateTaskSubmissions, submitTask, getInvitesByInviter } from '~/utils/task'

// task cache related interfaces and variables
export interface TaskCache {
  tasks: Task[]
  timestamp: number
  loading: boolean
}

export const useTaskStore = defineStore('task', () => {
  const taskManagerProcessID = DM_PROCESS_ID
  const isCreateTaskModalOpen = $ref(false)

  const createTask = async (data: TaskForm, communityName: string) => {
    // create a task process, then add process ID to task info
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
  
  // check if the tasks of a community are loading
  const isLoadingCommunityTasks = (communityUuid: string) => {
    const queryClient = useQueryClient()
    return queryClient.isFetching({ queryKey: ['tasks', 'fetchTasksByCommunityUuid', communityUuid] })
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

  /**
   * Update all submissions scores of a task
   * and set task.isScoreCalculated to true
   * @param taskPid 
   * @param scores 
   * @returns 
   */
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
  

  return {
    createTask, getTask, getTasksByOwner,

    sendBounty, storeBounty, getAllBounty, getBountiesByCommunityID, getBountiesByAddress,

    submitTask,

    updateTaskSubmissions, updateTaskScores,

    joinTask,

    // TODO move this to communityStore
    // getInvitesByInviter,
    createTaskInviteCode, getInviteByCode, getInvitesByInviter,

    isCreateTaskModalOpen,
    isLoadingCommunityTasks
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