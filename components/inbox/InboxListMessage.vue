<script setup lang="ts">
import type { MailCache } from '~/types'
import { cn } from '~/utils/util'
import { chatroomFetchInterval } from '~/utils/constants'

const { pid } = $defineProps<{
  pid: string, // process id
}>()

import audioFile from '@/assets/notify.mp3' // Adjust the path accordingly
const notifySound = new Audio(audioFile)

const emitLoaded = defineEmit('loaded')

const { state, mailCache, loadInboxList, isInboxLoading: isLoading, getInboxCount } = $(inboxStore())
const { currentCommunityUserMap: userMap } = $(communityStore())

const { address } = $(aoStore())
const items = $computed(() => {
  return mailCache ? useSortBy(useFilter(mailCache[pid], item => !!item.Data), item => parseInt(item.index)) : []
})

const doLoadMore = async () => {
  if (!pid) return

  await loadInboxList(pid, 10)
  emitLoaded()
}
watchEffect(doLoadMore)

let interval: ReturnType<typeof setInterval>
onMounted(async () => {
  //await getActiveAddress()
  interval = setInterval(async () => {
    const oldCount = state[pid].inboxCount
    const newCount = await getInboxCount(pid, true)
    if (oldCount && oldCount < newCount) {
      notifySound.play()
    }
  }, chatroomFetchInterval)
})

onUnmounted(() => {
  clearInterval(interval)
})

const isSelf = (item: MailCache) => item.From === address

const getUserName = (from: string) => {
  const user = userMap?.[from]
  return user?.name || shortAddress(from)
}

const getUserAvatar = (from: string) => {
  const user = userMap?.[from]
  return user ? arUrl(user.avatar) : arUrl(defaultUserAvatar)
}

</script>
<template>
  <div class="space-y-5 h-[calc(100vh-5rem)] overflow-y-auto pl-3">
    <!--
    <UButton @click="test">test</UButton>
    <InboxNewBtn />
    -->
    <div v-for="item in items" :key="item.id" class="flex gap-2.5 items-start pr-2" :class="isSelf(item) ? 'flex-row-reverse' : ''">
      <!--<DicebearAvatar :seed="item.From" class="rounded-full h-8 w-8" size="lg" />-->
      <UAvatar :src="getUserAvatar(item.From)" :alt="getUserName(item.From)" size="md" class="mt-0.5" />

      <div class="flex flex-col w-fit max-w-[76%]">
        <div :class="cn('flex space-x-2 items-center rtl:space-x-reverse', {'flex-row-reverse': isSelf(item)})">
          <span class="font-medium text-base text-primary dark:text-white">{{ getUserName(item.From) }}</span>
          <TimeAgo class="font-normal text-sm text-gray-500 dark:text-gray-400" :time="item.Timestamp" />
        </div>
        <div class="flex flex-col bg-gray-100 border-gray-200 p-2 leading-1.5 dark:bg-gray-700" :class="isSelf(item) ? 'rounded-s-md rounded-ee-md' : 'rounded-e-md rounded-es-md'">
          <p class="font-normal text-sm text-gray-900 dark:text-white break-words"> {{ item.Data }}</p>
        </div>
        <span v-if="item.isPending" class="flex font-normal text-sm text-gray-500 justify-start items-center dark:text-gray-400">
          <Loading class="h-5 mr-2 w-5" />
          Pending...
        </span>
      </div>
    </div>
    <div v-show="isLoading" class="flex py-10 items-center justify-center">
      <Loading class="h-8 w-8" />
    </div>
  </div>
</template>
<style>
/* Example of using Tailwind's theme function for colors */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: theme('colors.gray.200');
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: theme('colors.gray.50');
}
</style>
