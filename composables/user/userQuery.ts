import { createQueryComposable } from '~/utils/query.client'
import { getUserByAddress } from '~/utils/community/community'
import type { UserInfo } from '~/types'

/**
 * 获取用户信息的查询
 *
 * @param address 用户地址
 * @returns 用户信息查询结果
 */
export const useUserInfoQuery = createQueryComposable<string, UserInfo>(
  ['user', 'getUserByAddress'],
  getUserByAddress
)