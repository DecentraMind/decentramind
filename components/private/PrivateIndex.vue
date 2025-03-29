<script setup lang="ts">
import Board from './Board.vue'
import { useAddBoardMutation, usePrivateAreaConfigQuery } from '~/composables/community/communityQuery'
import { notificationStore } from '~/stores/notificationStore'

const props = defineProps<{
  isAdmin: boolean
  uuid: string
}>()
const { showError } = $(notificationStore())

const { data: config, isLoading, isError, error } = usePrivateAreaConfigQuery(props.uuid, {
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
})
watch(isError, (newVal) => {
  if (newVal) {
    console.error('Failed to load private area data. ' + error.value?.message)
    showError('Failed to load private area data.')
  }
})
watch(config, (newVal) => {
  console.log('new config', newVal)
})

const { mutateAsync: addBoardMutationAsync, isPending: isAddingBoard } = useAddBoardMutation({communityUuid: props.uuid})

const addBoard = async () => {
  try {
    await addBoardMutationAsync('New Area')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to add work area. ' + error.message)
    } else {
      console.error('Failed to add work area. ' + error)
    }
    showError('Failed to add work area.')
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col items-start justify-start">
    <h2 class="text-2xl font-bold text-left mb-4">
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
      <Board v-for="board in config?.boards" :key="board.uuid" :data="board" :unclickable="isAddingBoard" />
      <div v-if="config?.boards && config.boards.length === 0" class="text-center text-gray-500">
        {{ $t('private.area.noWorkArea') }}
      </div>
    </div>
    <UButton
      v-if="isAdmin && !isLoading"
      size="xs"
      variant="solid"
      class="mt-8"
      icon="i-heroicons-plus"
      @click="addBoard"
    >
      {{ $t('private.area.addWorkArea') }}
    </UButton>
  </div>
</template>
