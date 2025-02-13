<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'
import { dryrunResultParsed } from '~/utils/ao'
import { DM_PROCESS_ID } from '~/utils/processID'

const props = defineProps<{
  members: UserInfoWithAddress[]
  questions: string[]
  uuid: string
}>()

const emit = defineEmits<{
  'update:members': [members: UserInfoWithAddress[]]
}>()

const { t } = useI18n()
const { showSuccess, showError } = $(notificationStore())

const searchQuery = ref('')
const isProcessing = ref(false)

// Application details modal state
const isApplicationModalOpen = ref(false)
const selectedApplication = ref<{
  member: UserInfoWithAddress
  answers: string[]
} | null>(null)

async function viewApplication(member: UserInfoWithAddress) {
  try {
    const tags = [
      { name: 'Action', value: 'GetAnswers' },
      { name: 'CommunityUuid', value: props.uuid },
      { name: 'Address', value: member.address }
    ]
    const answers = await dryrunResultParsed({
      process: DM_PROCESS_ID,
      tags
    }) as string[]

    selectedApplication.value = {
      member,
      answers: answers || []
    }
    isApplicationModalOpen.value = true
  } catch (error) {
    console.error('Error loading application answers:', error)
    showError('Failed to load application answers', error as Error)
  }
}

async function approveMember(member: UserInfoWithAddress) {
  try {
    isProcessing.value = true
    const tags = [
      { name: 'Action', value: 'ApproveMember' },
      { name: 'CommunityUuid', value: props.uuid },
      { name: 'Address', value: member.address }
    ]
    await dryrunResultParsed({
      process: DM_PROCESS_ID,
      tags
    })
    showSuccess(t('Member approved successfully'))
    emit('update:members', props.members.filter(m => m.address !== member.address))
  } catch (error) {
    console.error('Error approving member:', error)
    showError('Failed to approve member', error as Error)
  } finally {
    isProcessing.value = false
    isApplicationModalOpen.value = false
  }
}

async function rejectMember(member: UserInfoWithAddress) {
  try {
    isProcessing.value = true
    const tags = [
      { name: 'Action', value: 'RejectMember' },
      { name: 'CommunityUuid', value: props.uuid },
      { name: 'Address', value: member.address }
    ]
    await dryrunResultParsed({
      process: DM_PROCESS_ID,
      tags
    })
    showSuccess(t('Member rejected successfully'))
    emit('update:members', props.members.filter(m => m.address !== member.address))
  } catch (error) {
    console.error('Error rejecting member:', error)
    showError('Failed to reject member', error as Error)
  } finally {
    isProcessing.value = false
    isApplicationModalOpen.value = false
  }
}

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

// Computed filtered members
const filteredMembers = computed(() => {
  if (!searchQuery.value) return props.members
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return props.members.filter(member => 
    member.name.toLowerCase().includes(lowerCaseQuery) || 
    member.address.toLowerCase().includes(lowerCaseQuery)
  )
})
</script>

<template>
  <div>
    <h4 class="font-medium mb-2">
      {{ t('private.members.pending') }}
    </h4>
    <UTable
      :rows="filteredMembers"
      :columns="memberColumns"
      class="px-4"
    >
      <template #search>
        <UInput
          v-model="searchQuery"
          :placeholder="t('private.members.search')"
          icon="i-heroicons-magnifying-glass-20-solid"
        />
      </template>
      <template #actions-data="{ row }">
        <UButton
          color="gray"
          variant="soft"
          size="xs"
          icon="i-heroicons-eye"
          class="mr-2"
          @click="viewApplication(row)"
        >
          {{ t('private.members.viewApplication') }}
        </UButton>
        <UButton
          color="primary"
          size="xs"
          :loading="isProcessing"
          :disabled="isProcessing"
          @click="approveMember(row)"
        >
          {{ t('private.members.approve') }}
        </UButton>
        <UButton
          color="red"
          variant="soft"
          size="xs"
          :loading="isProcessing"
          :disabled="isProcessing"
          @click="rejectMember(row)"
        >
          {{ t('private.members.reject') }}
        </UButton>
      </template>
    </UTable>

    <!-- Application Details Modal -->
    <UModal
      v-model="isApplicationModalOpen"
      :ui="{
        width: 'max-w-2xl'
      }"
    >
      <UCard v-if="selectedApplication">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">
              {{ t('private.members.application.title') }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="isApplicationModalOpen = false"
            />
          </div>
        </template>

        <!-- Applicant Info -->
        <div class="flex items-center space-x-4 mb-6">
          <img
            :src="selectedApplication.member.avatar"
            :alt="selectedApplication.member.name"
            class="w-12 h-12 rounded-full"
          >
          <div>
            <h4 class="font-medium">{{ selectedApplication.member.name }}</h4>
            <p class="text-sm text-gray-500">{{ selectedApplication.member.address }}</p>
          </div>
        </div>

        <!-- Application Answers -->
        <div class="space-y-4">
          <div
            v-for="(answer, index) in selectedApplication.answers"
            :key="index"
            class="border rounded-lg p-4"
          >
            <h5 class="font-medium mb-2">{{ questions[index] }}</h5>
            <p>{{ answer }}</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="red"
              variant="soft"
              :loading="isProcessing"
              :disabled="isProcessing"
              @click="rejectMember(selectedApplication.member)"
            >
              {{ t('private.members.reject') }}
            </UButton>
            <UButton
              color="primary"
              :loading="isProcessing"
              :disabled="isProcessing"
              @click="approveMember(selectedApplication.member)"
            >
              {{ t('private.members.approve') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 