import {tokenProcessIDs} from '~/utils/constants'
import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import type { PermissionType } from 'arconnect'
import { defineStore } from 'pinia'
import { notificationStore } from './notificationStore'
import type { Bounty, InviteInfo, RelatedUserMap, Task } from '~/types'
import { sleep, retry } from '~/utils/util'
import { tokens } from '~/utils/constants'
import { aoCommunityProcessID, tasksProcessID, moduleID, schedulerID } from '~/utils/processID'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

type TaskSubmitInfo = {
  taskId: any;
  id: number;
  address: any;
  brandEffect: any;
  getPerson: any;
  audience: any;
  url: any;
  score: any;
  bounty: any;
  bounty1: any;
  bountyType1: any;
  bounty2: any;
  bountyType2: any;
}

export const taskStore = defineStore('taskStore', () => {
  const denomination  = $ref({
    AO: 1e12,
    AR: 1e12,
    FIZI: 1e12,
    TRUNK: 1e3,
    EXP: 1e6,
    ORBT: 1e12,
    EARTH: 1e12,
    FIRE: 1e12,
    AIR: 1e12,
    LAVA: 1e12,
  })
  const Sleep = (ms: number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
  }


  const { showSuccess, alertMessage } = $(notificationStore())

  let respArray = $ref([])
  let allTaskSubmitInfo = $ref<TaskSubmitInfo[]>([])
  let allTasks = $ref([])

  const createTask = async (data: any) => {
    // create a task process，then add process ID to task info
    await window.arweaveWallet.connect(permissions)
    const taskProcessID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    data.processId = taskProcessID

    // wait for process creating until you can send message to it
    await sleep(1000)

    console.log(JSON.stringify(data))
    console.log('newProcessId = ' + taskProcessID)


    // 把此次任务需要的钱转给process两种bounty，转两次，如果不为0的话
    // TODO use Promise.all here
    if (data.tokenNumber && data.tokenNumber != 0) {
      await transferBounty(taskProcessID, data.tokenType, data.tokenNumber)
    }

    if(data.tokenNumber1 && data.tokenNumber1 != 0) {
      await transferBounty(taskProcessID, data.tokenType1, data.tokenNumber1)
    }

    // 向新的 process 里写入 sendBounty action
    await evalTaskProcess(taskProcessID, data.ownerId)
    showSuccess('Create task success')

    return await retry({
      fn: async () => {
        return await message({
          process: tasksProcessID,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [{ name: 'Action', value: 'CreateTask' }],
          data: JSON.stringify(data)
        })
      },
      maxAttempts: 3,
      interval: 5000
    })

  }

  async function evalTaskProcess(processID: string, ownerId: string) {
    const luaCode = `TaskOwnerWallet = "${ownerId}"
local json = require("json")
Handlers.add(
  "sendBounty",
  Handlers.utils.hasMatchingTag("Action", "sendBounty"),
  function (msg)
    local success = "0"
    if(msg.From == TaskOwnerWallet) then
      local req = json.decode(msg.Data)
      for _, value in pairs(req) do
        ao.send({
          Target = value.tokenType,
          Action = "Transfer",
          Recipient = value.walletAddress,
          Quantity = tostring(value.tokenNumber)
        })
      end
      success = "1"
    end
    Handlers.utils.reply(success)(msg)
  end
)

Handlers.add(
  "getOwner",
  Handlers.utils.hasMatchingTag("Action", "getOwner"),
  function (msg)
    Handlers.utils.reply(TaskOwnerWallet)(msg)
  end
)`

    await message({
      // process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
      process: processID,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
  }

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
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      console.error(error)
      return []
    }
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      return []
    }
    const resp = res.Messages[0].Data.split(';')

    for (const json of resp) {
      const element = JSON.parse(json) as Task

      if (element.communityId !== communityId) {
        continue
      }

      let reward = ''
      if (element.tokenNumber != 0) {
        const token = tokens[element.tokenType as TokenName]
        reward = Number(element.tokenNumber) / Math.pow(10, token.denomination) + ' ' + element.tokenType
      }
      if (element.tokenNumber1 != 0) {
        const token = tokens[element.tokenType1 as TokenName]
        reward = reward +  '+' + Number(element.tokenNumber1) /  Math.pow(10, token.denomination) + ' ' + element.tokenType1
      }

      const respData = {
        ...element,
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

  const getAllTasksNoCommunity = async () => {
    const res = await dryrun({
      process: tasksProcessID,
      tags: [{ name: 'Action', value: 'GetAllTasks' }],
    })

    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      return ''
    }
    const resp = res.Messages[0].Data.split(';')

    allTasks = []
    for (let index = 0; index < resp.length; index++) {
      const element = JSON.parse(resp[index])
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)
      let reward = ''
      if(element.tokenNumber != '0'){
        const token = tokens[element.tokenType as TokenName]
        reward = Number(element.tokenNumber) /  Math.pow(10, token.denomination) + ' ' + element.tokenType
      }
      if(element.tokenNumber1 != '0'){
        const token = tokens[element.tokenType1 as TokenName]
        reward = reward +  '+' + Number(element.tokenNumber1) /  Math.pow(10, token.denomination) + ' ' + element.tokenType1
      }
      const respData = {
        id: element.taskId,
        name: element.taskName,
        image: element.taskLogo,
        description: element.taskInfo,
        startTime: element.startTime,
        endTime: element.endTime,
        zone: element.zone,
        rewardTotal: element.rewardTotal,
        buildNumber: element.buildNumber,
        taskRule: element.taskRule,
        reward: reward,
        tokenNumber: element.tokenNumber,
        tokenType: element.tokenType,
        tokenNumber1: element.tokenNumber1,
        tokenType1: element.tokenType1,
        builderNum: element.buildNumber,
        status: element.isBegin,
        joined: element.joined,
        ownerId: element.ownerId,
        communityId: element.communityId,
        isBegin: element.isBegin,
        isSettle: element.isSettle,
        isCal: element.isCal,
        processId: element.processId
      }
      allTasks.push(respData)
    }
  }

  const getTask = async (taskID: string) => {
    if(!taskID) {
      throw new Error('taskID is required to get task info')
    }

    const res = await dryrun({
      process: tasksProcessID,
      tags: [{ name: 'Action', value: 'GetAllTasks' }],
    })

    console.log(`getTask ${taskID} res:`, res)
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      throw new Error('Failed to get data from dryrun result.')
    }
    const resp = res.Messages[0].Data.split(';')

    for (let index = 0; index < resp.length; index++) {
      const element = JSON.parse(resp[index]) as Task

      if(element.taskId !== taskID) continue
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)

      console.info('found task from res!')

      let reward = ''

      if (element.tokenNumber != 0) {
        const token = tokens[element.tokenType as TokenName]
        reward = Number(element.tokenNumber) / Math.pow(10, token.denomination) + ' ' + element.tokenType
      }
      if (element.tokenNumber1 != 0) {
        const token = tokens[element.tokenType1 as TokenName]
        reward = reward +  '+' + Number(element.tokenNumber1) /  Math.pow(10, token.denomination) + ' ' + element.tokenType1
      }

      return {
        ...element,
        reward
      }
    }

    throw new Error('Not found task ' + taskID)
  }

  const joinTask = async (taskId: string, joinedAddress: string) => {
    const data = {
      taskId: taskId,
      joinedAddress: joinedAddress
    }
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'JoinTask' }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }

  const getTaskJoinRecord = async (taskId: string) => {
    let res
    let TaskJoinRecords = []
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'getTaskJoinRecord' }, { name: 'taskId', value: taskId }],
      })
    } catch (error) {
      alertMessage(error)
      return
    }
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      TaskJoinRecords = []
      return
    }
    const resp = res.Messages[0].Data.split(';')
    for (let index = 0; index < resp.length; index++) {

      const element = JSON.parse(resp[index])

      const respData = {
        taskId: element.taskId,
        joinedAddress: element.joinedAddress
      }
      TaskJoinRecords.push(respData)
    }
    return TaskJoinRecords
  }

  const testCallJava = async(spaceId: string) => {
    const query = computed(() => ({ spaceId: spaceId }))
    const {data, pending} = await useFetch('/api/twitter', { query })
    console.log('pending = ' + JSON.stringify(pending))
    console.log('data = ' + JSON.stringify(data))
    // space开始时间 从开始时间往前推24小时，统计邀请数量 记作friend参数
    const spaceStartedAt = data._rawValue.data.started_at
    // space参与人数
    const participanted = data._rawValue.data.participant_count
    // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
    const userAvatar = data._rawValue.includes.users[0].profile_image_url
    // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
    const userCreatedAt = data._rawValue.includes.users[0].created_at
    console.log(spaceStartedAt)
    console.log(participanted)
    console.log(userAvatar)
    console.log(userCreatedAt)
  }

  const submitSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string, brand: number, friend: number, audience: number) => {
    console.log('audi = ' + audience)
    const data = {
      taskId: taskId,
      address: walletAddress,
      brandEffect: brand,
      getPerson: friend,
      audience: audience,
      url: spaceUrl,
      score: 0,
      bounty: 0
    }
    // 将解析好的数据保存进 AO，与任务 ID 相关联
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'SubmitSpaceTask' }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }

  const updateTaskAfterCal = async (taskId: string) => {
    // 计算之后将任务信息中的是否已计算修改为Y
    console.log('in updataTask')
    try {
      await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'updateTaskAfterCal' }],
        data: taskId
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
  }

  /**
   * 结算之后将任务信息中的是否已结算修改为Y
   * @param taskId
   * @returns Promise<string>
   */
  const updateTaskAfterSettle = async (taskId: string) => {
    return await message({
      process: tasksProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'updateTaskAfterSettle' }],
      data: taskId
    })
  }

  const updateTaskSubmitInfoAfterCal = async (taskId: string, data: any) => {
    // 计算之后将分数信息更新到提交信息中
    console.log(JSON.stringify(data))
    let requestBody = ''
    for(let i = 0; i < data.length; ++i){
      requestBody += JSON.stringify(data[i])
      if(i != data.length - 1){
        requestBody += ';'
      }
    }
    console.log(requestBody)
    try {
      const messageId = await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'updateTaskSubmitInfoAfterCal' }, { name: 'taskId', value: taskId }],
        data: requestBody
      })
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
  }

  const getSpaceTaskSubmitInfo = async (taskId: string) => {
    let res
    let spaceTaskSubmitInfo = []
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'getSpaceTaskSubmitInfo' }, { name: 'taskId', value: taskId }],
      })
      console.log('getSpaceTaskSubmitInfo:', {res})
    } catch (error) {
      alertMessage(error)
      console.error('getSpaceTaskSubmitInfo', error)
      return []
    }

    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      console.info('getSpaceTaskSubmitInfo null', res)
      spaceTaskSubmitInfo = []
      return []
    }
    const resp = res.Messages[0].Data.split(';')

    for (let index = 0; index < resp.length; index++) {
      const element = JSON.parse(resp[index])
      console.log('resp = ' + element.address)

      const respData = {
        taskId: element.taskId,
        id: index + 1,
        address: element.address,
        brandEffect: element.brandEffect,
        getPerson: element.getPerson, // invite count
        audience: element.audience,
        url: element.url,
        score: element.score,
        bounty: element.bounty,
        bounty1: element.bounty1,
        bountyType1: element.bountyType1,
        bounty2: element.bounty2,
        bountyType2: element.bountyType2
      }
      spaceTaskSubmitInfo.push(respData)
    }
    return spaceTaskSubmitInfo
  }

  const getAllTaskSubmitInfo = async () => {
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'getAllTaskSubmitInfo' }],
      })
    } catch (error) {
      alertMessage(error)
      return []
    }
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      allTaskSubmitInfo = []
      return []
    }
    const resp = res.Messages[0].Data.split(';')
    allTaskSubmitInfo = []
    for (let index = 0; index < resp.length; index++) {

      const element = JSON.parse(resp[index])
      // console.log('resp = ' + element.address)
      const respData = {
        taskId: element.taskId,
        id: index + 1,
        address: element.address,
        brandEffect: element.brandEffect,
        getPerson: element.getPerson,
        audience: element.audience,
        url: element.url,
        score: element.score,
        bounty: element.bounty,
        bounty1: element.bounty1,
        bountyType1: element.bountyType1,
        bounty2: element.bounty2,
        bountyType2: element.bountyType2
      }
      allTaskSubmitInfo.push(respData)
    }

    console.log('getAllTaskSubmitInfo', allTaskSubmitInfo)
    return allTaskSubmitInfo
  }

  // wallets: 需要转账的钱包地址 tokenNumber: 每个账户需要转的token数量 tokenType: 转账的token类型的地址
  const sendBounty = async (taskProcessId: string, bounties: any) => {
    for(let i = 0; i < bounties.length; ++i){
      if(bounties[i].tokenType){
        bounties[i].tokenType = tokenProcessIDs[bounties[i].tokenType as TokenName]
      }
    }
    console.log('after token map = ' + JSON.stringify(bounties))
    console.log('taskProcessId = ' + taskProcessId)
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: taskProcessId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'sendBounty' }],
        data: JSON.stringify(bounties)
      })
      console.log('return message = ' + messageId)
      return messageId
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }

  const storeBounty = async (bounties: {
    walletAddress: string;
    tokenNumber: number;
    tokenType: TokenName;
  }[]) => {
    await window.arweaveWallet.connect(permissions)
    const messageId = await message({
      process: tasksProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: 'Action', value: 'storeBounty' }],
      data: JSON.stringify(bounties)
    })
    console.log('return message = ' + messageId)
    return messageId
  }

  const getAllBounty = async () => {
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'getAllBounties' }]
      })
      // console.log('all bounties = ' + res.Messages[0].Data)
      return JSON.parse(res.Messages[0].Data) as Bounty[]
    } catch (error) {
      console.log('messageToAo -> error:', error)
      throw new Error('Get bounty error')
    }
  }

  const getBountiesByCommunityID = async (communityID: string) => {
    const bounties = await getAllBounty()
    return bounties.filter(bounty => bounty.communityId === communityID)
  }

  return $$({ denomination, storeBounty, getAllBounty, getBountiesByCommunityID, updateTaskAfterSettle, allTasks, getAllTasksNoCommunity, submitInfo: allTaskSubmitInfo, getAllTaskSubmitInfo, getInvitesByInviter, updateTaskSubmitInfoAfterCal, updateTaskAfterCal, testCallJava, createTask, getAllTasks, submitSpaceTask, getTask, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo })
})

async function transferBounty(receiver: string, tokenName: string, amount: number) {
  const tokenProcess = tokenProcessIDs[tokenName as TokenName]

  if (!tokenProcess) {
    throw new Error(`Bounty token ${tokenName} not supported.`)
  }
  console.log(tokenName, 'token processID: ', tokenProcess)
  console.log({tokenName, amount, receiver})
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
            { name: 'Quantity', value: String(amount) }
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
