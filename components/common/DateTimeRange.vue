<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs'
import { getLocalTimezone } from '~/utils/time'

interface IProps {
  modelValue: {
    startAt: number
    endAt: number
  }
  disabled?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: { startAt: number; endAt: number }]
}>()

// Local state
const timezone = ref(getLocalTimezone())
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs(props.modelValue.startAt),
  dayjs(props.modelValue.endAt)
])

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  dateRange.value = [dayjs(newValue.startAt), dayjs(newValue.endAt)]
}, { deep: true })

function handleDateChange(
  _value: [string, string] | [Dayjs, Dayjs],
  _: [string, string],
) {
  if (!dateRange.value) return

  const offset = new Date().getTimezoneOffset() * 60000
  const tz = timezone.value.match(/[-+]\d+/)
  const timezoneOffset = tz ? parseInt(tz[0]) * -60 * 60 * 1000 : offset

  emit('update:modelValue', {
    startAt: new Date(dateRange.value[0].toString()).getTime() - offset + timezoneOffset,
    endAt: new Date(dateRange.value[1].toString()).getTime() - offset + timezoneOffset
  })
}
</script>

<template>
  <div class="flex justify-between items-center gap-x-1">
    <USelect
      v-model="timezone"
      :disabled="disabled"
      :placeholder="$t('Time Zone')"
      :options="timezones"
      :ui="{
        variant: {
          outline:
            'ring-gray-300 dark:ring-primary-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      }"
      @change="handleDateChange"
    />
    <a-range-picker
      v-model:value="dateRange"
      :disabled="disabled"
      show-time
      @change="handleDateChange"
    />
  </div>
</template> 