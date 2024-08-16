import {tokenProcessIDs} from '~/utils/constants'
import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import type { PermissionType } from 'arconnect'
import { defineStore } from 'pinia'
import type { Bounty, InviteInfo, RelatedUserMap, Task, SpaceSubmission, TaskForm, SpaceSubmissionWithCalculatedBounties } from '~/types'
import { sleep, retry } from '~/utils/util'
import { aoCommunityProcessID, taskManagerProcessID, moduleID, schedulerID } from '~/utils/processID'
import taskProcessCode from '~/AO/Task.tpl.lua?raw'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

export const taskStore = defineStore('taskStore', () => {
  const allTasks = $ref([])

  const createTask = async (data: TaskForm) => {
    // create a task process，then add process ID to task info
    await window.arweaveWallet.connect(permissions)
    const taskProcessID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    data.processID = taskProcessID
    data.bounties = (data.bounties as Task['bounties'])
      .filter(bounty => bounty.tokenProcessID && bounty.amount > 0 && bounty.chain)
      .map(bounty => {
        const token = tokensByProcessID[bounty.tokenProcessID]
        if (!token) {
          throw new Error(`Bounty token ${bounty.tokenName} not supported.`)
        }
        bounty.quantity = (BigInt(bounty.amount) * BigInt(Math.pow(10, token.denomination))).toString()
        return bounty
      })

    // wait for process creating until you can send message to it
    await sleep(1000)

    console.log(JSON.stringify(data))
    console.log('newProcessId = ' + taskProcessID)

    // 把此次任务需要的钱转给process两种bounty，转两次，如果不为0的话
    // TODO use Promise.all here
    await Promise.all((data.bounties as Task['bounties']).map(bounty => {
      if (bounty.quantity) {
        return transferBounty(bounty.tokenProcessID, bounty.tokenName, bounty.quantity)
      } else {
        return Promise.resolve()
      }
    }))

    // 向新的 process 里写入 sendBounty action
    await evalTaskProcess(taskProcessID)

    return await retry({
      fn: async () => {
        return await message({
          process: taskManagerProcessID,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [{ name: 'Action', value: 'CreateTask' }],
          data: JSON.stringify(data)
        })
      },
      maxAttempts: 3,
      interval: 5000
    })
  }

  async function evalTaskProcess(processID: string) {
    return await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: taskProcessCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
  }

  function calcReward(bounties: Task['bounties']) {
    return bounties.reduce((reward, bounty) => {
      if (bounty.amount && bounty.tokenProcessID && bounty.tokenName) {
        reward += Number(bounty.amount) + ' ' + bounty.tokenName
      }
      return reward
    }, '')
  }

  const getTask = async (taskPid: string) => {
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

    const reward = calcReward(task.bounties)
    return {
      ...task,
      reward
    }
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
    const tasks = JSON.parse(resp) as Array<Task & {reward: string}>

    return tasks.map(task => {
      task.reward = calcReward(task.bounties)
      return task
    }).sort((a, b) => {
      return a.createTime >= b.createTime ? -1 : 1
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
          { name: 'Action', value: 'getInvitesByInviter' },
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

  const getAllTasks = async (communityId: string) => {
    const communityTasks = []
    const res = await dryrun({
      process: taskManagerProcessID,
      tags: [{ name: 'Action', value: 'GetAll' }],
    })

    const resp = extractResult<string>(res)
    const tasks = JSON.parse(resp) as Task[]

    for (const task of tasks) {
      if (task.communityUuid !== communityId) {
        continue
      }

      const reward = task.bounties.reduce((reward, bounty) => {
        if (bounty.amount && bounty.tokenProcessID && bounty.tokenName) {
          const token = tokensByProcessID[bounty.tokenProcessID]
          reward += Number(bounty.amount) / Math.pow(10, token.denomination) + ' ' + bounty.tokenName
        }
        return reward
      }, '')

      const respData = {
        ...task,
        reward: reward
      }

      communityTasks.push(respData)
    }

    const sortedTasks = communityTasks.sort((a, b) => {
      if(a.createTime && !b.createTime) return -1

      if(!a.createTime && b.createTime) return 1

      if(a.createTime && b.createTime) {
        return a.createTime >= b.createTime ? -1 : 1
      }

      return a.startTime >= b.startTime ? -1 : 1
    })
    console.log({sortedTasks})
    return sortedTasks
  }

  const joinTask = async (taskPid: string, inviterAddress?: string) => {
    await window.arweaveWallet.connect(permissions)

    const messageId = await message({
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
    return messageId
  }

  // TODO calc brandEffect, inviteCount(getPerson), audience before task owner send bounty
  const submitSpaceTask = async (spaceSubmission: SpaceSubmission) => {
    await window.arweaveWallet.connect(permissions)

    const messageId = await message({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'AddSubmission' }],
      data: JSON.stringify(spaceSubmission)
    })

    const { Error: error } = await result({process: taskManagerProcessID, message: messageId})
    if (error) {
      throw new Error('Add space submission error. ', error)
    }
  }

  async function getSubmissionsByTaskPid (taskPid: string): Promise<SpaceSubmissionWithCalculatedBounties[]> {
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

    return task.submissions.map(submission => {
      return {
        ...submission,
        calculatedBounties: task.bounties
      }
    })
  }

  const setTaskIsCalculated = async (taskPid: string) => {
    console.log('update task calculation status')

    return await message({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'SetTaskIsCalculated' },
        { name: 'TaskPid', value: taskPid },
      ],
      data: taskPid
    })
  }

  /**
   * set task.isSettled to true
   * @param taskId
   * @returns Promise<string>
   */
  const setTaskIsSettled = async (taskPid: string) => {
    return await message({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'SetTaskIsSettled' },
        { name: 'TaskPid', value: taskPid },
      ],
    })
  }

  const updateTaskSubmissions = async (taskPid: string, data: any) => {
    // 计算之后将分数信息更新到提交信息中
    console.log('update task submit info after calculation', JSON.stringify(data))

    const messageId = await message({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'UpdateTaskSubmissions' },
        { name: 'TaskPid', value: taskPid }
      ],
      data: JSON.stringify(data)
    })

    const { Error: error } = await result({process: taskManagerProcessID, message: messageId})
    if (error) {
      console.error('Update submissions error. ', error)
      throw new Error('Update submissions error. ', error)
    }
  }

  /**
   * Send bounty tokens from task process
   * @param taskPid task process ID
   * @param bounties
   * @returns
   */
  const sendBounty = async (taskPid: string, bounties: Bounty[]) => {
    console.log('bounties to send ' + JSON.stringify(bounties))
    console.log('taskProcessId = ' + taskPid)
    await window.arweaveWallet.connect(permissions)

    const messageId = await message({
      process: taskPid,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'SendBounty' }],
      data: JSON.stringify(bounties)
    })
    console.log('return message = ' + messageId)
    return messageId
  }

  /**
   * store bounty send history
   * @param bounties
   * @returns
   */
  const storeBounty = async (taskPid: string, bounties: Bounty[]) => {
    await window.arweaveWallet.connect(permissions)
    const messageId = await message({
      process: taskManagerProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'StoreBounty' },
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
      tags: [{ name: 'Action', value: 'getAllBounties' }]
    })
    // console.log('all bounties = ' + res.Messages[0].Data)
    const bountyMap = JSON.parse(res.Messages[0].Data) as Record<string, Bounty[]>
    return Object.values(bountyMap).flat()
  }

  return $$({
    createTask, getTask, getAllTasks, getTasksByCommunityUuid,
    allTasks,

    setTaskIsSettled, setTaskIsCalculated,

    sendBounty, storeBounty, getAllBounty,

    submitSpaceTask,
    getSubmissionsByTaskPid,

    updateTaskSubmissions,

    joinTask,

    // TODO move this to communityStore
    getInvitesByInviter
  })
})

async function transferBounty(receiver: string, tokenName: string, quantity: string) {
  const tokenProcess = tokenProcessIDs[tokenName as TokenName]

  if (!tokenProcess) {
    throw new Error(`Bounty token ${tokenName} not supported.`)
  }
  console.log(tokenName, 'token processID: ', tokenProcess)
  console.log({tokenName, amount: quantity, receiver})
  await window.arweaveWallet.connect(permissions)

  let mTags
  try {
    mTags = await retry({
      fn: async () => {
        const messageId = await message({
          process: tokenProcess,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            { name: 'Recipient', value: receiver },
            { name: 'Quantity', value: quantity }
          ]
        })
        const { Messages } = await result({
          // the arweave TXID of the message
          message: messageId,
          // the arweave TXID of the process
          process: tokenProcess,
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
  for(let k = 0; k < mTags.length; ++k){
    const tag = mTags[k]
    if(tag.name === 'Error'){
      errorMessage = tag.value
      transError = true
      break
    }
  }

  if(transError){
    throw new Error('Pay bounty failed. ' + errorMessage)
  }
}
