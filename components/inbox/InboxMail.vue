<script setup lang="ts">
import { format, isToday } from 'date-fns'
import type { Mail } from '~/types'
import { nextTick } from 'vue'
import { useElementVisibility, watchDebounced } from '@vueuse/core'

const { mail } = $defineProps<{
  mail: string,
}>()


const msgTop = ref(null)
const msgTopIsVisible = useElementVisibility(msgTop)

// load this process data list
// send msg
// auto load new message for this process and other process, so we can show last unread message on the left sidebar msg list
const { sendMessage, loadInboxList, itemsCache } = $(inboxStore())
const { showSuccess } = $(notificationStore())
const { address } = $(arweaveWalletStore())

const msgBottom = $ref(null)

let msg = $ref('')
let isLoading = $ref(false)

const loadedItemsCount = $computed(() => Object.keys(itemsCache[chatID]).length)
const scrollToBottom = () => {
  nextTick(() => {
    msgBottom.scrollIntoView({ behavior: 'smooth' })
  })
}

const doSubmit = async () => {
  if (isLoading) return
  isLoading = true

  // show pending status
  itemsCache[chatID][999999] = {
    id: 999999,
    isPending: true,
    Timestamp: Date.now(),
    From: address,
    Data: msg,
  }
  scrollToBottom()

  await sendMessage(chatID, msg)
  showSuccess('Send message succeed!')
  isLoading = false
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
    handler: doSubmit
  }
})

const route = useRoute()
let chatID = $ref<string | string[] | null>(null)
const test = () => {
  console.log("-------nnn")
  if (!route.params.pid) return
  console.log(chatID)
}
onMounted( () => {
  if (!route.params.pid) return
  chatID = route.params.pid
})

</script>

<template>
  <div class="h-full">
    <div class="-m-4 -top-4 z-99 sticky">
      <div class="bg-background flex  p-4  justify-between  ">
        <div class="flex gap-4 items-center">
          <!--<DicebearAvatar :seed="chatID" alt="test" size="lg" />-->

          <div class="min-w-0">
            <p class="font-semibold text-gray-900 dark:text-white">
            </p>
          </div>
        </div>
      </div>

      <UDivider class="" />
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
      <div class="overflow-y-auto h-5/6 flex flex-col-reverse">
        <!--<InboxListMessage :id="chatID" @loaded="scrollToBottom" />-->
        <InboxListMessage :id="chatID" />
      </div>
      <div class="" ref="msgBottom"> </div>
      <div class="-bottom-4 sticky">
        <form @submit.prevent="doSubmit">
          <UTextarea :disabled="isLoading" v-model="msg" name="msg" color="gray" required size="xl" :rows="5" placeholder="Reply to test">
            <!-- <Loading v-show="isLoading" class="h-8 top-1/2 left-1/2 w-8 absolute" /> -->
            <UButton :disabled="isLoading" type="submit" color="black" label="Send" icon="i-heroicons-paper-airplane" class="right-3.5 bottom-2.5 absolute">
            </UButton>
          </UTextarea>
        </form>
      </div>
    </div>
  </div>
</template>
