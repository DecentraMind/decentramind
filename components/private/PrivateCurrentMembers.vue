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
let selectedMember = $ref<UserInfoWithAddress>()
let isRemoveModalOpen = $ref(false)
let removeReason = $ref('')

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

function openRemoveModal(member: UserInfoWithAddress) {
  selectedMember = member
  removeReason = ''
  isRemoveModalOpen = true
}

async function handleRemoveMember() {
  if (!selectedMember || !removeReason.trim()) return

  try {
    removingMembers.value.add(selectedMember.address)
    await removePrivateUnlockMember(props.uuid, selectedMember.address, removeReason)
    // Remove the member from local array
    privateUnlockMembers = privateUnlockMembers.filter(m => m.address !== selectedMember?.address)
    showSuccess(t('Member removed successfully'))
    emit('memberUpdated')
    isRemoveModalOpen = false
  } catch (error) {
    console.error('Error removing member:', error)
    showError('Failed to remove member')
  } finally {
    removingMembers.value.delete(selectedMember.address)
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
        <UButton
          color="red"
          variant="soft"
          size="xs"
          :loading="removingMembers.has(row.address)"
          :disabled="removingMembers.has(row.address)"
          @click="openRemoveModal(row)"
        >
          {{ t('private.members.remove') }}
        </UButton>
      </template>
    </UTable>

    <!-- Remove Member Modal -->
    <UModal
      v-model="isRemoveModalOpen"
      :ui="{
        width: 'max-w-md'
      }"
    >
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">
              {{ t('Remove Member') }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="isRemoveModalOpen = false"
            />
          </div>
        </template>

        <div v-if="selectedMember" class="space-y-4">
          <!-- Member Info -->
          <div class="flex items-center space-x-2 mb-4">
            <ArAvatar
              :src="selectedMember.avatar"
              :alt="selectedMember.name"
              class="w-8 h-8"
            />
            <div>
              <div class="font-medium">{{ selectedMember.name }}</div>
              <div class="text-sm text-gray-500">{{ shortString(selectedMember.address) }}</div>
            </div>
          </div>

          <!-- Reason Input -->
          <UFormGroup
            :label="t('Reason')"
            required
          >
            <UTextarea
              v-model="removeReason"
              :placeholder="t('Please provide a reason for removing this member')"
              :rows="3"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="gray"
              variant="soft"
              @click="isRemoveModalOpen = false"
            >
              {{ t('Cancel') }}
            </UButton>
            <UButton
              color="red"
              :loading="selectedMember && removingMembers.has(selectedMember.address)"
              :disabled="!removeReason.trim() || (selectedMember && removingMembers.has(selectedMember.address))"
              @click="handleRemoveMember"
            >
              {{ t('Remove') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 