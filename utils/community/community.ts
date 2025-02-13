import { DM_PROCESS_ID } from '~/utils/processID'
import type { Community } from '~/types'
import { dryrunResultParsed, messageResultCheck, createDataItemSigner } from '~/utils/ao'

const communityProcessID = DM_PROCESS_ID

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
export const updateQuestions = async (uuid: string, questions: string[], wallet?: Parameters<typeof createDataItemSigner>[0]) => {
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
export const submitAnswers = async (uuid: string, answers: string[], wallet?: Parameters<typeof createDataItemSigner>[0]) => {
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