<script setup lang="ts">
import { tweetUrlSchema } from '~/utils/schemas'
import type { Task } from '~/types'
defineProps<{
  taskType: Task['type']
}>()

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'submit', url: string): void
}>()

const tweetUrlForm = $ref({
  url: '',
})

let submitTweetUrlLoading = $ref(false)

const isValidTweetUrl = computed(() => {
  try {
    tweetUrlSchema.parse({ url: tweetUrlForm.url })
    return true
  } catch {
    return false
  }
})

async function onSubmitTweetUrl() {
  submitTweetUrlLoading = true
  try {
    // normalize url
    if (tweetUrlForm.url && TWEET_URL_REGEXP.test(tweetUrlForm.url)) {
      const url = new URL(tweetUrlForm.url)
      tweetUrlForm.url = url.origin + url.pathname
    }
    emit('submit', tweetUrlForm.url)
  } finally {
    submitTweetUrlLoading = false
  }
}
</script>

<template>
  <UForm :schema="tweetUrlSchema" :state="tweetUrlForm" class="mt-8">
    <UFormGroup name="url">
      <UInput
        v-model="tweetUrlForm.url"
        :model-modifiers="{ trim: true }"
        color="primary"
        variant="outline"
        :placeholder="$t(`task.form.${taskType}.placeholder`)"
      />
    </UFormGroup>
    <div class="flex justify-center mb-8 mt-12">
      <UButton
        :loading="submitTweetUrlLoading"
        :disabled="submitTweetUrlLoading || !isValidTweetUrl"
        @click="onSubmitTweetUrl"
      >
        {{ $t('Submit') }}
      </UButton>
    </div>
  </UForm>
</template>