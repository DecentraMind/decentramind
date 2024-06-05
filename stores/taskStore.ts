import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import { PermissionType } from 'arconnect'


const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

let processId = '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw'

export const taskStore = defineStore('taskStore', () => {
  const { showError, showSuccess, alertMessage } = $(notificationStore())
  let respArray = $ref([])

  const createTask = async (data: any) => {


    // TODO 创建process 将process ID添加在任务信息中
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'CreateTask' }],
        data: JSON.stringify(data)
      })
      // TODO 给新建的process转账
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    showSuccess('Create task success')
  }

  const getAllTasks = async (communityId: string) => {
    let res
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if (res.Messages[0].Data === 'null') {
      respArray = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    respArray = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)
      if (element.communityId !== communityId) {
        // console.log('communityId = ' + element.communityId)
        continue
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
        reward: element.tokenNumber + ' ' + element.tokenType + '+' + element.tokenNumber1 + ' ' + element.tokenType1,
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

  const getTaskById = async (taskId: string) => {
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
    if (res.Messages[0].Data === 'null') {
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

  const testCallJava = async() => {
    const {data} = useFetch('/api/twitter')
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
    if (res.Messages[0].Data === 'null') {
      spaceTaskSubmitInfo = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
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
  const sendBounty = async (processId: string, wallets: string[], tokenNumber: string, tokenType: string) => {
    let data = {
      wallets: wallets,
      tokenNumber: tokenNumber,
      tokenType: tokenType
    }
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

  const makecommunityChat = async () => {
    let processId2 = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })
    // const processId2 = 'eCQysY6Vgxz-A5z1_LHFnknLUmsRseYPBJ9mIzQ-yVs'
    const luaCode = 'Handlers.add(    "Echo",    Handlers.utils.hasMatchingTag("Action", "Echo"),    function (msg)      Handlers.utils.reply("Echo back")(msg)    end  )'
    let buildLua = await message({
      process: processId2,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    return processId2
  }

  return $$({ testCallJava, createTask, getAllTasks, submitSpaceTask, getTaskById, respArray, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo, makecommunityChat })
})

// Send({ Target = ao.id, Action = "sendBounty", Data = "{"tokenNumber": "100","tokenType": "4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw","wallets": ["Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg","jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU"]}"})
