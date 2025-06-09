import { createQueryComposable, createQueuedFetcher } from '~/utils/query.client'
import { checkInbox, getChatroomInboxCount, getMutedUsers } from '~/utils/community/chatroom'

export const useInboxCountQuery = createQueuedFetcher(
  ['chatroom', 'inboxCount'],
  getChatroomInboxCount
)

export const useMutedUsersQuery = createQueryComposable(
  ['chatroom', 'mutedUsers'],
  getMutedUsers
)

export const useCheckInboxQuery = createQueuedFetcher(
  ['chatroom', 'checkInbox'],
  checkInbox
)