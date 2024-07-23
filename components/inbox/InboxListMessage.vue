<script setup lang="ts">
const { id } = $defineProps<{
  id: string, // process id
}>()

import audioFile from '@/assets/notify.mp3' // Adjust the path accordingly

const emitLoaded = defineEmit('loaded')

const { state, itemsCache, loadInboxList, isInboxLoading: isLoading, getInboxCount } = $(inboxStore())
const { communityUser } = $(aoCommunityStore())
//const { address, getActiveAddress } = $(arweaveWalletStore())
const { address } = $(aoStore())
const items = $computed(() => {
  return useSortBy(useFilter(itemsCache[id], item => !!item.Data), item => parseInt(item.index))
})

const doLoadMore = async () => {
  if (!id) return

  await loadInboxList(id, 10)
  emitLoaded()
}
watchEffect(doLoadMore)

const playAudio = () => {
  const audio = new Audio(audioFile);
  audio.play();
};

let interval = null
onMounted(async () => {
  //await getActiveAddress()
  interval = setInterval(async () => {
    const oldCount = state[id].inboxCount
    const newCount = await getInboxCount(id, true)
    if (oldCount < newCount) {
      playAudio()
    }
  }, 5000)
})


onUnmounted(() => {
  clearInterval(interval)
  interval = null
})
const isSelf = item => item.From === address

const getData = item => {
  return item.Data
}

const getUserName = (from) => {
  const user = communityUser[from]
  return user && user.length > 0 ? user[0].name : shortAddress(from)
}

const getUserAvatar = (from) => {
  const user = communityUser[from]
  return user && user.length > 0 ? user[0].avatar : '/community/chatavatar.jpg'
}
//const makecommunityChat = $(aoCommunityStore())

//const test = async()=> {
//  const a = await makecommunityChat()
//  console.log("--------",a)
//}

</script>
<template>
  <div class="space-y-5">
    <!--
    <UButton @click="test">test</UButton>
    <InboxNewBtn />
    -->
    <div v-for="item in items" :key="item.id" class="flex gap-2.5 items-start" :class="isSelf(item) ? 'flex-row-reverse' : ''">
      <!--<DicebearAvatar :seed="item.From" class="rounded-full h-8 w-8" size="lg" />-->
      <UAvatar :src="getUserAvatar(item.From)" alt="Avatar" size="2xl" />


      <div class="flex flex-col w-full max-w-[400px]">
        <div class="flex space-x-2 items-center rtl:space-x-reverse" :class="isSelf(item) ? 'justify-end' : ''">
          <span class="font-semibold text-sm text-gray-900 dark:text-white">{{ getUserName(item.From) }}</span>
          <TimeAgo class="font-normal  text-sm text-gray-500 dark:text-gray-400" :time="item.Timestamp" />
        </div>
        <div class="flex flex-col bg-gray-100 border-gray-200 p-4 leading-1.5 dark:bg-gray-700" :class="isSelf(item) ? 'rounded-s-xl rounded-ee-xl' : 'rounded-e-xl rounded-es-xl'">
          <p class="font-normal text-sm text-gray-900 dark:text-white break-words"> {{ getData(item) }}</p>
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
