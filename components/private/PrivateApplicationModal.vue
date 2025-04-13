<script setup lang="ts">
import { useQuestionsQuery } from '~/composables/community/communityQuery'
import { submitAnswers } from '~/utils/community/community'
import { notificationStore } from '~/stores/notificationStore'

const props = defineProps<{
  modelValue: boolean
  uuid: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

const { data: questions } = useQuestionsQuery(props.uuid)

const answers = $computed<string[]>(() => Array(questions?.value?.length || 0).fill(''))
let isSubmitting = $ref(false)

async function onSubmitAnswers() {
  if (answers.some(answer => !answer.trim())) {
    showError('Please answer all questions')
    return
  }

  try {
    isSubmitting = true
    await submitAnswers(props.uuid, answers)
    showSuccess(t('private.area.applicationSubmitted'))
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error submitting answers:', error)
    showError('Failed to submit answers', error as Error)
  } finally {
    isSubmitting = false
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
            {{ t('private.area.applicationTitle') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <div class="space-y-6">
        <p class="text-gray-600">
          {{ t('private.area.applicationDescription') }}
        </p>

        <div
          v-for="(question, index) in questions"
          :key="index"
          class="space-y-2"
        >
          <label class="block font-medium">
            {{ question }}
          </label>
          <UTextarea
            v-model="answers[index]"
            :placeholder="t('private.area.answerPlaceholder')"
            :rows="3"
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
            :loading="isSubmitting"
            :disabled="isSubmitting || answers.some(answer => !answer.trim())"
            @click="onSubmitAnswers"
          >
            {{ t('Submit') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 