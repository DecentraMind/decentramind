import { dryrunResultTags } from '~/utils/ao'
import { communityProcessID } from '~/utils/community/community'

export const getChatroomInboxCount = async (process: string) => {
  const res = await dryrunResultTags<{ inboxCount: string }>({
    process,
    tags: [
      { name: 'Action', value: '#Inbox' },
    ],
    data: '#Inbox',
  })
  return res.inboxCount
}

export const getMutedUsers = async (communityUuid: string) => {
  if (!communityUuid) {
    throw new Error('No communityUuid specified.')
  }
  return await dryrunResultParsed<string[]>({
    process: communityProcessID,
    tags: [
      { name: 'Action', value: 'GetMutedUsers' },
      { name: 'CommunityUuid', value: communityUuid }
    ]
  })
}