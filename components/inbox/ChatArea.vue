<script setup lang="ts">
import { nextTick } from 'vue'
import MessageList from './MessageList.vue'
import Loading from '../Loading.vue'
import { inboxStore } from '~/stores/inboxStore'
import { communityStore } from '~/stores/communityStore'
import { aoStore } from '~/stores/aoStore'
import { notificationStore } from '~/stores/notificationStore'

const { chat: chatID } = $defineProps<{
  chat: string
}>()

// load this process data list
// send msg
// auto load new message for this process and other process, so we can show last unread message on the left sidebar msg list
const { sendMessage, loadInboxList, isInboxLoading, mailCache } = $(inboxStore())
const { mutedUsers } = $(communityStore())
const { address } = $(aoStore())
const { showError } = $(notificationStore())


const listBottom = $ref<HTMLDivElement>()

const listTop = ref<HTMLElement | null>(null)
let stopObserver: (() => void) | undefined

onMounted(async () => {
  await loadInboxList(chatID, 10, false)
  const { stop } = useIntersectionObserver(
    listTop,
    async ([{ isIntersecting }]) => {
      if (!isIntersecting || isInboxLoading) return
      
      console.log('listTop isIntersecting', isIntersecting)
      await loadInboxList(chatID, 10, false)
    }
  )
  
  stopObserver = stop
})

onUnmounted(() => {
  if (stopObserver) {
    stopObserver()
  }
})

let msg = $ref('')
let isSubmitting = $ref(false)

const scrollToBottom = () => {
  console.log('scrollToBottom')
  nextTick(() => {
    listBottom && listBottom.scrollIntoView({ behavior: 'smooth' })
  })
}

const submitMessage = async () => {
  if (isSubmitting || !mailCache) {
    console.log('cannot submit', {isLoading: isSubmitting, mailCache})
    return
  }
  isSubmitting = true

  if (!mailCache[chatID]) {
    mailCache[chatID] = {}
  }
  // show pending status
  mailCache[chatID][999999] = {
    id: 999999,
    isPending: true,
    Timestamp: Date.now(),
    From: address,
    Data: msg,
  }
  scrollToBottom()

  try {
    await sendMessage(chatID, msg)
    msg = ''
  } catch (e) {
    console.error(e)
    showError('Failed to send message.', e as Error)
  } finally {
    isSubmitting = false
  }

  await loadInboxList(chatID)
  scrollToBottom()
}

defineShortcuts({
  meta_enter: {
    usingInput: 'msg',
    handler: submitMessage,
  },
})

const isTextareaDisabled = computed(() => {
  return (
    isSubmitting ||
    (mutedUsers && mutedUsers.includes(address))
  )
})
</script>

<template>
  <div class="w-full h-full">
    <div class="h-[calc(var(--header-height))] bg-background flex p-4 justify-between">
      <div class="flex gap-4 items-center">
        <div class="min-w-0">
          <!-- this area is for new message number button -->
          <p class="font-semibold text-gray-900 dark:text-white" />
        </div>
      </div>
    </div>

    <div class="relative h-[calc(100vh-var(--header-height)-var(--header-height))] flex flex-col justify-between pt-0 pb-4">
      <div class="overflow-y-auto h-[calc(100%-160px)] flex flex-col-reverse">
        <div ref="listBottom" class="h-0" />

        <MessageList :pid="chatID" />

        <div ref="listTop" class="w-full min-h-1 h-fit flex py-3 items-center justify-center">
          <Loading v-show="isInboxLoading" class="h-8 w-8" />
        </div>
      </div>

      <div class="sticky px-3">
        <form @submit.prevent="submitMessage">
          <UTextarea
            v-model.trim="msg"
            :disabled="isTextareaDisabled"
            name="msg"
            color="gray"
            required
            size="xl"
            :rows="5"
            placeholder="Send a message to chatroom"
          >
            <!-- <Loading v-show="isLoading" class="h-8 top-1/2 left-1/2 w-8 absolute" /> -->
            <UButton
              :disabled="isTextareaDisabled"
              :loading="isSubmitting"
              type="submit"
              color="black"
              label="Send"
              icon="i-heroicons-paper-airplane"
              class="right-2.5 bottom-2.5 absolute"
            />
          </UTextarea>
        </form>
      </div>
    </div>
  </div>
</template>
