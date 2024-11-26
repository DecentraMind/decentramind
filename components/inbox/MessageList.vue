<script setup lang="ts">
import type { MailCache } from '~/types'
import { cn, shortString } from '~/utils'
import TimeAgo from '../TimeAgo.vue'
import Loading from '../Loading.vue'
import audioFile from '@/assets/notify.mp3'

const notifySound = new Audio(audioFile)

const runtimeConfig = useRuntimeConfig()

const { pid } = $defineProps<{
  pid: string, // process id
}>()

const { state, mailCache, getInboxCount } = $(inboxStore())
const { currentCommunityUserMap: userMap } = $(communityStore())

const { address } = $(aoStore())
const messages = $computed(() => {
  return mailCache ? useSortBy(useFilter(mailCache[pid], item => !!item.Data), item => item.index) : []
})

let interval: ReturnType<typeof setInterval>
onMounted(async () => {
  interval = setInterval(async () => {
    const oldCount = state[pid].inboxCount
    const newCount = await getInboxCount(pid, true)
    if (oldCount && oldCount < newCount) {
      notifySound.play()
    }
  }, runtimeConfig.public.chatroomFetchInterval || 5000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const isSelf = (item: MailCache) => item.From === address

const getUserName = (from: string) => {
  const user = userMap?.[from]
  return user?.name || shortString(from)
}

const getUserAvatar = (from: string) => {
  const user = userMap?.[from]
  return user ? user.avatar : defaultUserAvatar
}

function bubbleClasses(message: MailCache) {
  return cn(
    'flex flex-col bg-gray-100 border-gray-200 py-2 px-3 leading-1.5 dark:bg-gray-700',
    {
      'rounded-s-md rounded-ee-md': isSelf(message),
      'rounded-e-md rounded-es-md': !isSelf(message),
    }
  )
}

function bubbleContainerClasses(message: MailCache) {
  return cn('group w-full flex justify-between items-center', {
    'flex-row-reverse' : isSelf(message),
  })
}
</script>
<template>
  <div class="space-y-5 h-fit pl-3">
    <div
      v-for="(message, index) in messages"
      :key="message.index"
      :data-index="message.index?.toString()"
      :class="cn('flex gap-2.5 items-start pr-2', {
        'flex-row-reverse' : isSelf(message),
        '!mt-1.5 gap-[14px]': index > 0 && message.From == messages[index - 1].From
      })"
    >
      <!--<DicebearAvatar :seed="item.From" class="rounded-full h-8 w-8" size="lg" />-->
      <ArAvatar
        v-if="index === 0 || message.From !== messages[index - 1].From"
        :src="getUserAvatar(message.From)"
        :alt="getUserName(message.From)"
        size="md"
        class="mt-0.5"
      />
      <div v-else class="w-10" />

      <div :class="cn('flex flex-col w-full', {'items-end': isSelf(message), 'items-start': !isSelf(message)})">
        <div v-if="index === 0 || message.From !== messages[index - 1].From" :class="cn('flex space-x-2 items-center rtl:space-x-reverse', {'flex-row-reverse': isSelf(message)})">
          <span class="font-medium text-base text-primary dark:text-white">{{ getUserName(message.From) }}</span>
          <span v-if="message.isPending" class="flex font-normal text-sm text-gray-500 justify-start items-center dark:text-gray-400">
            <Loading class="h-5 mr-2 w-5" />
          </span>
        </div>
        <div :class="bubbleContainerClasses(message)">
          <div :class="bubbleClasses(message)">
            <p class="font-normal text-base text-gray-900 dark:text-white break-all">{{ message.Data }}</p>
          </div>
          <div :class="cn('flex items-center', {'flex-row-reverse': !isSelf(message)})">
            <div class="invisible w-12" />
            <TimeAgo class="invisible group-hover:visible min-w-28 font-normal text-sm text-gray-300 dark:text-gray-400" :msg="message.Data" :time="message.Timestamp" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
