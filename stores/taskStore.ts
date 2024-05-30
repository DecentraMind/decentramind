import {
  createDataItemSigner,
  result,
  message,
  dryrun
} from '@permaweb/aoconnect'

import { PermissionType } from 'arconnect'
import { notificationStore } from '~/stores/notificationStore'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

let processId = '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw'
const { showError, showSuccess, alertMessage } = $(notificationStore())
export const taskStore = defineStore('taskStore', () => {
  let respArray = $ref([])

  const createTask = async (data: any, action: string) => {
    // TODO 创建process 将process ID添加在任务信息中
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: action }],
        data: JSON.stringify(data)
      })
      // TODO 给新建的process转账
      // return messageId;
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    await getAllTasks('GetAllTasks')
    showSuccess('Create task success')
  }

  const getAllTasks = async (communityId: string, action: string) => {
    let res
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: action }],
      })
    } catch (error) {
      alertMessage('messageToAo -> error:')
      return ''
    }
    if(res.Messages[0].Data === 'null'){
        respArray = []
        return ''
    }
    let resp = res.Messages[0].Data.split(';')
    console.log("resp.length = " + resp.length)
    console.log("resp = " + resp)
    respArray = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      console.log('communityId = ' + element.communityId)
      if(element.communityId !== communityId){
        // console.log('communityId = ' + element.communityId)
        continue
      }
      console.log('builderNumber = ' + element.buildNumber)
      const respData = {
        id: element.taskId,
        name: element.taskName,
        image: element.taskLogo,
        description: element.taskInfo,
          startTime: element.startTime,
          endTime: element.endTime,
          rewardTotal: element.rewardTotal,
          buildNumber: element.buildNumber,
          taskRule: element.taskRule,
        reward: element.tokenNumber + ' ' + element.tokenType,
        builderNum: element.buildNumber,
        status: element.isBegin,
        joined: element.joined,
        ownerId: element.ownerId,
        communityId: element.communityId,
        isBegin: element.isBegin,
        isSettle: element.isSettle
      }
      respArray.push(respData)

    }
    // console.log("respArray = " + respArray)
    // for (let index = 0; index < respArray.length; index++) {
    //     const e = respArray[index];
    //     console.log(e.id)
    // }
    showSuccess('Get all tasks success')
  }

  const getTaskById = async(taskId: string) => {
      // 根据taskId获取单个任务信息
      for (let index = 0; index < respArray.length; index++) {
        const taskItem = respArray[index]
        if(taskItem.id === taskId){
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
    console.log(JSON.stringify(data))
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "JoinTask" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }

  const getTaskJoinRecord = async (taskId: string) => {
    let res
    let TaskJoinRecords = []
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: "getTaskJoinRecord" }, { name: 'taskId', value: taskId }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if(res.Messages[0].Data === 'null'){
      TaskJoinRecords = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])

      const respData = {
        taskId: element.taskId,
        joinedAddress: element.joinedAddress
      }
      TaskJoinRecords.push(respData)
    }
    return TaskJoinRecords
  }

  const submitSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string) => {
    // TODO 1.解析 space url 获取 Twitter space 信息，2.比对头像确权
    let data = {
      taskId: taskId,
      address: walletAddress,
      brandEffect: 0,
      getPerson: 0,
      audience: 0,
      url: spaceUrl,
      score: 0
    }
    console.log(JSON.stringify(data))
    // 将解析好的数据保存进 AO，与任务 ID 相关联
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "SubmitSpaceTask" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }

  const getSpaceTaskSubmitInfo = async (taskId: string) => {
    let res
    let spaceTaskSubmitInfo = []
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: "getSpaceTaskSubmitInfo" }, { name: 'taskId', value: taskId }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if(res.Messages[0].Data === 'null'){
      spaceTaskSubmitInfo = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    console.log("infos = " + resp)
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])

      const respData = {
        taskId: element.taskId,
        id: index + 1,
        address: element.address,
        brandEffect: element.brandEffect,
        getPerson: element.getPerson,
        audience: element.audience,
        url: element.url,
        score: element.score
      }
      spaceTaskSubmitInfo.push(respData)
    }
    return spaceTaskSubmitInfo
  }

  // wallets: 需要转账的钱包地址 tokenNumber: 每个账户需要转的token数量 tokenType: 转账的token类型的地址
  const sendBounty = async (processId: string, wallets: string[], tokenNumber: string,tokenType: string) => {
    let data = {
      wallets: wallets,
      tokenNumber: tokenNumber,
      tokenType: tokenType
    }
    console.log(JSON.stringify(data))
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "sendBounty" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }
  return $$({ createTask, getAllTasks, submitSpaceTask, getTaskById, respArray, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo })
})

// Send({ Target = ao.id, Action = "sendBounty", Data = "{"tokenNumber": "100","tokenType": "4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw","wallets": ["Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg","jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU"]}"})
