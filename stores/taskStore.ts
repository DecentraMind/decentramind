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

let processId = 'Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg';
const { showError, showSuccess, alertMessage } = $(notificationStore())
export const taskStore = defineStore('taskStore', () => {
  let respArray = $ref([])
  const createTask = async (data: any, action: string) => {
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: action }],
        data: JSON.stringify(data)
      });
      // return messageId;
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    await getAllTasks('GetAllTasks')
    showSuccess('Create task success')
  }

  const getAllTasks = async (action: string) => {
    let res;
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: action }],
      });
    } catch (error) {
      alertMessage('messageToAo -> error:')
      return ''
    }
    let resp = res.Messages[0].Data.split(';');
    // console.log("resp.length = " + resp.length)
    // console.log("resp = " + resp)
    respArray = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index]);

      let respData = {
        id: element.taskId,
        name: element.taskName,
        image: element.taskLogo,
        description: element.taskInfo,
        reward: element.tokenNumber + " " + element.tokenType,
        builderNum: element.builderNum,
        status: "未开始",
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

  const joinSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string) => {
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
        tags: [{ name: 'Action', value: "JoinSpaceTask" }],
        data: JSON.stringify(data)
      });
      return messageId;
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return '';
    }
  }

  return $$({ createTask, getAllTasks, joinSpaceTask, respArray })
})
