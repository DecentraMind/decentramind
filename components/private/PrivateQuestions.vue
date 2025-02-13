<script setup lang="ts">
import { getQuestions, updateQuestions } from '~/utils/community/community'

const props = defineProps<{
  uuid: string
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

const questions = ref<string[]>([])
const isSaving = ref(false)
const isLoading = ref(true)

// Load questions when component is mounted
onMounted(async () => {
  try {
    const loadedQuestions = await getQuestions(props.uuid)
    questions.value = loadedQuestions && loadedQuestions.length > 0 ? loadedQuestions : ['']
  } catch (error) {
    console.error('Error loading questions:', error)
    showError('Failed to load questions', error as Error)
    questions.value = ['']
  } finally {
    isLoading.value = false
  }
})

async function saveQuestions() {
  try {
    isSaving.value = true
    await updateQuestions(props.uuid, questions.value.filter(question => question.trim() !== ''))
    showSuccess(t('private.questions.saved'))
  } catch (error) {
    console.error('Error saving questions:', error)
    showError('Failed to save questions', error as Error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <Loading v-if="isLoading" class="h-32" />
    <template v-else>
      <label class="block text-sm font-medium text-gray-700">
        {{ t('private.questions.description') }}
      </label>
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="space-y-1"
      >
        <label class="block text-sm font-medium text-gray-700">
          {{ t('private.questions.question') }} {{ index + 1 }}
        </label>
        <div class="flex items-center space-x-2">
          <UInput
            v-model.trim="questions[index]"
            :placeholder="t('private.questions.placeholder')"
            class="flex-1"
          />
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-trash"
            @click="questions.splice(index, 1)"
          />
        </div>
      </div>
      <div class="flex justify-between">
        <UButton
          color="gray"
          variant="soft"
          @click="questions.push('')"
        >
          {{ t('private.questions.add') }}
        </UButton>
        <UButton
          color="primary"
          :loading="isSaving"
          :disabled="isSaving"
          @click="saveQuestions"
        >
          {{ t('Save') }}
        </UButton>
      </div>
    </template>
  </div>
</template> 