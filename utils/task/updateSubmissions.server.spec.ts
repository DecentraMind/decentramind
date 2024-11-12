// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateSubmissions } from './updateSubmissions.server'
import type { Task } from '~/types'

// Mock the external dependencies
vi.mock('~/utils/task')
// vi.mock('~/utils/twitter/twitter.server')
// vi.mock('fs')

describe('updateSubmissions task', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Mock environment variables
    vi.stubEnv('TWITTER_BEARER_TOKEN', 'mock-token')
    vi.stubEnv('WALLET_PATH', '/mock/path')
  })

  it('should return error if taskPid is missing', async () => {
    const result = await updateSubmissions('')
    expect(result).toEqual({
      result: 'error',
      message: 'taskPid is required'
    })
  })

  it('should return error if WALLET_PATH is not set', async () => {
    vi.stubEnv('WALLET_PATH', undefined)
    const result = await updateSubmissions('task-1')
    expect(result).toEqual({
      result: 'error',
      message: 'WALLET_PATH is not set'
    })
  })

  it('should return error if TWITTER_BEARER_TOKEN is not set', async () => {
    vi.stubEnv('TWITTER_BEARER_TOKEN', undefined)
    const result = await updateSubmissions('task-1')
    expect(result).toEqual({
      result: 'error',
      message: 'TWITTER_BEARER_TOKEN is not set'
    })
  })

  it('should return error if task not found', async () => {
    vi.mocked(getTask).mockResolvedValue(undefined as unknown as Task)
    
    const result = await updateSubmissions('non-existent-task')
    
    expect(result).toEqual({
      result: 'error',
      message: 'task not found'
    })
  })

  // it('should successfully update tweet submissions', async () => {
  //   // Mock wallet file
  //   vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ 
  //     address: 'mock-wallet-address' 
  //   }))

  //   // Mock task data
  //   vi.mocked(getTask).mockResolvedValue({
  //     type: 'bird',
  //     endTime: Date.now(),
  //     communityUuid: 'mock-community',
  //     submissions: [{
  //       id: '1',
  //       address: 'user1',
  //       url: 'https://twitter.com/user/status/123456',
  //       taskPid: 'task-1'
  //     }]
  //   })

  //   // Mock Twitter API response
  //   vi.mocked(getTweets).mockResolvedValue({
  //     data: [{
  //       id: '123456',
  //       text: 'Test tweet',
  //       public_metrics: {
  //         retweet_count: 5,
  //         reply_count: 2,
  //         like_count: 10,
  //         quote_count: 1
  //       }
  //     }],
  //     includes: {
  //       users: [{
  //         id: 'user1',
  //         username: 'testuser'
  //       }]
  //     }
  //   })

  //   // Mock invites data
  //   vi.mocked(getInvitesByInviter).mockResolvedValue({
  //     invites: []
  //   })

  //   // Mock save function
  //   vi.mocked(saveTweetTaskSubmitInfo).mockResolvedValue(undefined)

  //   const result = await updateSubmissionsTask.run({
  //     payload: { taskPid: 'task-1' }
  //   })

  //   expect(result).toEqual({
  //     result: 'success',
  //     message: 'submissions of task task-1 updated'
  //   })
  //   expect(saveTweetTaskSubmitInfo).toHaveBeenCalled()
  // })

  // it('should successfully update space submissions', async () => {
  //   // Mock wallet file
  //   vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ 
  //     address: 'mock-wallet-address' 
  //   }))

  //   // Mock task data
  //   vi.mocked(getTask).mockResolvedValue({
  //     type: 'space',
  //     endTime: Date.now(),
  //     communityUuid: 'mock-community',
  //     submissions: [{
  //       id: '1',
  //       address: 'user1',
  //       url: 'https://twitter.com/i/spaces/123456',
  //       taskPid: 'task-1'
  //     }]
  //   })

  //   // Mock Twitter API response
  //   vi.mocked(getSpaces).mockResolvedValue({
  //     data: [{
  //       id: '123456',
  //       state: 'ended',
  //       participant_count: 100
  //     }],
  //     includes: {
  //       users: [{
  //         id: 'user1',
  //         username: 'testuser'
  //       }]
  //     }
  //   })

  //   const result = await updateSubmissionsTask.run({
  //     payload: { taskPid: 'task-1' }
  //   })

  //   expect(result).toEqual({
  //     result: 'success',
  //     message: 'submissions of task task-1 updated'
  //   })
  // })

  // it('should handle Twitter API errors gracefully', async () => {
  //   vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ 
  //     address: 'mock-wallet-address' 
  //   }))

  //   vi.mocked(getTask).mockResolvedValue({
  //     type: 'bird',
  //     endTime: Date.now(),
  //     communityUuid: 'mock-community',
  //     submissions: [{
  //       id: '1',
  //       address: 'user1',
  //       url: 'https://twitter.com/user/status/123456',
  //       taskPid: 'task-1'
  //     }]
  //   })

  //   vi.mocked(getTweets).mockResolvedValue({
  //     data: [],
  //     includes: null
  //   })

  //   await expect(updateSubmissionsTask.run({
  //     payload: { taskPid: 'task-1' }
  //   })).rejects.toThrow('Failed to validate tweet URL: fetch data failed.')
  // })
}) 