import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import type { PermissionType } from 'arconnect'
import { defineStore } from 'pinia'
import type { Bounty, InviteInfo, RelatedUserMap, Task, SpaceSubmission, TaskForm, SpaceSubmissionWithCalculatedBounties, Scores } from '~/types'
import { sleep, retry, messageResult, messageResultCheck, extractResult } from '~/utils'
import { aoCommunityProcessID, taskManagerProcessID, moduleID, schedulerID } from '~/utils/processID'
import taskProcessCode from '~/AO/Task.tpl.lua?raw'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

export const useTaskStore = defineStore('task', () => {
  const allTasks = $ref([])

  const createTask = async (data: TaskForm, communityName: string) => {
    // create a task process，then add process ID to task info
    await window.arweaveWallet.connect(permissions)
    const taskProcessID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Name', value: communityName + ' Task'
      }, {
        name: 'App-Name', value: 'DecentraMind'
      }, {
        name: 'App-Process', value: taskManagerProcessID,
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

    console.log(JSON.stringify(data))
    console.log('newProcessId = ' + taskProcessID)

    // set task process handlers
    await retry({
      fn: async () => {
        return await evalTaskProcess(taskProcessID)
      },
      maxAttempts: 3,
      interval: 2000
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
          data: JSON.stringify(data)
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

  // TODO move this to communityStore
  const getInvitesByInviter = async(address: string) => {
    await window.arweaveWallet.connect(permissions)
    try{
      const res = await dryrun({
        process: aoCommunityProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
          { name: 'Action', value: 'GetInvitesByInviter' },
          { name: 'Inviter', value: address }
        ]
      })
      if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
        return { invites: [], relatedUsers: {} }
      }

      const resp = JSON.parse(res.Messages[0].Data) as {invites: InviteInfo[], relatedUsers: RelatedUserMap}
      const invites = []

      for (const invite of resp.invites) {
        if (!invite.inviterAddress) {
          continue
        }

        invites.push(invite)
      }

      return { invites, relatedUsers: resp.relatedUsers }
    } catch (error) {
      console.error(error)
      throw Error('Get invite info failed:' + error)
    }
  }

  const joinTask = async (taskPid: string, inviterAddress?: string) => {
    await window.arweaveWallet.connect(permissions)

    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Action', value: 'JoinTask'
      }, {
        name: 'TaskPid', value: taskPid
      }].concat(inviterAddress ? [{
        name: 'InviterAddress', value: inviterAddress
      }] : [])
    })
  }

  // TODO calc brandEffect, inviteCount(getPerson), audience before task owner send bounty
  const submitSpaceTask = async (spaceSubmission: Omit<SpaceSubmission, 'id'|'createTime'>) => {
    await window.arweaveWallet.connect(permissions)

    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'AddSubmission' }],
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

  /**
   * set task.isSettled to true
   * @param taskId
   * @returns Promise<string>
   */
  const setTaskIsSettled = async (taskPid: string) => {
    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'SetTaskIsSettled' },
        { name: 'TaskPid', value: taskPid },
      ],
    })
  }

  const updateTaskSubmissions = async (taskPid: string, submissions: SpaceSubmissionWithCalculatedBounties[]) => {
    console.log('update task submissions', submissions)

    return await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'UpdateTaskSubmissions' },
        { name: 'TaskPid', value: taskPid }
      ],
      data: JSON.stringify(submissions.map(submission => {
        submission.calculatedBounties.map(bounty => {
          (bounty as unknown as {quantity: string}).quantity = bounty.quantity.toString()
          return bounty
        })
        return submission
      }))
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
    console.table(bounties.map(bounty => {
      bounty.quantity = bounty.quantity.toString()
      return bounty
    }))
    console.log('taskProcessId = ' + taskPid)
    
    await window.arweaveWallet.connect(permissions)

    const resultMessages = await messageResultCheck({
      process: taskPid,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'SendBounty' }],
      data: JSON.stringify(bounties.map(bounty => {
        bounty.quantity = bounty.quantity.toString()
        return bounty
      }))
    })

    console.log('return messages = ', resultMessages)
    return resultMessages
  }

  /**
   * store bounty send history
   * @param bounties
   * @returns
   */
  const storeBounty = async (taskPid: string, bounties: Bounty[]) => {
    await window.arweaveWallet.connect(permissions)
    const messageId = await messageResultCheck({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'StoreBountySendHistory' },
        { name: 'TaskPid', value: taskPid }
      ],
      data: JSON.stringify(bounties)
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
    return JSON.parse(data) as Bounty[]
  }

  return {
    createTask, getTask, getTasksByCommunityUuid,
    allTasks,

    setTaskIsSettled,

    sendBounty, storeBounty, getAllBounty, getBountiesByCommunityID,

    submitSpaceTask,

    updateTaskSubmissions, updateTaskScores,

    joinTask,

    // TODO move this to communityStore
    getInvitesByInviter
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