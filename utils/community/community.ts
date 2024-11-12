
import { DM_PROCESS_ID } from '~/utils/processID'
import type { Community } from '~/types'
import { extractResult } from '~/utils'

const aoCommunityProcessID = DM_PROCESS_ID
// Getting information about a specific community
export const getCommunity = async (uuid: string, address?: string) => {
  const tags = [
    { name: 'Action', value: 'GetCommunity' },
    { name: 'Uuid', value: uuid }
  ]
  if (address) {
    tags.push({ name: 'userAddress', value: address })
  }
  const result = await dryrun({
    process: aoCommunityProcessID,
    tags
  })

  const json = extractResult<string>(result)
  const res = JSON.parse(json) as Community

  return res
}