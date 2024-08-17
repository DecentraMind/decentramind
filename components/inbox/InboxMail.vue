<script setup lang="ts">
import { format, isToday } from 'date-fns'
import type { Mail, UserInfo } from '~/types'
import { nextTick } from 'vue'
import { useElementVisibility, watchDebounced } from '@vueuse/core'

const { chat: chatID } = $defineProps<{
  chat: string
}>()

const msgTop = ref(null)
const msgTopIsVisible = useElementVisibility(msgTop)

// load this process data list
// send msg
// auto load new message for this process and other process, so we can show last unread message on the left sidebar msg list
const { sendMessage, loadInboxList, mailCache } = $(inboxStore())
const { mutedUsers } = $(communityStore())
const { address } = $(aoStore())

const msgBottom = $ref<HTMLDivElement>()

let msg = $ref('')
let isSubmitting = $ref(false)

const loadedItemsCount = $computed(() => mailCache && mailCache[chatID] ? Object.keys(mailCache[chatID]).length : 0)

const scrollToBottom = () => {
  nextTick(() => {
    msgBottom && msgBottom.scrollIntoView({ behavior: 'smooth' })
  })
}

const submitMessage = async () => {
  if (isSubmitting || !mailCache) {
    console.log('cannot submit', {isLoading: isSubmitting, mailCache})
    return
  }
  isSubmitting = true

  if (!mailCache[chatID]) {
    mailCache[chatID] = []
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

  await sendMessage(chatID, msg)

  isSubmitting = false
  msg = ''
  await loadInboxList(chatID)
  scrollToBottom()
}

let isTopLoading = $ref(false)

watchDebounced(msgTopIsVisible, async () => {
  if (!msgTopIsVisible.value || isTopLoading || loadedItemsCount === 0) return

  isTopLoading = true
  await loadInboxList(chatID, 10, false)
  isTopLoading = false
})

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
  <div class="h-full">
    <div class="sticky">
      <div class="bg-background flex p-4 justify-between">
        <div class="flex gap-4 items-center">
          <div class="min-w-0">
            <!-- this area is for new message number button -->
            <p class="font-semibold text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>
    </div>
    <!--
    <div ref="msgTop" class="my-5">
      &nbsp;
      <div v-show="isTopLoading" class="flex py-10 items-center justify-center">
        <Loading class="h-8 w-8" />
      </div>
    </div>
    -->
    <div class="h-screen flex flex-col justify-between pt-10 pb-10">
      <div class="overflow-y-auto h-5/6 flex flex-col-reverse" style="-ms-overflow-style: none; scrollbar-width: none;">
        <!--<InboxListMessage :id="chatID" @loaded="scrollToBottom" />-->
        <InboxListMessage :id="chatID" />
      </div>
      <div ref="msgBottom" class="" />
      <div class="bottom-4 sticky mt-2">
        <form @submit.prevent="submitMessage">
          <UTextarea
            v-model="msg"
            :disabled="isTextareaDisabled"
            name="msg"
            color="gray"
            required
            size="xl"
            :rows="5"
            placeholder="Reply to test"
          >
            <!-- <Loading v-show="isLoading" class="h-8 top-1/2 left-1/2 w-8 absolute" /> -->
            <UButton
              :disabled="isTextareaDisabled"
              type="submit"
              color="black"
              label="Send"
              icon="i-heroicons-paper-airplane"
              class="right-3.5 bottom-2.5 absolute"
            />
          </UTextarea>
        </form>
      </div>
    </div>
  </div>
</template>
