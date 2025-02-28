<script setup lang="ts">
import type { BoardWithTasks, PrivateAreaConfig } from '~/types'
import { getPrivateAreaConfig } from '@/utils/community/community'
import { communityStore } from '@/stores/communityStore'
import Kanban from './Kanban.vue'

const { updatePrivateAreaConfig } = $(communityStore())

const props = defineProps<{
  isAdmin: boolean
  uuid: string
}>()

const config = ref<PrivateAreaConfig | null>(null)

onMounted(async () => {
  config.value = await getPrivateAreaConfig(props.uuid)
})

const addBoard = async () => {
  const newBoard: BoardWithTasks = {
    uuid: crypto.randomUUID(),
    title: 'New Area',
    tasks: []
  }
  if (!config.value) return
  config.value.boards.push(newBoard)
  config.value = await updatePrivateAreaConfig(props.uuid, config.value)
}
</script>

<template>
  <div class="ttt w-full h-full flex flex-col items-start justify-start">
    <h2 class="text-2xl font-bold text-left">
      {{ config?.pagesAreaTitle }}
    </h2>
    <!-- <div class="mt-2 w-full flex flex-col items-center justify-center ring-1 ring-gray-200 rounded-lg p-4">
      <div v-for="page in config?.pages" :key="page.title">
        <h3 class="text-lg font-bold">{{ page.title }}</h3>
      </div>
      <UButton
        color="blue"
        variant="solid"
        class="mt-4"
        @click="openAddPageModal"
      >
        {{ $t('private.area.addPage') }}
      </UButton>

      <AddPageModal
        v-model="isAddPageModalOpen"
        :uuid="props.uuid"
        @page-added="fetchConfig"
      /> 
    </div>-->
    <!-- show board list -->
    <div class="w-full">
      <Kanban v-for="board in config?.boards" :key="board.uuid" :data="board" class="w-full mt-4" />
    </div>
    <UButton
      v-if="isAdmin"
      size="xs"
      variant="solid"
      class="mt-8"
      icon="i-heroicons-plus"
      @click="addBoard"
    >
      {{ $t('private.area.addBoard') }}
    </UButton>
  </div>
</template>
