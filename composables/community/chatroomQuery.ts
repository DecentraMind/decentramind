import { createQueryComposable } from '~/utils/query.client'
import { getChatroomInboxCount, getMutedUsers } from '~/utils/community/chatroom'

export const useInboxCountQuery = createQueryComposable(
  ['chatroom', 'inboxCount'],
  getChatroomInboxCount
)

export const useMutedUsersQuery = createQueryComposable(
  ['chatroom', 'mutedUsers'],
  getMutedUsers
)