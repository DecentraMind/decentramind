<script setup lang="ts">
interface HistoryRow {
  action: 'add' | 'remove'
  admin: string
  member: string
  timestamp: number
}

defineProps<{
  history: HistoryRow[]
}>()

const { t } = useI18n()

const historyColumns = [
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
    key: 'timestamp',
    label: t('private.members.fields.time'),
    render: (row: HistoryRow) => {
      const date = new Date(row.timestamp)
      return date.toLocaleString()
    }
  }
]
</script>

<template>
  <div>
    <h4 class="font-medium mb-2">
      {{ t('private.members.history') }}
    </h4>
    <UTable
      :rows="history"
      :columns="historyColumns"
    />
  </div>
</template> 