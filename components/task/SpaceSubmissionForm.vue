<script setup lang="ts">
import { spaceUrlSchema } from '~/utils/schemas'
import { computed } from 'vue'

defineProps<{
  submitSpaceUrlLoading: boolean
}>()

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'submit', url: string): void
  // eslint-disable-next-line no-unused-vars
  (e: 'update:submitSpaceUrlLoading', value: boolean): void
}>()

const spaceUrlForm = $ref({
  url: '',
})

const isValidSpaceUrl = computed(() => {
  try {
    spaceUrlSchema.parse({ url: spaceUrlForm.url })
    return true
  } catch {
    return false
  }
})

async function onSubmitSpaceUrl() {
  emit('update:submitSpaceUrlLoading', true)
  // normalize url
  if (spaceUrlForm.url && SPACE_URL_REGEXP.test(spaceUrlForm.url)) {
    const url = new URL(spaceUrlForm.url)
    spaceUrlForm.url = url.origin + url.pathname
  }
  
  emit('submit', spaceUrlForm.url)
}
</script>

<template>
  <UForm :schema="spaceUrlSchema" :state="spaceUrlForm" class="mt-4">
    <UFormGroup
      name="url"
      :label="$t(`task.form.space.label`)"
      :help="$t(`task.form.space.help`)"
    >
      <UInput
        v-model="spaceUrlForm.url"
        :model-modifiers="{ trim: true }"
        color="primary"
        variant="outline"
        :placeholder="$t(`task.form.space.placeholder`)"
      />
    </UFormGroup>
    <div class="flex justify-center my-8">
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