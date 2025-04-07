import { createQueryComposable } from '~/utils/query.client'
import { getTasksByCommunityUuid, getTask, getBountiesByCommunityID, getInvitesByInviter, getBountiesByAddress, getTasksByOwner } from '~/utils/task'

export const useGetTaskQuery = createQueryComposable(['tasks', 'getTask'], getTask)

export const useTasksByCommunityUuidQuery = createQueryComposable(['tasks', 'getTasksByCommunityUuid'], getTasksByCommunityUuid)

export const useGetBountiesByCommunityIDQuery = createQueryComposable(['tasks', 'getBountiesByCommunityID'], getBountiesByCommunityID)

export const useGetInvitesByInviterQuery = createQueryComposable(['tasks', 'getInvitesByInviter'], getInvitesByInviter)

export const useGetBountiesByAddressQuery = createQueryComposable(['tasks', 'getBountiesByAddress'], getBountiesByAddress)

export const useGetTasksByOwnerQuery = createQueryComposable(['tasks', 'getTasksByOwner'], getTasksByOwner)