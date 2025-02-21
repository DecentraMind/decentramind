<script setup lang="ts">
import { getQuestions, updateQuestions } from '~/utils/community/community'
import { communityStore } from '~/stores/communityStore'

const { updateIsPrivateApplicable } = $(communityStore())

const props = defineProps<{
  uuid: string
  showApplicableSetting: boolean
  isApplicable: boolean
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

const questions = ref<string[]>([])
const isSaving = ref(false)
const isLoading = ref(true)
let isSettingApplicable = $ref(false)

// Load questions when component is mounted
onMounted(async () => {
  await loadQuestions()
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

async function loadQuestions() {
  try {
    isLoading.value = true
    const loadedQuestions = await getQuestions(props.uuid)
    questions.value = loadedQuestions && loadedQuestions.length > 0 ? loadedQuestions : ['']
  } catch (error) {
    console.error('Error loading questions:', error)
    showError('Failed to load questions', error as Error)
    questions.value = ['']
  } finally {
    isLoading.value = false
  }
}

async function updateApplicable(value: boolean) {
  try {
    isSettingApplicable = true
    await updateIsPrivateApplicable(props.uuid, value)
  } catch (error) {
    console.error('Error updating applicable:', error)
    showError('Failed to update applicable', error as Error)
  } finally {
    isSettingApplicable = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <template v-if="props.showApplicableSetting">
      <div class="flex items-start flex-col space-y-2">
        <label class="block text-sm font-semibold text-gray-700">
          {{ t('private.applicable.label') }}
        </label>
        <div class="flex items-center space-x-2">
          {{ isApplicable ? t('private.applicable.status.enabled') : t('private.applicable.status.disabled') }}
          <UButton
            :loading="isSettingApplicable"
            :disabled="isSettingApplicable"
            @click="updateApplicable(!isApplicable).then(() => loadQuestions())"
          >
            {{ isApplicable ? t('private.applicable.disable') : t('private.applicable.enable') }}
          </UButton>
        </div>
      </div>
    </template>
    <Loading v-if="isLoading" class="h-32" />
    <template v-else-if="isApplicable">
      <hr class="my-4">
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
            v-if="questions.length > 1"
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