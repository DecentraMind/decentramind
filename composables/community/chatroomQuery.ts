import { createQueryComposable, createQueuedFetcher } from '~/utils/query.client'
import { checkInbox, getChatroomInboxCount, getMutedUsers } from '~/utils/community/chatroom'

export const useInboxCountQuery = createQueryComposable(
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