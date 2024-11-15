import { updateSubmissions } from '~/utils/task/updateSubmissions.server'

type UpdateSubmissionsPayload = {
  taskPid: string
}

export default defineTask({
  meta: {
    name: 'updateSubmissions',
    description: 'Update task submissions.',
  },
  run({ payload }) {
    const { taskPid } = payload as UpdateSubmissionsPayload
    return updateSubmissions(taskPid)
  }
})

