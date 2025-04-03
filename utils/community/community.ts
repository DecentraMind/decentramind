import { DM_PROCESS_ID } from '~/utils/processID'
import type { Board, Community, CommunityMember, Log, PrivateApplication, PrivateAreaConfig, PrivateAreaConfigWithoutRelations, PrivateTask, PrivateUnlockMember, UserInfo } from '~/types'
import { dryrunResultParsed, messageResultCheck, createDataItemSigner, type Wallet } from '~/utils/ao'

export const communityProcessID = DM_PROCESS_ID

/**
 * Get information about a specific community
 * @param uuid - The UUID of the community
 * @param address - The address of the user
 * @returns The community information
 */
export const getCommunity = async (uuid: string, address?: string) => {
  const tags = [
    { name: 'Action', value: 'GetCommunity' },
    { name: 'Uuid', value: uuid }
  ]
  if (address) {
    tags.push({ name: 'userAddress', value: address })
  }
  return await dryrunResultParsed({
    process: communityProcessID,
    tags
  }) as Community
}

export const getCommunities = async (address?: string) => {
  const tags = [
    { name: 'Action', value: 'GetCommunities' }
  ]
  if (address) {
    tags.push({ name: 'userAddress', value: address })
  }
  const data = await dryrunResult<string>({
    process: communityProcessID,
    tags
  })
  return JSON.parse(data) as Community[]
}

export const join = async (communityUuid: string, inviteCode?: string, wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'Join' },
    { name: 'CommunityUuid', value: communityUuid },
  ]
  if (inviteCode) {
    tags.push({ name: 'InviteCode', value: inviteCode })
  }
  const result = await messageResultCheck({
    process: communityProcessID,
    tags,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet)
  })
  return result
}

/**
 * Update the private applicable status of a specific community
 * @param uuid - The UUID of the community
 * @param applicable - The new private applicable status
 */
export const updatePrivateApplicable = async (uuid: string, applicable: boolean, wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'UpdateIsPrivateApplicable' },
    { name: 'CommunityUuid', value: uuid },
    { name: 'Applicable', value: applicable.toString() }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Get questions of a specific community
 * @param uuid - The UUID of the community
 * @returns The questions
 */
export const getQuestions = async (uuid: string) => {
  const tags = [
    { name: 'Action', value: 'GetQuestions' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await dryrunResultParsed({ process: communityProcessID, tags }) as string[]
}

/**
 * Update questions of a specific community
 * @param uuid - The UUID of the community
 * @param questions - The new questions to save
 */
export const updateQuestions = async (uuid: string, questions: string[], wallet?: Wallet) => {
  console.log('updateQuestions', uuid, JSON.stringify(questions))
  const tags = [
    { name: 'Action', value: 'UpdateQuestions' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    data: JSON.stringify(questions),
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Submit answers for private area application
 * @param uuid - The UUID of the community
 * @param answers - Array of answers to the application questions
 */
export const submitAnswers = async (uuid: string, answers: string[], wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'SubmitAnswers' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    data: JSON.stringify(answers),
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Get members who have access to private area
 * @param uuid - The UUID of the community
 * @returns Array of member addresses who have private area access
 */
export const getPrivateUnlockMembers = async (uuid: string) => {
  const tags = [
    { name: 'Action', value: 'GetPrivateUnlockMembers' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await dryrunResultParsed<PrivateUnlockMember[]>({
    process: communityProcessID,
    tags
  })
}

/**
 * Get pending applications for private area
 * @param uuid - The UUID of the community
 * @returns Array of applicant addresses
 */
export const getApplications = async (uuid: string) => {
  const tags = [
    { name: 'Action', value: 'GetApplications' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await dryrunResultParsed<PrivateApplication[]>({
    process: communityProcessID,
    tags
  })
}

/**
 * Approve or reject a pending application for private area
 * @param uuid - The UUID of the community
 * @param address - The address of the applicant
 * @param action - Whether to approve or reject the application
 */
export const approveOrRejectApplication = async (uuid: string, address: string, operation: 'approve' | 'reject', wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'ApproveOrRejectApplication' },
    { name: 'CommunityUuid', value: uuid },
    { name: 'Address', value: address },
    { name: 'Operation', value: operation }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Remove a member's private area access
 * @param uuid - The UUID of the community
 * @param address - The address of the member to remove
 */
export const removePrivateUnlockMember = async (uuid: string, address: string, reason: string, wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'RemovePrivateUnlockMember' },
    { name: 'CommunityUuid', value: uuid },
    { name: 'Address', value: address },
    { name: 'Reason', value: reason }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Get logs for a specific community
 * @param uuid - The UUID of the community
 * @returns Array of logs
 */
export const getLogs = async (uuid: string) => {
  const tags = [
    { name: 'Action', value: 'GetLogs' },
    { name: 'CommunityUuid', value: uuid }
  ]
  return await dryrunResultParsed<Log[]>({
    process: communityProcessID,
    tags
  })
}

/**
 * Get the private area config for a specific community
 * @param uuid - The UUID of the community
 * @returns The private area config
 */
export const getPrivateAreaConfig = async (uuid: string) => {
  const tags = [
    { name: 'Action', value: 'GetPrivateAreaConfig' },
    { name: 'CommunityUuid', value: uuid }
  ]
  const result = await dryrunResultParsed<PrivateAreaConfig>({
    process: communityProcessID,
    tags
  })
  console.log('getPrivateAreaConfig', result)
  return result
}

/**
 * Enable community creation for a specific address
 * @param address - The address to enable community creation for
 */
export const enableCommunityCreation = async (address: string, wallet?: Wallet) => {
  const tags = [
    { name: 'Action', value: 'EnableCommunityCreation' },
    { name: 'Address', value: address }
  ]
  return await messageResultCheck({
    process: communityProcessID,
    tags,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function updatePrivateAreaConfig(communityUuid: string, config: PrivateAreaConfigWithoutRelations, wallet?: Wallet) {
  const jsonString = JSON.stringify(config)
  return await messageResultParsed<PrivateAreaConfigWithoutRelations>({
    process: communityProcessID,
    tags: [{ name: 'Action', value: 'UpdatePrivateAreaConfig' }, { name: 'CommunityUuid', value: communityUuid }],
    data: jsonString,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function addBoard(communityUuid: string, title: string, wallet?: Wallet) {
  return await messageResultParsed<string>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'AddBoard' },
      { name: 'CommunityUuid', value: communityUuid },
      { name: 'Title', value: title }
    ],
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function updateBoardTitle(boardUuid: string, title: string, wallet?: Wallet) {
  return await messageResultParsed<Board>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'UpdateBoardTitle' },
      { name: 'BoardUuid', value: boardUuid },
      { name: 'Title', value: title }
    ],
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export const getPrivateTask = async (taskUuid: string) => {
  const task = await dryrunResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [{ name: 'Action', value: 'GetPrivateTask' }, { name: 'TaskUuid', value: taskUuid }],
  })
  return task
}

export async function addPrivateTask(task: PrivateTask, wallet?: Wallet) {
  const jsonString = JSON.stringify(task)
  return await messageResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'AddPrivateTask' }
    ],
    data: jsonString,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function getUserByAddress(address: string) {
  return await dryrunResultParsed<UserInfo>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'GetUserByAddress' },
      { name: 'Address', value: address }
    ]
  })
}

export async function saveProposal(task: PrivateTask, wallet?: Wallet) {
  const jsonString = JSON.stringify(task)
  return await messageResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [{ name: 'Action', value: 'SaveProposal' }],
    data: jsonString,
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function deleteProposal(taskUuid: string, wallet?: Wallet) {
  return await messageResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'DeleteProposal' },
      { name: 'TaskUuid', value: taskUuid }
    ],
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function updatePrivateTaskStatus(taskUuid: string, operation: 'approve' | 'reject', wallet?: Wallet) {
  return await messageResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'UpdatePrivateTaskStatus' },
      { name: 'TaskUuid', value: taskUuid },
      { name: 'Operation', value: operation }
    ],
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

export async function updateSettleTx(taskUuid: string, budgetIndex: number, settleTx: string, wallet?: Wallet) {
  return await messageResultParsed<PrivateTask>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'UpdateSettleTx' },
      { name: 'TaskUuid', value: taskUuid },
      { name: 'BudgetIndex', value: budgetIndex.toString() },
      { name: 'SettleTx', value: settleTx },
    ],
    signer: createDataItemSigner(wallet || globalThis.window.arweaveWallet),
  })
}

/**
 * Get joined users of a community.
 * */
export const getCommunityUser = async (communityUuid: string) => {
  const communityUserMap = await dryrunResultParsed<Record<string, CommunityMember>>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'GetUsersByCommunityUUID' },
      { name: 'CommunityUuid', value: communityUuid }
    ],
  })

  return communityUserMap
}