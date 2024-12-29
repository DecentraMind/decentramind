import { defineTask } from '#imports'
import { getUnsettledTasks } from '~/utils/task'
import { updateSubmissions } from '~/utils/task/updateSubmissions.server'
import { Task, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { SPACE_URL_REGEXP } from '~/utils'
import { getByPid2IdsMap, getSpaces, getTweets } from '~/utils/twitter/twitter.server'

export default defineTask({
  meta: {
    name: 'periodicValidation',
    description: 'Periodically validate submissions and update metrics'
  },

  async run() {
    try {
      const tasks = await getUnsettledTasks()

      // separate tasks by type
      const spaceTasks = tasks.filter(task => task.type === 'space')
      const tweetTasks = tasks.filter(task => task.type === 'promotion' || task.type === 'bird' || task.type === 'article')

      await Promise.all([validateSpaceTasks(spaceTasks), validateTweetTasks(tweetTasks)])

      return { result: 'success' }
    } catch (error) {
      console.error('Periodic validation failed:', error)
      throw error
    }
  }
})

async function validateSpaceTasks(spaceTasks: Task[]) {
  /** a map of task pid to space ids */
  const taskPid2SpaceIdsMap = spaceTasks.reduce((map, task) => {
    const spaceIds = task.submissions.map(s => {
      const matched = s.url.trim().match(SPACE_URL_REGEXP)
      if (!matched || !matched[1]) {
        return false
      }
      return matched[1]
    }).filter(Boolean) as string[]
    if (spaceIds.length) {
      map[task.processID] = spaceIds
    }
    return map
  }, {} as Record<string, string[]>)

  const taskPid2SpaceInfo = await getByPid2IdsMap(taskPid2SpaceIdsMap, getSpaces)

  for (const task of spaceTasks) {
    console.log('periodic validation task', task)
    const spaceInfo = taskPid2SpaceInfo[task.processID]

    if (!spaceInfo) {
      console.error('Space info not found:', task.submissions[0].url)
      continue
    }

    if (!spaceInfo || !spaceInfo.data || !spaceInfo.data.length || !spaceInfo.includes) {
      console.error('Error fetching spaces:', { taskPid: task.processID, spaceIds: taskPid2SpaceIdsMap[task.processID], spaceInfo })
      throw new Error('Failed to validate space URL: fetch data failed.')
    }
    return updateSubmissions(task, spaceInfo as ValidatedSpacesInfo)
  }
}

async function validateTweetTasks(tweetTasks: Task[]) {
  /** a map of task pid to tweet ids */
  const taskPid2TweetIdsMap = tweetTasks.reduce((map, task) => {
    const tweetIds = task.submissions.map(s => {
      const matched = s.url.trim().match(SPACE_URL_REGEXP)
      if (!matched || !matched[1]) {
        return false
      }
      return matched[1]
    }).filter(Boolean) as string[]
    if (tweetIds.length) {
      map[task.processID] = tweetIds
    }
    return map
  }, {} as Record<string, string[]>)

  const taskPid2TweetInfo = await getByPid2IdsMap(taskPid2TweetIdsMap, getTweets)

  for (const task of tweetTasks) {
    console.log('periodic validation task', task)
    const tweetInfo = taskPid2TweetInfo[task.processID]

    if (!tweetInfo) {
      console.error('Tweet info not found:', task.submissions[0].url)
      continue
    }

    if (!tweetInfo || !tweetInfo.data || !tweetInfo.data.length || !tweetInfo.includes) {
      console.error('Error fetching tweets:', { taskPid: task.processID, tweetIds: taskPid2TweetIdsMap[task.processID], tweetInfo })
      throw new Error('Failed to validate tweet URL: fetch data failed.')
    }
    await updateSubmissions<ValidatedTweetInfo>(task, tweetInfo as ValidatedTweetInfo)
  }
}