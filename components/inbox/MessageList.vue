<script setup lang="ts">
import type { MailCache } from '~/types'
import { cn, shortString } from '~/utils'
import TimeAgo from '../TimeAgo.vue'
import Loading from '../Loading.vue'
import audioFile from '@/assets/notify.mp3'
import { formatEnglishDate } from '~/utils/time'
import { inboxStore } from '~/stores/inboxStore'
import { communityStore } from '~/stores/communityStore'
import { aoStore } from '~/stores/aoStore'
import { sortBy, filter } from 'lodash-es'

const notifySound = new Audio(audioFile)

const runtimeConfig = useRuntimeConfig()

const { pid } = $defineProps<{
  pid: string, // process id
}>()

const { mailCache, loadInboxList, updateInboxCount, getLatestIndexCount } = $(inboxStore())
const { currentCommunityUserMap: userMap } = $(communityStore())

const { address } = $(aoStore())

// Group messages by date
const groupedMessages = $computed(() => {
  if (!mailCache || !mailCache[pid]) return []
  
  const sortedMessages = sortBy(filter(mailCache[pid], item => !!item.Data), item => item.index)
  const groups: { date: string; messages: MailCache[] }[] = []
  
  sortedMessages.forEach((message) => {
    const messageDate = formatEnglishDate(message.Timestamp)
    const lastGroup = groups[groups.length - 1]
    
    if (!lastGroup || lastGroup.date !== messageDate) {
      groups.push({ date: messageDate, messages: [message] })
    } else {
      lastGroup.messages.push(message)
    }
  })
  
  return groups
})

let interval: ReturnType<typeof setInterval>
onMounted(async () => {
  interval = setInterval(async () => {
    const oldCount = await getLatestIndexCount(pid)
    const newCount = await updateInboxCount(pid)
    if (oldCount && oldCount < newCount) {
      console.log('load new message')
      await loadInboxList(pid)
      if (mailCache[pid][newCount].From === address) return
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
    <template v-for="group in groupedMessages" :key="group.date">
      <!-- Date Separator -->
      <div class="flex items-center justify-center my-6">
        <span class="px-4 py-1 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 rounded-full">
          {{ group.date }}
        </span>
      </div>
      
      <!-- Messages -->
      <div
        v-for="(message, index) in group.messages"
        :key="message.index"
        :data-index="message.index?.toString()"
        :class="cn('flex gap-2.5 items-start pr-2', {
          'flex-row-reverse' : isSelf(message),
          '!mt-1.5 gap-[14px]': index > 0 && message.From == group.messages[index - 1].From
        })"
      >
        <ArAvatar
          v-if="index === 0 || message.From !== group.messages[index - 1].From"
          :src="getUserAvatar(message.From)"
          :alt="getUserName(message.From)"
          size="md"
          class="mt-0.5"
        />
        <div v-else class="w-10" />

        <div :class="cn('flex flex-col w-full', {'items-end': isSelf(message), 'items-start': !isSelf(message)})">
          <div v-if="index === 0 || message.From !== group.messages[index - 1].From" :class="cn('flex space-x-2 items-center rtl:space-x-reverse', {'flex-row-reverse': isSelf(message)})">
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
    </template>
  </div>
</template>
