<script setup lang="ts">
type SubmissionValidateStatus = 'waiting_for_validation' | 'validated' | 'invalid' | 'validation_error' | 'revalidated'

interface Props {
  status: SubmissionValidateStatus
  error?: string
}

const props = defineProps<Props>()

const statusConfig: Record<SubmissionValidateStatus, { icon: string; color: string; label: string; description: string }> = {
  waiting_for_validation: {
    icon: 'i-heroicons-clock',
    color: 'gray',
    label: 'Waiting for validation',
    description: 'This submission is pending validation.'
  },
  validated: {
    icon: 'i-heroicons-check-circle',
    color: 'green',
    label: 'Validated',
    description: 'This submission has been validated.'
  },
  invalid: {
    icon: 'i-heroicons-x-circle',
    color: 'red',
    label: 'Invalid',
    description: 'This submission is invalid.'
  },
  validation_error: {
    icon: 'i-heroicons-exclamation-triangle',
    color: 'yellow',
    label: 'Validation Error',
    description: 'An error occurred during validation.'
  },
  revalidated: {
    icon: 'i-heroicons-check-circle',
    color: 'green',
    label: 'Revalidated',
    description: 'This submission has been revalidated successfully.'
  }
}

const currentStatus = computed(() => statusConfig[props.status])
const isErrorStatus = computed(() => ['invalid', 'validation_error'].includes(props.status))
</script>

<template>
  <UPopover mode="click" :popper="{ placement: 'right' }" class="w-full z-[60]">
    <UIcon
      :name="currentStatus.icon"
      :class="`text-${currentStatus.color}-500`"
      class="w-5 h-5"
      :aria-label="currentStatus.label"
    />
    <template #panel>
      <div class="p-2 w-fit">
        {{ currentStatus.description + (isErrorStatus && props.error ? ` ${props.error}` : '') }}
      </div>
    </template>
  </UPopover>
</template>
