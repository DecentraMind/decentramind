<script setup lang="ts">
import type { PrivateApplication } from '~/types'
import { approveOrRejectApplication } from '~/utils/community/community'
import { notificationStore } from '~/stores/notificationStore'

const props = defineProps<{
  modelValue: boolean
  application: PrivateApplication
  questions: string[]
  uuid: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'handled': []
  'reload': []
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())
let isApproving = $ref(false)
let isRejecting = $ref(false)

async function handleMember(address: string, action: 'approve' | 'reject') {
  if (!address) return

  try {
    if (action === 'approve') {
      isApproving = true
    } else {
      isRejecting = true
    }
    await approveOrRejectApplication(props.uuid, address, action)
    showSuccess(t(action === 'approve' ? 'Member approved successfully' : 'Member rejected successfully'))
    emit('handled')
    emit('reload')
  } catch (error) {
    console.error('Error handling member:', error)
    showError('Failed to handle member', error as Error)
  } finally {
    isApproving = false
    isRejecting = false
    emit('update:modelValue', false)
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
            {{ t('private.members.application.title') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <!-- Applicant Info -->
      <div class="flex items-center space-x-4 mb-6">
        <ArAvatar
          :src="application.avatar"
          :alt="application.name"
          class="w-12 h-12"
        />
        <div>
          <h4 class="font-medium">{{ application.name }}</h4>
          <p class="text-sm text-gray-500">{{ application.address }}</p>
        </div>
      </div>

      <!-- Application Answers -->
      <div class="space-y-4">
        <div
          v-for="(q, index) in questions"
          :key="index"
          class="border rounded-lg p-4"
        >
          <h5 class="font-medium mb-2">{{ q }}</h5>
          <p>{{ application.answers[index] || 'No answer provided' }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="red"
            variant="soft"
            :loading="isRejecting"
            :disabled="isRejecting || isApproving"
            @click="handleMember(application.address, 'reject')"
          >
            {{ t('private.members.reject') }}
          </UButton>
          <UButton
            color="primary"
            :loading="isApproving"
            :disabled="isRejecting || isApproving"
            @click="handleMember(application.address, 'approve')"
          >
            {{ t('private.members.approve') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 