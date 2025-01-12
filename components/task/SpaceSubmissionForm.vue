<script setup lang="ts">
import { spaceUrlSchema } from '~/utils/schemas'

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (_e: 'submit', _url: string): void
}>()

const spaceUrlForm = $ref({
  url: '',
})

let submitSpaceUrlLoading = $ref(false)

const isValidSpaceUrl = computed(() => {
  try {
    spaceUrlSchema.parse({ url: spaceUrlForm.url })
    return true
  } catch {
    return false
  }
})

async function onSubmitSpaceUrl() {
  submitSpaceUrlLoading = true
  try {
    // normalize url
    if (spaceUrlForm.url && SPACE_URL_REGEXP.test(spaceUrlForm.url)) {
      const url = new URL(spaceUrlForm.url)
      spaceUrlForm.url = url.origin + url.pathname
    }
    emit('submit', spaceUrlForm.url)
  } finally {
    submitSpaceUrlLoading = false
  }
}
</script>

<template>
  <UForm :schema="spaceUrlSchema" :state="spaceUrlForm" class="mt-8">
    <UFormGroup name="url" :label="$t(`task.form.space.label`)">
      <UInput
        v-model="spaceUrlForm.url"
        :model-modifiers="{ trim: true }"
        color="primary"
        variant="outline"
        :placeholder="$t(`task.form.space.placeholder`)"
      />
    </UFormGroup>
    <div class="flex justify-center mb-8 mt-12">
      <UButton
        :loading="submitSpaceUrlLoading"
        :disabled="submitSpaceUrlLoading || !isValidSpaceUrl"
        @click="onSubmitSpaceUrl"
      >
        {{ $t('Submit') }}
      </UButton>
    </div>
  </UForm>
</template> 