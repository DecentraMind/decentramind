import { defineTask } from '#imports'
import {
  createDataItemSigner,
  message,
  dryrun,
} from '@permaweb/aoconnect'
import { taskManagerProcessID } from '~/utils/processID'

const {
  WALLET: walletJson
} = import.meta.env

export default defineTask({
  meta: {
    name: 'updateTask',
    description: 'Update task status.',
  },
  async run({ payload, context }) {
    const wallet = JSON.parse(walletJson)
    let res
    try {
      res = await dryrun({
        process: taskManagerProcessID,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      console.log('updateTask error = ' + error)
    }
    if (!res || res.Messages[0].Data === 'null') {
      console.log('No quest to change status.')
      return { result: 'Success' }
    }

    const resp = res.Messages[0].Data.split(';')
    // console.log('resp = ' + resp)
    const toY = []
    const toN = []
    const currentDate = new Date()
    console.log('currentDate ' + currentDate)

    for (let index = 0;index < resp.length;index++) {
      const element = JSON.parse(resp[index])
      // console.log('start = ' + element.startTime)
      // console.log('start = ' + element.isBegin)
      // console.log('end = ' + element.endTime)

      // console.log('trans communityId = ' + communityId)
      if (currentDate <= new Date(element.endTime) && currentDate >= new Date(element.startTime) && element.isBegin !== 'Y') {
        toY.push(element.taskId)
      } else if (currentDate > new Date(element.endTime) && element.isBegin !== 'N') {
        toN.push(element.taskId)
      }
    }

    for (const taskID of toY) {
      console.log('taskId to Y: ' + taskID)
      try {
        await message({
          process: taskManagerProcessID,
          signer: createDataItemSigner(wallet),
          tags: [{ name: 'Action', value: 'updateTaskToIng' }],
          data: taskID
        })
      } catch (error) {
        console.log('updateTaskToIng error = ' + error)
      }
    }

    for (const taskID of toN) {
      console.log('taskId to N: ' + taskID)
      try {
        await message({
          process: taskManagerProcessID,
          signer: createDataItemSigner(wallet),
          tags: [{ name: 'Action', value: 'updateTaskToEnd' }],
          data: taskID
        })
      } catch (error) {
        console.log('updateTaskToEnd error = ' + error)
      }
    }

    return { result: 'Success' }
  },
})
