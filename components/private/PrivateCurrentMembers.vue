<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'
import { getPrivateUnlockMembers, removePrivateUnlockMember } from '~/utils/community/community'

const props = defineProps<{
  uuid: string
}>()

const emit = defineEmits<{
  'memberUpdated': []
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

let privateUnlockMembers = $ref<Awaited<ReturnType<typeof getPrivateUnlockMembers>>>([])
let isLoading = $ref(false)
const removingMembers = ref(new Set<string>())

// Load private unlock members when component is mounted
onMounted(async () => {
  isLoading = true
  try {
    privateUnlockMembers = await getPrivateUnlockMembers(props.uuid)
  } catch (error) {
    console.error('Error loading private unlock members:', error)
  } finally {
    isLoading = false
  }
})

async function handleRemoveMember(member: UserInfoWithAddress) {
  try {
    removingMembers.value.add(member.address)
    await removePrivateUnlockMember(props.uuid, member.address)
    // Remove the member from local array
    privateUnlockMembers = privateUnlockMembers.filter(m => m.address !== member.address)
    showSuccess(t('Member removed successfully'))
    emit('memberUpdated')
  } catch (error) {
    console.error('Error removing member:', error)
    showError('Failed to remove member')
  } finally {
    removingMembers.value.delete(member.address)
  }
}

const memberColumns = [
  {
    key: 'member',
    label: t('private.members.fields.member'),
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
      :rows="privateUnlockMembers"
      :columns="memberColumns"
      :loading="isLoading"
    >
      <template #member-data="{ row }">
        <div class="flex items-center space-x-2">
          <ArAvatar
            :src="row.avatar"
            :alt="row.name"
            class="w-6 h-6"
          />
          <b>{{ row.name }}</b>
          <span>{{ shortString(row.address) }}</span>
        </div>
      </template>
      <template #actions-data="{ row }">
        <Confirm
          :title="t('Remove Member')"
          :body="t('Are you sure you want to remove this member from the private area?')"
          :confirm-btn-text="t('Remove')"
          :on-confirm="() => handleRemoveMember(row)"
        >
          <UButton
            color="red"
            variant="soft"
            size="xs"
            :loading="removingMembers.has(row.address)"
            :disabled="removingMembers.has(row.address)"
          >
            {{ t('private.members.remove') }}
          </UButton>
        </Confirm>
      </template>
    </UTable>
  </div>
</template> 