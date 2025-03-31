<script setup lang="ts">
import Board from './Board.vue'
import { useAddBoardMutation, usePrivateAreaConfigByCommunityMutation, usePrivateAreaConfigQuery } from '~/composables/community/communityQuery'
import { notificationStore } from '~/stores/notificationStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import SettleConfirmModal from './SettleConfirmModal.vue'
import { useUserInfo } from '~/composables/useUserInfo'
import EditableText from '~/components/common/EditableText.vue'

const props = defineProps<{
  isAdmin: boolean
  uuid: string
}>()
const { showError } = $(notificationStore())
const { isCurrentCommunityAdmin, isCurrentCommunityOwner } = $(useUserInfo())
const privateTaskStore = usePrivateTaskStore()

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

const { mutateAsync: updatePrivateAreaConfig, isPending: isUpdatingConfig } = usePrivateAreaConfigByCommunityMutation({
  uuid: props.uuid,
  onErrorCb: () => {
    showError('Failed to update private area title.')
  }
})

const updatePrivateAreaTitle = async (newTitle: string) => {
  if (!config.value) return
  
  try {
    await updatePrivateAreaConfig({
      ...config.value,
      pagesAreaTitle: newTitle
    })
  } catch (error) {
    showError('Failed to update private area title.')
    console.error('Failed to update private area title:', error)
  }
}

const canEdit = computed(() => isCurrentCommunityAdmin || isCurrentCommunityOwner)
</script>

<template>
  <div class="w-full h-full flex flex-col items-start justify-start">
    <EditableText
      :text="config?.pagesAreaTitle || ''"
      :can-edit="canEdit"
      tag="h2"
      class-name="text-2xl font-bold text-left mb-4"
      :mutate="updatePrivateAreaTitle"
      :loading="isUpdatingConfig"
    />
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
      <Board v-for="board in config?.boards" :key="board.uuid" :data="board" :unclickable="isAddingBoard" :can-edit-title="canEdit" />
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

    <SettleConfirmModal v-model="privateTaskStore.isSettleConfirmModal" />
  </div>
</template>
