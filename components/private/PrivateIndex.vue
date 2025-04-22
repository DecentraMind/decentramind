<script setup lang="ts">
import Board from './Board.vue'
import { useAddBoardMutation, usePrivateAreaConfigByCommunityMutation, usePrivateAreaConfigQuery, useDeletePageMutation } from '~/composables/community/communityQuery'
import { notificationStore } from '~/stores/notificationStore'
import { usePrivateTaskStore } from '~/stores/privateTaskStore'
import SettleConfirmModal from './SettleConfirmModal.vue'
import { useUserInfo } from '~/composables/useUserInfo'
import EditableText from '~/components/common/EditableText.vue'
import ProposalModal from './ProposalModal.vue'
import PageFormModal from './PageFormModal.vue'
import PageModal from './PageModal.vue'
import type { Page } from '~/types'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isAdmin: boolean
  uuid: string
}>()
const { t } = useI18n()
const { showError, showSuccess } = $(notificationStore())
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
let isPageFormModalOpen = $ref(false)
let isPageModalOpen = $ref(false)
let isDeletePageConfirmOpen = $ref(false)
let currentPage = $ref<Page | undefined>(undefined)
let pageToDelete = $ref<Page | undefined>(undefined)

const openPageFormModal = (page?: Page) => {
  currentPage = page
  isPageFormModalOpen = true
}

const openPageModal = (page: Page) => {
  currentPage = page
  isPageModalOpen = true
}

const openDeletePageConfirm = (page: Page) => {
  pageToDelete = page
  isDeletePageConfirmOpen = true
}

const { mutateAsync: deletePageMutation, isPending: isDeletingPage } = useDeletePageMutation({
  communityUuid: props.uuid
})

const deletePage = async () => {
  if (!pageToDelete) return
  
  try {
    await deletePageMutation(pageToDelete.uuid)
    isDeletePageConfirmOpen = false
    pageToDelete = undefined
    showSuccess(t('private.page.deleteSuccess'))
  } catch (error) {
    showError(t('private.page.deleteError'))
    console.error('Failed to delete page:', error)
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col items-start justify-start">
    <EditableText
      :text="config?.pagesAreaTitle || ''"
      :can-edit="canEdit"
      tag="h2"
      class-name="text-lg font-medium mb-2"
      :mutate="updatePrivateAreaTitle"
      :loading="isUpdatingConfig"
    />
    <!-- show page list -->
    <div class="mt-2 mb-4 w-full grid grid-cols-3 gap-x-4 gap-y-6 bg-gray-100 rounded-lg p-4">
      <div 
        v-for="page in config?.pages" 
        :key="page.uuid"
        :data-page-uuid="page.uuid"
        class="group relative bg-white rounded-lg p-3 cursor-pointer"
        @click="openPageModal(page)"
      >
        <h4 class="font-medium text-sm line-clamp-1 pr-10">{{ page.title }}</h4>
        <UIcon 
          v-if="canEdit"
          name="i-heroicons-trash" 
          class="absolute top-3 right-8 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-500"
          @click.stop="openDeletePageConfirm(page)"
        />
        <UIcon 
          v-if="canEdit"
          name="i-heroicons-pencil-square" 
          class="absolute top-3 right-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          @click.stop="openPageFormModal(page)"
        />
      </div>
      <!-- if no page -->
      <div v-if="config?.pages && config.pages.length === 0" class="col-span-3 mt-4 text-center text-gray-500">
        {{ $t('private.page.noPage') }}
      </div>
      <UButton
        v-if="canEdit"
        size="xs"
        variant="ghost"
        icon="i-heroicons-plus"
        @click="openPageFormModal()"
      >
        {{ $t('private.page.addPage') }}
      </UButton>
    </div>
    <!-- show board list -->
    <div class="w-full">
      <Board v-for="board in config?.boards" :key="board.uuid" :data="board" :unclickable="isAddingBoard" :can-edit-title="canEdit" />
      <div v-if="config?.boards && config.boards.length === 0" class="mt-4 text-center text-gray-500">
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

    <ProposalModal v-model="privateTaskStore.isProposalModal" />
    <SettleConfirmModal v-model="privateTaskStore.isSettleConfirmModal" />

    <PageFormModal 
      v-model="isPageFormModalOpen" 
      :page="currentPage" 
      :community-uuid="uuid" 
    />
    <PageModal 
      v-model="isPageModalOpen" 
      :page="currentPage" 
    />
    
    <UModal v-model="isDeletePageConfirmOpen">
      <UCard
        :ui="{
          header: { padding: 'pt-5 pb-0' },
          divide: '',
          footer: {
            padding: 'py-3 bg-zinc-50 flex items-center'
          }
        }"
      >
        <template #header>
          <span class="text-left text-lg font-medium">{{ $t('private.page.deletePage') }}</span>
        </template>
        <div class="text-left text-base py-4">
          {{ $t('private.page.deleteConfirm', { title: pageToDelete?.title }) }}
          <p class="text-red-500 mt-2">{{ $t('private.page.deleteWarning') }}</p>
        </div>
        <template #footer>
          <p class="w-full flex justify-end space-x-8">
            <UButton :disabled="isDeletingPage" color="gray" variant="solid" size="lg" @click="isDeletePageConfirmOpen = false">
              {{ $t('Cancel') }}
            </UButton>
            <UButton
              :disabled="isDeletingPage"
              :loading="isDeletingPage"
              color="red"
              variant="outline"
              size="lg"
              @click="deletePage"
            >
              {{ $t('private.page.deletePage') }}
            </UButton>
          </p>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
