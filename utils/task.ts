import { dryrun, dryrunResult, messageResultCheck, createDataItemSigner, dryrunResultParsed, type Wallet } from '~/utils/ao'
import type { Task, AllSubmissionWithCalculatedBounties, AllSubmission, Community, InviteCodeInfo, RelatedUserMap, Submission, Bounty } from '~/types'
import { extractResult } from '~/utils'
import { DM_PROCESS_ID } from '~/utils/processID'
import { cloneDeep } from 'lodash-es'
import { bigintReplacer } from '~/utils/int'

const taskManagerProcessID = DM_PROCESS_ID

export async function getTask(taskPid: string, address?: string): Promise<Task> {
  if (!taskPid) {
    throw new Error('Task process ID is required to get task info.')
  }

  const tags = [
    { name: 'Action', value: 'GetTask' },
    { name: 'ProcessID', value: taskPid }
  ]
  if (address) {
    tags.push({ name: 'Address', value: address })
  }

  const res = await dryrun({
    process: taskManagerProcessID,
    tags
  })

  const resp = extractResult<string>(res)
  const task = JSON.parse(resp) as Task & { submissions: AllSubmissionWithCalculatedBounties[] }

  task.submissions = task.submissions.map(submission => {
    return {
      ...submission,
      calculatedBounties: (submission as AllSubmissionWithCalculatedBounties).calculatedBounties || cloneDeep(task.bounties.map(bounty => {
        const ret = cloneDeep(bounty)
        ret.amount = 0
        ret.quantity = BigInt(0)
        return ret
      }))
    }
  })
  return task
}

export const getTasksByCommunityUuid = async (communityUuid: string): Promise<Task[]> => {
  if(!communityUuid) {
    throw new Error('communityUuid is required.')
  }

  const tasks = await dryrunResultParsed<Task[]>({
    process: taskManagerProcessID,
    tags: [
      { name: 'Action', value: 'GetTasksByCommunityUuid' },
      { name: 'CommunityUuid', value: communityUuid },
    ],
  })

  return tasks.sort((a, b) => {
    return a.createTime >= b.createTime ? -1 : 1
  }).map(task => {
    // TODO this is a temp fix of submittersCount, remove this if TaskManger process reply correct submittersCount
    task.submittersCount = task.submissions.reduce((set, submission) => {
      return set.add(submission.address) 
    }, new Set()).size
    return task
  })
}

/**
 * Get tasks that are not settled
 */
export async function getUnsettledTasks(): Promise<Task[]> {
  return await dryrunResultParsed<Task[]>({
    process: taskManagerProcessID,
    tags: [{ name: 'Action', value: 'GetUnsettledTasks' }]
  })
}

export async function getUnsettledTasksByCommunityUuid(communityUuid: string) {
  return await dryrunResultParsed<Task[]>({
    process: taskManagerProcessID,
    tags: [
      { name: 'Action', value: 'GetUnsettledTasksByCommunityUuid' },
      { name: 'CommunityUuid', value: communityUuid }
    ]
  })
}

/**
 * update specific submission. this function is only for server side validation or task owner
 * @param submission 
 * @param taskPid 
 * @returns 
 */
export const updateSubmission = async (
  submission: Pick<AllSubmission, 'id'> & Partial<Omit<AllSubmission, 'createTime' | 'updateTime' | 'validateTime' | 'validator'>>,
  taskPid: string,
  wallet?: Wallet
) => {
  console.log('update submission', { taskPid, submission: submission.id, validateStatus: submission.validateStatus })
  
  if (!globalThis.window?.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to update submission')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
    tags: [
      { name: 'Action', value: 'UpdateSubmission' },
      { name: 'TaskPid', value: taskPid },
      { name: 'SubmissionID', value: submission.id.toString() }
    ],
    data: JSON.stringify(submission)
  })
}

/**
 * update all submissions of a task
 * @param taskPid 
 * @param submissions 
 * @returns 
 */
export const updateTaskSubmissions = async (taskPid: string, submissions: AllSubmissionWithCalculatedBounties[], wallet?: Wallet) => {
  console.log('update task submissions', submissions)
  if (!globalThis.window?.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to submit task')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
    tags: [
      { name: 'Action', value: 'UpdateTaskSubmissions' },
      { name: 'TaskPid', value: taskPid }
    ],
    data: JSON.stringify(submissions, bigintReplacer)
  })
}

/**
 * update task submission bounties
 * @param taskPid 
 * @param submissions
 * @returns 
 */
export const updateTaskSubmissionBounties = async (taskPid: string, submissions: AllSubmissionWithCalculatedBounties[], wallet?: Wallet) => {
  console.log('update task submission bounties', submissions)
  if (!globalThis.window?.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to update task submission bounties')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
    tags: [
      { name: 'Action', value: 'UpdateTaskSubmissionBounties' },
      { name: 'TaskPid', value: taskPid }
    ],
    data: JSON.stringify(submissions, bigintReplacer)
  })
}

/**
 * update invalid or validation error submission
 */
export const updateInvalidSubmission = async function({submissionId, taskPid, wallet, validateStatus, validateError}: {submissionId: number, taskPid: string, wallet?: Wallet, validateStatus: Submission['validateStatus'], validateError?: string}) {
  if (!validateStatus || !['invalid', 'validation_error'].includes(validateStatus)) {
    throw new Error('Invalid validate status')
  }
  const submission:Pick<Submission, 'id'|'validateStatus'|'validateError'|'validateTime'> = {
    id: submissionId,
    validateStatus,
    validateError,
    validateTime: new Date().getTime()
  }
  await updateSubmission(submission, taskPid, wallet)
}

/**
 * submit a task submission
 * @param submission 
 * @returns 
 */
export const submitTask = async (submission: Omit<AllSubmission, 'id'|'createTime'|'updateTime'>, 
  wallet?: Wallet) => {
  if (!globalThis.window?.arweaveWallet && !wallet) {
    throw new Error('Wallet is required to submit task')
  }
  return await messageResultCheck({
    process: taskManagerProcessID,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
    tags: [{ name: 'Action', value: 'AddSubmission' }],
    data: JSON.stringify(submission)
  })
}

export const getInvitesByInviter = async (inviter: string, type?: 'task' | 'community') => {
  const tags = [{ name: 'Action', value: 'GetInvitesByInviter' }, { name: 'Inviter', value: inviter }]
  if (type) {
    tags.push({ name: 'InviteType', value: type })
  }
  const data = await dryrunResult<string>({
    process: taskManagerProcessID,
    tags
  })

  return JSON.parse(data) as {
    invites: InviteCodeInfo[],
    relatedUsers: RelatedUserMap,
    relatedTasks: Record<string, Task>,
    relatedCommunities: Record<string, Community>
  }
}

export const getBountiesByCommunityID = async (communityUuid: string) => {
  return await dryrunResultParsed<(Bounty & {recipientName: string})[]>({
    process: taskManagerProcessID,
    tags: [{
      name: 'Action', value: 'GetBountiesByCommunityID'
    }, {
      name: 'CommunityUuid', value: communityUuid
    }]
  })
}