import { ref, readonly } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { communityStore } from '~/stores/communityStore'
import { aoStore } from '~/stores/aoStore'
import type { UserInfo } from '~/types'

const useUserInfoBase = () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const { getUserByAddress } = communityStore()
  const { address } = $(aoStore())

  const fetchUserInfo = async () => {
    if (!address) {
      error.value = 'No address available'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const fetchedUserInfo = await getUserByAddress(address)
      userInfo.value = fetchedUserInfo
    } catch (e) {
      console.error('Error fetching user info:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred while fetching user info'
    } finally {
      isLoading.value = false
    }
  }

  const refetchUserInfo = () => {
    error.value = null
    userInfo.value = null
    return fetchUserInfo()
  }

  if (!userInfo.value && !isLoading.value && !error.value) {
    fetchUserInfo()
  }

  return {
    userInfo: readonly(userInfo),
    isLoading,
    error,
    refetchUserInfo
  }
}

export const useUserInfo = createSharedComposable(useUserInfoBase)
