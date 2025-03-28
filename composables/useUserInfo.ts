import { readonly } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { useUserInfoQuery } from '~/composables/user/userQuery'
import { useCommunityFromCommunitiesQuery } from '~/composables/community/communityQuery'

const useUserInfoBase = () => {
  const { address } = $(aoStore())
  const { currentUuid } = $(communityStore())

  const {
    data: userInfo,
    isLoading,
    error: queryError,
    refetch
  } = useUserInfoQuery(address || '', {
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取数据
  })

  // 获取当前社区信息
  const { data: currentCommunity } = useCommunityFromCommunitiesQuery(currentUuid || '', address, {
    enabled: !!currentUuid && !!address
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
