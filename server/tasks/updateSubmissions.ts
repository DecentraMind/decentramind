import { ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { SPACE_URL_REGEXP, TWEET_URL_REGEXP } from '~/utils'
import { getTask } from '~/utils/task'
import { updateSubmissions } from '~/utils/task/updateSubmissions.server'
import { getSpaces, getTweets } from '~/utils/twitter/twitter.server'

type UpdateSubmissionsPayload = {
  taskPid: string
}

export default defineTask({
  meta: {
    name: 'updateSubmissions',
    description: 'Update task submissions.',
  },
  async run({ payload }) {
    const { taskPid } = payload as UpdateSubmissionsPayload
    const task = await getTask(taskPid)

    if (!task) {
      return { result: 'error', message: 'task not found' }
    }

    if (task.type === 'space') {
      const spaceIds = task.submissions.map(s => {
        const matched = s.url.trim().match(SPACE_URL_REGEXP)
        if (!matched || !matched[1]) {
          return false
        }
        return matched[1]
      }).filter(Boolean).join(',')

      const spacesInfo = await getSpaces(spaceIds)
      if (!spacesInfo || !spacesInfo.data || !spacesInfo.data.length || !spacesInfo.includes) {
        console.error('Error fetching spaces:', spacesInfo)
        throw new Error('Failed to validate space URL: fetch data failed.')
      }
      return updateSubmissions(task, spacesInfo as ValidatedSpacesInfo)

    } else if (task.type === 'promotion' || task.type === 'bird' || task.type === 'article') {
      const tweetIds = task.submissions.map(s => {
        const matched = s.url.trim().match(TWEET_URL_REGEXP)

        if (!matched || !matched[1]) {
          return false
        }
        return matched[1]
      }).filter(Boolean).join(',')

      const tweets = await getTweets(tweetIds)
      return updateSubmissions(task, tweets as ValidatedTweetInfo)
    } else {
      return { result: 'error', message: 'not implemented.' }
    }
  }
})

