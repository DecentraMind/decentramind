import { DM_PROCESS_ID } from '~/utils/processID'
import type { Community } from '~/types'
import { dryrunResultParsed } from '~/utils/ao'

const aoCommunityProcessID = DM_PROCESS_ID

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
    process: aoCommunityProcessID,
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
  return await dryrunResultParsed({ process: aoCommunityProcessID, tags }) as string[]
}