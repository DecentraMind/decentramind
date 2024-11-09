import { defineTask } from '#imports'
import { getTask } from '~/modules/task'

interface UpdateSubmissionsPayload {
  taskPid: string
  signature: string
}

export default defineTask({
  meta: {
    name: 'UpdateSubmissions',
    description: 'Update task submissions.',
  },
  async run({ payload }) {
    const { taskPid, signature } = payload as unknown as UpdateSubmissionsPayload
    if (!taskPid || !signature) {
      throw new Error('taskPid and signature are required')
    }
    console.log('update task submissions payload = ', payload)
    // TODO verify signature
    

    const task = await getTask(taskPid)
    if (!task) {
      throw new Error('task not found')
    }

    return { result: 'success' }
  }
})