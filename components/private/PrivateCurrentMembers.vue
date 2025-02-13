<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'

defineProps<{
  members: UserInfoWithAddress[]
}>()

const emit = defineEmits<{
  'remove': [member: UserInfoWithAddress]
}>()

const { t } = useI18n()

const memberColumns = [
  {
    key: 'avatar',
    label: '',
    render: (user: UserInfoWithAddress) => h('img', {
      src: user.avatar,
      alt: user.name,
      class: 'w-8 h-8 rounded-full'
    })
  },
  {
    key: 'name',
    label: t('private.members.fields.name')
  },
  {
    key: 'address',
    label: t('private.members.fields.address')
  },
  {
    key: 'actions',
    label: t('private.members.fields.actions')
  }
]
</script>

<template>
  <div>
    <h4 class="font-medium mb-2">
      {{ t('private.members.current') }}
    </h4>
    <UTable
      :rows="members"
      :columns="memberColumns"
    >
      <template #actions-data="{ row }">
        <UButton
          color="red"
          variant="soft"
          size="xs"
          @click="emit('remove', row)"
        >
          {{ t('private.members.remove') }}
        </UButton>
      </template>
    </UTable>
  </div>
</template> 