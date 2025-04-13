<script setup lang="ts">
import { useLogsQuery } from '~/composables/community/communityQuery'
import type { Log } from '~/types'
import { formatDate } from '~/utils/time'

const props = defineProps<{
  uuid: string
}>()

const { t } = useI18n()

const logColumns = [
  {
    key: 'action',
    label: t('private.members.fields.action')
  },
  {
    key: 'admin',
    label: t('private.members.fields.admin')
  },
  {
    key: 'member',
    label: t('private.members.fields.member')
  },
  {
    key: 'reason',
    label: t('private.members.fields.reason')
  },
  {
    key: 'timestamp',
    label: t('private.members.fields.time')
  }
]

let logs = $ref<Log[]>([])

const { data, isSuccess, isFetching, refetch } = useLogsQuery(props.uuid)
watchEffect(() => {
  console.log('fetch logs isSuccess', isSuccess.value)
  if (isSuccess.value && data.value) {
    console.log('logs loaded successfully:', data.value)
    logs = data.value.filter(log => log.operation === 'removePrivateMember')
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h4 class="font-semibold mb-2">
        {{ t('private.members.removeHistory') }}
      </h4>
      <UButton
        color="gray"
        variant="soft"
        size="xs"
        icon="i-heroicons-arrow-path"
        @click="refetch()"
      />
    </div>
    <UTable
      :rows="logs"
      :columns="logColumns"
      :loading="isFetching"
    >
      <template #action-data="{ row }">
        {{ t(`private.members.logOperations.${row.operation}`) }}
      </template>
      <template #admin-data="{ row }">
        <div class="flex items-center space-x-2">
          <ArAvatar
            :src="row.operatorAvatar"
            :alt="row.operatorName"
            class="w-6 h-6"
          />
          <b>{{ row.operatorName }}</b>
        </div>
      </template>
      <template #member-data="{ row }">
        <div class="flex items-center space-x-2">
          <ArAvatar
            :src="row.params.avatar"
            :alt="row.params.name"
            class="w-6 h-6"
          />
          <b>{{ row.params.name }}</b>
          <span>{{ shortString(row.params.address) }}</span>
        </div>
      </template>
      <template #reason-data="{ row }">
        {{ row.params.reason }}
      </template>
      <template #timestamp-data="{ row }">
        {{ formatDate(row.timestamp) }}
      </template>
    </UTable>
  </div>
</template> 