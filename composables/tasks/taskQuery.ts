import { createQueryComposable } from '~/utils/query.client'
import { getTasksByCommunityUuid } from '~/utils/task'

export const useTasksByCommunityUuidQuery = createQueryComposable(['tasks', 'getTasksByCommunityUuid'], getTasksByCommunityUuid)

export const useGetBountiesByCommunityIDQuery = createQueryComposable(['tasks', 'getBountiesByCommunityID'], getBountiesByCommunityID)