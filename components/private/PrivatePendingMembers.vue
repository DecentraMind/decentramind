<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'

const props = defineProps<{
  members: UserInfoWithAddress[]
  questions: string[]
}>()

const emit = defineEmits<{
  'approve': [member: UserInfoWithAddress]
  'reject': [member: UserInfoWithAddress]
}>()

const { t } = useI18n()

const searchQuery = ref('')

// Application details modal state
const isApplicationModalOpen = ref(false)
const selectedApplication = ref<{
  member: UserInfoWithAddress
  answers: string[]
} | null>(null)

function viewApplication(member: UserInfoWithAddress) {
  // TODO: Load actual application answers from backend
  selectedApplication.value = {
    member,
    answers: ['Mock answer 1', 'Mock answer 2'] // This should be replaced with actual data
  }
  isApplicationModalOpen.value = true
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
          @click="emit('approve', row)"
        >
          {{ t('private.members.approve') }}
        </UButton>
        <UButton
          color="red"
          variant="soft"
          size="xs"
          @click="emit('reject', row)"
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
              @click="emit('reject', selectedApplication.member)"
            >
              {{ t('private.members.reject') }}
            </UButton>
            <UButton
              color="primary"
              @click="emit('approve', selectedApplication.member)"
            >
              {{ t('private.members.approve') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 