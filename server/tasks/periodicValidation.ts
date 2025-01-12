import { defineTask } from '#imports'
import { getTask, getUnsettledTasks } from '~/utils/task'
import { updateSubmissions } from '~/utils/task/updateSubmissions.server'
import { Task, ValidatedSpacesInfo, ValidatedTweetInfo } from '~/types'
import { SPACE_URL_REGEXP, TWEET_URL_REGEXP } from '~/utils'
import { getByPid2IdsMap, getSpaces, getTweets } from '~/utils/twitter/twitter.server'

type Payload = {
  taskPid: string
}

export default defineTask({
  meta: {
    name: 'periodicValidation',
    description: 'Periodically validate submissions and update metrics'
  },

  async run({ payload }) {
    // test twitter task: rSGxdHYip8RnFJkD2UqXcKCJGiggfSKxP2XSvA-q5SE
    // test space task: fzZCH0XaUiMqCqmcNO_6Z36UeQrkXx4wqBgpePPwioI
    const { taskPid } = payload as Payload
    console.log('====== periodic validation task started ======')

    try {
      const tasks = taskPid ? [await getTask(taskPid)] : await getUnsettledTasks()

      // separate tasks by type and filter for tasks with submissions updated before end time
      const spaceTasks = tasks.filter(task => 
        task.type === 'space' && 
        task.submissions.length > 0 &&
        Math.max(...task.submissions.map(s => s.updateTime)) < task.endTime
      )
      const tweetTasks = tasks.filter(task => 
        (task.type === 'promotion' || task.type === 'bird' || task.type === 'article') &&
        task.submissions.length > 0 &&
        Math.max(...task.submissions.map(s => s.updateTime)) < task.endTime
      )

      console.log('spaceTasks', spaceTasks.length)
      console.log('tweetTasks', tweetTasks.length)

      await Promise.all([
        validateSpaceTasks(spaceTasks),
        validateTweetTasks(tweetTasks)
      ])

      return { result: 'success' }
    } catch (error) {
      console.error('Periodic validation failed:', error)
      throw error
    } finally {
      console.log('====== periodic validation task finished ======')
    }
  }
})

async function validateSpaceTasks(spaceTasks: Task[]) {
  /** a map of task pid to space ids */
  const taskPid2SpaceIdsMap = spaceTasks.reduce((map, task) => {
    const spaceIds = task.submissions.map(s => {
      if (s.validateStatus === 'invalid') {
        return false
      }
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

  // console.log('taskPid2SpaceIdsMap', taskPid2SpaceIdsMap)
  if (Object.keys(taskPid2SpaceIdsMap).length === 0) {
    console.log('No space tasks to validate')
    return { result: 'success' }
  }

  const taskPid2SpaceInfo = await getByPid2IdsMap(taskPid2SpaceIdsMap, getSpaces)

  // console.log('taskPid2SpaceInfo', taskPid2SpaceInfo)
  for (const task of spaceTasks) {
    console.log('periodic validation task', task.processID, `${task.submissions.length} submissions.`)
    const spaceInfo = taskPid2SpaceInfo[task.processID]

    if (!spaceInfo) {
      console.error('Space info not found:', { pid: task.processID, spaceIds: taskPid2SpaceIdsMap[task.processID] })
      continue
    }

    if (!spaceInfo || !spaceInfo.data || !spaceInfo.data.length || !spaceInfo.includes) {
      console.warn('Error fetching spaces:', { taskPid: task.processID, spaceIds: taskPid2SpaceIdsMap[task.processID], spaceInfo })
      // continue
    }
    await updateSubmissions(task, spaceInfo as ValidatedSpacesInfo)
  }
}

async function validateTweetTasks(tweetTasks: Task[]) {
  /** a map of task pid to tweet ids */
  const taskPid2TweetIdsMap = tweetTasks.reduce((map, task) => {
    const tweetIds = task.submissions.map(s => {
      if (s.validateStatus === 'invalid') {
        return false
      }
      const matched = s.url.trim().match(TWEET_URL_REGEXP)
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

  console.log('taskPid2TweetIdsMap', taskPid2TweetIdsMap)
  const taskPid2TweetInfo = await getByPid2IdsMap(taskPid2TweetIdsMap, getTweets)
  console.log('taskPid2TweetInfo', taskPid2TweetInfo)

  for (const task of tweetTasks) {
    console.log('periodic validation task', task.processID, `${task.submissions.length} submissions.`)
    const tweetInfo = taskPid2TweetInfo[task.processID]

    if (!tweetInfo) {
      console.warn('Tweet info not found:', { pid: task.processID, tweetIds: taskPid2TweetIdsMap[task.processID] })
      continue
    }

    if (!tweetInfo || !tweetInfo.data || !tweetInfo.data.length || !tweetInfo.includes) {
      console.warn('Error fetching tweets.', { taskPid: task.processID, tweetIds: taskPid2TweetIdsMap[task.processID] })
      // continue
    }

    await updateSubmissions<ValidatedTweetInfo>(task, tweetInfo as ValidatedTweetInfo, tweetInfo.errors)
  }
}
