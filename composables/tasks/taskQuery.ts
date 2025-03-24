import { createQueryComposable } from '~/utils/query.client'
import { getTasksByCommunityUuid } from '~/utils/task'

export const useTasksByCommunityUuidQuery = createQueryComposable(['tasks', 'getTasksByCommunityUuid'], getTasksByCommunityUuid)
