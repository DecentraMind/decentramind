import { readonly } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { useUserInfoQuery } from '~/composables/user/userQuery'

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
    isLoading,
    error,
    refetchUserInfo
  }
}

export const useUserInfo = createSharedComposable(useUserInfoBase)
