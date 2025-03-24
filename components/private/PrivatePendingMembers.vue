<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useApplicationsByCommunityQuery } from '~/composables/community/communityQuery'
import type { PrivateApplication } from '~/types'
import { shortString } from '~/utils/string'

const props = defineProps<{
  uuid: string
}>()

const { t } = useI18n()
const emit = defineEmits<{
  (_: 'member-updated'): void
}>()

const searchQuery = ref('')
let isApplicationModalOpen = $ref(false)
let currentApplication = $ref<PrivateApplication | null>(null)

const { data: pendingApplications, refetch, isFetching } = useApplicationsByCommunityQuery(props.uuid, {
  enabled: false
})
const queryClient = useQueryClient()

function viewApplication(application: PrivateApplication) {
  currentApplication = application
  isApplicationModalOpen = true
}

function onApplicationHandled() {
  if (currentApplication && pendingApplications.value) {
    const newPendingApplications = pendingApplications.value.filter(app => app.address !== currentApplication!.address)

    queryClient.setQueryData(['community', 'applications', props.uuid], newPendingApplications)
  }
  emit('member-updated')
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
  if (!pendingApplications.value) return []
  if (!searchQuery.value) return pendingApplications.value
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return pendingApplications.value.filter(app => 
    app.address.toLowerCase().includes(lowerCaseQuery)
  )
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h4 class="font-semibold mb-2">
        {{ t('private.members.pending') }}
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
      :rows="filteredMembers"
      :columns="memberColumns"
      :loading="isFetching"
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
      :uuid="uuid"
      @handled="onApplicationHandled"
    />
  </div>
</template> 