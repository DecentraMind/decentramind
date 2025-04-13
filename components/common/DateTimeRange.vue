<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs'
import { getLocalTimezone } from '~/utils/time'

interface IProps {
  startAt: number
  endAt: number
  disabled?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:startAt': [value: number]
  'update:endAt': [value: number]
}>()

// Local state
const timezone = ref(getLocalTimezone())
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs(props.startAt),
  dayjs(props.endAt)
])

// Watch for external changes
watch(() => [props.startAt, props.endAt], ([newStartAt, newEndAt]) => {
  dateRange.value = [dayjs(newStartAt), dayjs(newEndAt)]
}, { deep: true })

function handleDateChange(
  _value: [string, string] | [Dayjs, Dayjs],
  _: [string, string],
) {
  if (!dateRange.value) return

  const offset = new Date().getTimezoneOffset() * 60000
  const tz = timezone.value.match(/[-+]\d+/)
  const timezoneOffset = tz ? parseInt(tz[0]) * -60 * 60 * 1000 : offset

  const startAt = new Date(dateRange.value[0].toString()).getTime() - offset + timezoneOffset
  const endAt = new Date(dateRange.value[1].toString()).getTime() - offset + timezoneOffset
  
  emit('update:startAt', startAt)
  emit('update:endAt', endAt)
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