import { readonly } from 'vue'
import { createSharedComposable, computedAsync } from '@vueuse/core'
import { aoStore } from '~/stores/aoStore'
import { communityStore } from '~/stores/communityStore'
import { useCommunityFetcher } from '~/composables/community/communityQuery'
import { useUserInfoFetcher, useUserInfoQuery } from '~/composables/user/userQuery'
import type { UserInfo } from '~/types'

const useUserInfoBase = () => {
  const { address } = $(aoStore())
  const { currentUuid } = $(communityStore())
  // TODO fix bug: userInfo is null after default layout hot reload
  const userInfo = ref<UserInfo>()
  const fetchUserInfo = useUserInfoFetcher()
  const fetchCommunity = useCommunityFetcher()

  // 使用计算属性来确保地址变化时查询会重新执行
  const currentAddress = computed(() => address)

  console.log('useUserInfo: address', currentAddress.value)
  const {
    data,
    isLoading,
    error: queryError,
    isSuccess
  } = useUserInfoQuery(currentAddress.value, {
    enabled: !!currentAddress.value,
    staleTime: 0, // 立即重新获取数据
  })
  watch(isSuccess, () => {
    if (isSuccess.value && data.value) {
      userInfo.value = data.value
    }
  })

  // TODO move this to communityStore
  const currentCommunity = computedAsync(async () => {
    const community = currentUuid ? await fetchCommunity(currentUuid) : null
    // console.log('useUserInfo: currentCommunity', community)
    return community
  })


  // 检查当前用户是否是社区所有者
  const isCurrentCommunityOwner = computed(() => {
    if (!currentCommunity.value || !currentAddress.value) return false
    return currentCommunity.value.owner === currentAddress.value
  })

  // 检查当前用户是否是社区管理员
  const isCurrentCommunityAdmin = computed(() => {
    if (!currentCommunity.value || !currentAddress.value) return false
    return currentCommunity.value.admins?.includes(currentAddress.value) || false
  })

  // 转换错误格式以保持与原有API兼容
  const error = computed(() => {
    if (!queryError.value) return null
    return queryError.value.message || '获取用户信息时发生错误'
  })

  const refetchUserInfo = async () => {
    const data = await fetchUserInfo(currentAddress.value)
    userInfo.value = data
  }

  return {
    userInfo: readonly(userInfo),
    address: currentAddress,
    isLoading,
    error,
    refetchUserInfo,
    isCurrentCommunityOwner,
    isCurrentCommunityAdmin
  }
}

export const useUserInfo = createSharedComposable(useUserInfoBase)
