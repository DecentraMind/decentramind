<script setup lang="ts">
import { tweetUrlSchema } from '~/utils/schemas'
import { computed } from 'vue'
import type { Task } from '~/types'

defineProps<{
  taskType: Task['type']
  submitTweetUrlLoading: boolean
}>()


const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'submit', url: string): void
  // eslint-disable-next-line no-unused-vars
  (e: 'update:submitTweetUrlLoading', value: boolean): void
}>()

const tweetUrlForm = $ref({
  url: '',
})

const isValidTweetUrl = computed(() => {
  try {
    tweetUrlSchema.parse({ url: tweetUrlForm.url })
    return true
  } catch {
    return false
  }
})

async function onSubmitTweetUrl() {
  emit('update:submitTweetUrlLoading', true)
  // normalize url
  if (tweetUrlForm.url && TWEET_URL_REGEXP.test(tweetUrlForm.url)) {
    const url = new URL(tweetUrlForm.url)
    tweetUrlForm.url = url.origin + url.pathname
  }

  emit('submit', tweetUrlForm.url)
}
</script>

<template>
  <UForm :schema="tweetUrlSchema" :state="tweetUrlForm" class="mt-4">
    <UFormGroup
      name="url"
      :label="$t(`task.form.${taskType}.label`)"
      :help="$t(`task.form.bird.help`)"
    >
      <UInput
        v-model="tweetUrlForm.url"
        :model-modifiers="{ trim: true }"
        color="primary"
        variant="outline"
        :placeholder="$t(`task.form.${taskType}.placeholder`)"
      />
    </UFormGroup>
    <div class="flex justify-center my-8">
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