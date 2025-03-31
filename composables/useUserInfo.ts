import { readonly } from 'vue'
import { createSharedComposable, computedAsync } from '@vueuse/core'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { useUserInfoQuery } from '~/composables/user/userQuery'
import { useQueryClient } from '@tanstack/vue-query'
import type { Community } from '~/types'
import { getCommunities } from '~/utils/community/community'

const useUserInfoBase = () => {
  const { address } = $(aoStore())
  const { currentUuid } = $(communityStore())
  const queryClient = useQueryClient()

  const {
    data: userInfo,
    isLoading,
    error: queryError,
    refetch
  } = useUserInfoQuery(address || '', {
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取数据
  })

  // TODO move this to communityStore
  const currentCommunity = computedAsync(async () => {
    const communities = await queryClient.fetchQuery<Community[]>({
      queryKey: ['community', 'communities', address],
      queryFn: async () => await getCommunities(address)
    })
    const community = communities.find(community => community.uuid === currentUuid)
    // console.log('useUserInfo: currentCommunity', community)
    return community
  })


  // 检查当前用户是否是社区所有者
  const isCurrentCommunityOwner = computed(() => {
    if (!currentCommunity.value || !address) return false
    return currentCommunity.value.owner === address
  })

  // 检查当前用户是否是社区管理员
  const isCurrentCommunityAdmin = computed(() => {
    if (!currentCommunity.value || !address) return false
    return currentCommunity.value.admins?.includes(address) || false
  })

  // 转换错误格式以保持与原有API兼容
  const error = computed(() => {
    if (!queryError.value) return null
    return queryError.value.message || '获取用户信息时发生错误'
  })

  const refetchUserInfo = () => {
    return refetch()
  }

  return {
    userInfo: readonly(userInfo),
    address,
    isLoading,
    error,
    refetchUserInfo,
    isCurrentCommunityOwner,
    isCurrentCommunityAdmin
  }
}

export const useUserInfo = createSharedComposable(useUserInfoBase)
