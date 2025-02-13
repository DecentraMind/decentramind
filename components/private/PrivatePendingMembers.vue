<script setup lang="ts">
import type { PrivateApplication } from '~/types'
import { getApplications } from '~/utils/community/community'
import { shortString } from '~/utils/string'

const props = defineProps<{
  questions: string[]
  uuid: string
}>()

const { t } = useI18n()

const searchQuery = ref('')
let pendingApplications = $ref<PrivateApplication[]>([])
let isApplicationModalOpen = $ref(false)
let currentApplication = $ref<PrivateApplication | null>(null)

let isLoading = $ref(false)
// Load pending applications when component is mounted
onMounted(async () => {
  try {
    isLoading = true
    pendingApplications = await getApplications(props.uuid)
  } catch (error) {
    console.error('Error loading pending applications:', error)
  } finally {
    isLoading = false
  }
})

function viewApplication(application: PrivateApplication) {
  currentApplication = application
  isApplicationModalOpen = true
}

function onApplicationHandled() {
  const application = currentApplication
  if (application) {
    pendingApplications = pendingApplications.filter(app => app.address !== application.address)
  }
}

const memberColumns = [
  {
    key: 'applicant',
    label: t('private.members.fields.applicant'),
    class: 'w-[200px]'
  },
  {
    key: 'actions',
    label: t('private.members.fields.actions')
  }
]

// Computed filtered members
const filteredMembers = computed(() => {
  if (!searchQuery.value) return pendingApplications
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return pendingApplications.filter(app => 
    app.address.toLowerCase().includes(lowerCaseQuery)
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
      :loading="isLoading"
      class="px-4"
    >
      <template #search>
        <UInput
          v-model="searchQuery"
          :placeholder="t('private.members.search')"
          icon="i-heroicons-magnifying-glass-20-solid"
        />
      </template>
      <template #applicant-data="{ row }">
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
          color="gray"
          variant="soft"
          size="xs"
          icon="i-heroicons-eye"
          class="mr-2"
          @click="viewApplication(row)"
        >
          {{ t('private.members.viewApplication') }}
        </UButton>
      </template>
    </UTable>

    <PrivateApplicationDetailsModal
      v-if="currentApplication"
      v-model="isApplicationModalOpen"
      :application="currentApplication"
      :questions="questions"
      :uuid="uuid"
      @handled="onApplicationHandled"
    />
  </div>
</template> 