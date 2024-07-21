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
import {aoCommunityProcessID, tasksProcessID} from '~/utils/processID'
import type { Task } from '~/types'

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
  const tokenMap = $ref(tokenProcessIDs)
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


  const { showError, showSuccess, alertMessage } = $(notificationStore())
  let respArray = $ref([])
  let allTaskSubmitInfo = $ref<TaskSubmitInfo[]>([])
  let allTasks = $ref([])
  let allInviteInfo = $ref([])
  const createTask = async (data: any) => {
    //  创建process 将process ID添加在任务信息中
    await window.arweaveWallet.connect(permissions)
    const newProcessId = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })
    data.processId = newProcessId
    await Sleep(1000)
    console.log(JSON.stringify(data))
    console.log('newProcessId = ' + newProcessId)

    // 把此次任务需要的钱转给process两种bounty，转两次，如果不为0的话
    if(data.tokenNumber && data.tokenNumber != 0){
      console.log('tokenNumber = ' + data.tokenNumber)
      console.log(data.tokenType)

      try{
        if(!tokenMap[data.tokenType as TokenName]) {
          throw new Error(`token ${data.tokenType} not supported.`)
        }
        console.log('token processID: ', tokenMap[data.tokenType as TokenName])
        await window.arweaveWallet.connect(permissions)
      }catch(error){
        console.log('open error = ' + error)
        return
      }

      try{
        const messageId = await message({
          process: tokenMap[data.tokenType as TokenName],
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            {name: 'Recipient', value: newProcessId},
            {name: 'Quantity', value: String(data.tokenNumber)}
          ]
        })
        const { Messages } = await result({
          // the arweave TXID of the message
          message: messageId,
          // the arweave TXID of the process
          process: tokenMap[data.tokenType as TokenName],
        })

        const mTags = Messages[0].Tags
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
          showError('Pay bounty failed.' + errorMessage)
          alert('Pay bounty failed.' + errorMessage)
          return
        }

      } catch (error){
        showError(error)
        return
      }
    }

    if(data.tokenNumber1 && data.tokenNumber1 != 0){
      console.log(data.tokenNumber1)
      console.log(data.tokenType1)
      try{
        await window.arweaveWallet.connect(permissions)
      }catch(error){
        console.log('open error = ' + error)
        return
      }
      try{
        const messageId = await message({
          process: tokenMap[data.tokenType1],
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            {name: 'Recipient', value: newProcessId},
            {name: 'Quantity', value: String(data.tokenNumber1) }
          ]
        })
        let { Messages, Spawns, Output, Error } = await result({
          // the arweave TXID of the message
          message: messageId,
          // the arweave TXID of the process
          process: tokenMap[data.tokenType],
        });
        const mTags = Messages[0].Tags
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
          showError('Pay bounty failed.' + errorMessage)
          alert('Pay bounty failed.' + errorMessage)
          return
        }
      }catch(error){
        console.log(error)
      }
    }
    // 向新的process里写入sendBounty方法
    const x = 'TaskOwnerWallet = "' + data.ownerId + '"'
    const luaCode = x + '      local json = require("json")      Handlers.add(    "sendBounty",    Handlers.utils.hasMatchingTag("Action", "sendBounty"),    function (msg)      local success = "0      "if(msg.From == TaskOwnerWallet) then      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber)      })      end      success = "1"      end      Handlers.utils.reply(success)(msg)    end  )      Handlers.add(    "testloadlua",      Handlers.utils.hasMatchingTag("Action", "testloadlua"),      function (msg)      Handlers.utils.reply(TaskOwnerWallet)(msg)    end  )'
    console.log('luacode = ' + luaCode)
    await message({
      // process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
      process: newProcessId,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      // TODO data: luaCode.replace('\n', '      '),
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'CreateTask' }],
        data: JSON.stringify(data)
      })
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    showSuccess('Create task success')
  }
  const getAllInviteInfo = async() => {
    await window.arweaveWallet.connect(permissions)
    try{
      const res = await dryrun({
        process: aoCommunityProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
          { name: 'Action', value: 'getAllInviteInfo' }
        ]
      })
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
        respArray = []
        return ''
      }
      const resp = JSON.parse(res.Messages[0].Data)
      allInviteInfo = []
      for (let index = 0; index < resp.length; index++) {
        // console.log('resp[index] = ' + JSON.parse(resp[index]).invited)
        const element = JSON.parse(resp[index])
        if(element.invited === 'none'){
          continue
        }
        const inviteInfo = {
          invited: element.invited,
          communityId: element.communityId,
          inviteTime: element.inviteTime,
          userId: element.userId,
          userName: element.userName,
          userAvatar: element.userAvatar
        }
        console.log({inviteInfo})
        allInviteInfo.push(inviteInfo)
      }
    } catch (error){
      console.log(error)
    }
  }

  const getAllTasks = async (communityId: string) => {
    // TODO don't use outer variable respArray
    // respArray = []
    const communityTasks = []
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      alertMessage(error)
      return []
    }
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      respArray = []
      return []
    }
    const resp = res.Messages[0].Data.split(';')

    console.log('getAllTask resp from AO', resp)
    for (const json of resp) {
      const element = JSON.parse(json)
      console.log({element})
      console.log('communityId = ' + element.communityId)
      console.log('trans communityId = ' + communityId)
      if (element.communityId !== communityId) {
        // console.log('communityId = ' + element.communityId)
        continue
      }
      let reward = ''
      if(element.tokenNumber != '0'){
        reward = Number(element.tokenNumber) / denomination[element.tokenType] + ' ' + element.tokenType
      }
      if(element.tokenNumber1 != '0'){
        reward = reward +  '+' + Number(element.tokenNumber1) /  denomination[element.tokenType1] + ' ' + element.tokenType1
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
      respArray.push(respData)

      communityTasks.push(respData)
    }
    // console.log("respArray = " + respArray)
    // for (let index = 0; index < respArray.length; index++) {
    //     const e = respArray[index];
    //     console.log(e.id)
    // }
    console.log({communityTasks, respArray})
    return communityTasks
    showSuccess('Get all tasks success')
  }

  const getAllTasksNoCommunity = async () => {
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      respArray = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    allTasks = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)
      let reward = ''
      if(element.tokenNumber != '0'){
        reward = Number(element.tokenNumber) /  denomination[element.tokenType] + ' ' + element.tokenType
      }
      if(element.tokenNumber1 != '0'){
        reward = reward +  '+' + Number(element.tokenNumber1) /  denomination[element.tokenType1] + ' ' + element.tokenType1
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
    // console.log("respArray = " + respArray)
    // for (let index = 0; index < respArray.length; index++) {
    //     const e = respArray[index];
    //     console.log(e.id)
    // }
    showSuccess('Get all tasks success')
  }

  const getTask = async (taskID: string) => {
    if(!taskID) {
      throw new Error('taskID is required to get task info')
    }

    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      console.error('getTask error:', error)
      alertMessage(error)
      return
    }

    console.log(`getTask ${taskID} res:`, res)
    if (!res.Messages.length || res.Messages[0]?.Data === 'null') {
      return
    }
    const resp = res.Messages[0].Data.split(';')

    for (let index = 0; index < resp.length; index++) {
      const element = JSON.parse(resp[index]) as Task

      if(element.taskId !== taskID) continue
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)

      console.info('found task from res!')

      let reward = ''
      if(element.tokenNumber != 0){
        reward = Number(element.tokenNumber) / denomination[element.tokenType] + ' ' + element.tokenType
      }
      if(element.tokenNumber1 != 0){
        reward = reward +  '+' + Number(element.tokenNumber1) /  denomination[element.tokenType1] + ' ' + element.tokenType1
      }
      return {...element, reward}
    }

    console.error('Not found this task')
    return
  }

  const getTaskById = async (taskId: string) => {
    console.log('getTaskById', taskId)

    // 根据taskId获取单个任务信息
    for (let index = 0; index < respArray.length; index++) {
      const taskItem = respArray[index]
      if (taskItem.id === taskId) {
        showSuccess('get task by id success')
        return taskItem
      }
    }
    return ''
  }

  const joinTask = async (taskId: string, joinedAddress: string) => {
    let data = {
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
  const testTransfer = async() => {
    await window.arweaveWallet.connect(permissions)
    try{
      const messageId = await message({
        process: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
          { name: 'Action', value: 'Transfer' },
          {name: 'Recipient', value: 'AWdD90gYRc6C76x4yC4CZHJS7Ts_jakzL7b_nirgw1c'},
          {name: 'Quantity', value: '1000'}
        ]
      })
    }catch(error){
      console.log(error)
    }
  }



  const submitSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string, brand: number, friend: string, audi: string) => {
    console.log('audi = ' + audi)
    const data = {
      taskId: taskId,
      address: walletAddress,
      brandEffect: brand,
      getPerson: friend,
      audience: audi,
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
  const updateTaskAfterSettle = async (taskId: string) => {
    // 结算之后将任务信息中的是否已结算修改为Y
    console.log('in updataTask')
    try {
      await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'updateTaskAfterSettle' }],
        data: taskId
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
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
      console.log('getAllTaskSubmitInfo', res)
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
    return allTaskSubmitInfo
  }

  // wallets: 需要转账的钱包地址 tokenNumber: 每个账户需要转的token数量 tokenType: 转账的token类型的地址
  const sendBounty = async (taskProcessId: string, bounties: any) => {
    for(let i = 0; i < bounties.length; ++i){
      if(bounties[i].tokenType){
        bounties[i].tokenType = tokenMap[bounties[i].tokenType]
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

  const storeBounty = async (bounties: any) => {
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: tasksProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'storeBounty' }],
        data: JSON.stringify(bounties)
      })
      console.log('return message = ' + messageId)
      return messageId
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }
  const getAllBounty = async () => {
    let res
    try {
      res = await dryrun({
        process: tasksProcessID,
        tags: [{ name: 'Action', value: 'getAllBounties' }]
      })
      console.log('all bounties = ' + res.Messages[0].Data)
      return JSON.parse(res.Messages[0].Data)
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }

  const makecommunityChat = async (taskProcessId: string) => {
    const x = 'TaskOwnerWallet = "' + '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw' + '"'
    // const luaCode  = 'Handlers.add(    "Echo",    Handlers.utils.hasMatchingTag("Action", "Echo"),    function (msg)      Handlers.utils.reply("Echo back")(msg)    end  )'
    const luaCode = x + '      local json = require("json")      Handlers.add(    "sendBounty",    Handlers.utils.hasMatchingTag("Action", "sendBounty"),    function (msg)      local success = "0      "if(msg.From == TaskOwnerWallet) then      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber)      })      end      success = "1"      end      Handlers.utils.reply(success)(msg)    end  )      Handlers.add(    "testloadlua",      Handlers.utils.hasMatchingTag("Action", "testloadlua"),      function (msg)      Handlers.utils.reply(TaskOwnerWallet)(msg)    end  )'

    console.log(luaCode)
    let buildLua = await message({
      // process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
      process: taskProcessId,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    // const testBuild = await message({
    //   process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
    //   tags: [
    //     { name: 'Action', value: 'Echo' }
    //   ],
    //   signer: createDataItemSigner(window.arweaveWallet),
    // })
    // console.log(JSON.stringify(testBuild))
  }



  return $$({ denomination, storeBounty, getAllBounty, updateTaskAfterSettle, allInviteInfo, allTasks, getAllTasksNoCommunity, submitInfo: allTaskSubmitInfo, getAllTaskSubmitInfo, getAllInviteInfo, updateTaskSubmitInfoAfterCal, updateTaskAfterCal, testTransfer, testCallJava, createTask, getAllTasks, submitSpaceTask, getTaskById, getTask, respArray, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo, makecommunityChat })
})
