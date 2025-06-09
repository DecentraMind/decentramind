import { createQueryComposable, createQueuedFetcher } from '~/utils/query.client'
import { getUserByAddress } from '~/utils/community/community'
import { getVouchData } from '~/utils/user/vouch.client'
import type { UserInfo } from '~/types'

export const useUserInfoQuery = createQueryComposable<string, UserInfo>(
  ['user', 'getUserByAddress'],
  getUserByAddress
)

export const useUserInfoFetcher = createQueuedFetcher(['user', 'getUserByAddress'], getUserByAddress)

export const useVouchDataQuery = createQueuedFetcher(
  ['user', 'vouchData'],
  getVouchData
)