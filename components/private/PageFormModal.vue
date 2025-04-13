<script setup lang="ts">
import { useAddPageMutation, useUpdatePageMutation } from '~/composables/community/communityQuery'
import { notificationStore } from '~/stores/notificationStore'
import type { Page } from '~/types'
import EditableText from '~/components/common/EditableText.vue'

const props = defineProps<{
  modelValue: boolean
  communityUuid?: string
  page?: Page
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

const isEditMode = computed(() => !!props.page)

const page = $ref({
  title: props.page?.title || t('private.page.pageTitlePlaceholder'),
  content: props.page?.content || '',
})

// Reset form when modal opens or page changes
watch(() => [props.modelValue, props.page], ([isOpen, newPage]) => {
  if (isOpen && newPage && typeof newPage === 'object') {
    page.title = newPage.title
    page.content = newPage.content
  } else if (isOpen) {
    page.title = t('private.page.pageTitlePlaceholder')
    page.content = ''
  }
})

const { mutateAsync: addPage, isPending: isAddingPage } = useAddPageMutation({
  communityUuid: props.communityUuid || '',
  onErrorCb: () => {
    showError(t('private.page.failedToAddPage'))
  }
})

const { mutateAsync: updatePage, isPending: isUpdatingPage } = useUpdatePageMutation({
  communityUuid: props.communityUuid || '',
  onErrorCb: () => {
    showError(t('private.page.failedToUpdatePage'))
  }
})

const isPending = computed(() => isAddingPage.value || isUpdatingPage.value)

async function onSave() {
  if (!page.title.trim()) {
    showError(t('private.page.titleRequired'))
    return
  }

  try {
    if (isEditMode.value && props.page) {
      await updatePage({
        pageUuid: props.page.uuid, 
        page: { 
          title: page.title,
          content: page.content 
        }
      })
      showSuccess(t('private.page.pageUpdated'))
    } else if (props.communityUuid) {
      await addPage({ 
        title: page.title,
        content: page.content 
      })
      showSuccess(t('private.page.pageAdded'))
    }
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error saving page:', error)
    showError(isEditMode.value ? t('private.page.failedToUpdatePage') : t('private.page.failedToAddPage'))
  }
}
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{
      width: 'max-w-2xl'
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">
            {{ isEditMode ? t('private.page.editPage') : t('private.page.addPage') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <div class="space-y-1">
        <div class="space-y-2">
          <div class="relative">
            <EditableText
              v-model:text="page.title"
              tag="div"
              :can-edit="true"
              class-name="w-full rounded-md py-2 hover:border-primary-500 focus:border-primary-500"
            />
            <div 
              v-if="!page.title.trim()" 
              class="absolute inset-0 flex items-center px-2 text-gray-400 pointer-events-none"
            >
              {{ t('private.page.pageTitlePlaceholder') }}
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <UTextarea
            v-model="page.content"
            :placeholder="t('private.page.pageContentPlaceholder')"
            :rows="10"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="gray"
            variant="soft"
            @click="emit('update:modelValue', false)"
          >
            {{ t('Cancel') }}
          </UButton>
          <UButton
            color="primary"
            :loading="isPending"
            :disabled="isPending || !page.title.trim()"
            @click="onSave"
          >
            {{ isEditMode ? t('Save') : t('Add') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 