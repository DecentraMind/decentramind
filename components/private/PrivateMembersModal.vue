<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'

defineProps<{
  modelValue: boolean
  uuid: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

const modalTabs = [
  {
    name: 'members',
    label: t('private.members.title'),
    slot: 'members'
  },
  {
    name: 'questions',
    label: t('private.questions.title'),
    slot: 'questions'
  }
]

const searchQuery = ref('')

// State for members
const pendingMembers = ref<UserInfoWithAddress[]>([])
const currentMembers = ref<UserInfoWithAddress[]>([])
const memberHistory = ref<{
  action: 'add' | 'remove'
  admin: string
  member: string
  timestamp: number
}[]>([])

// Questions state
const questions = ref<string[]>([])

// Table columns
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
  }
]

interface HistoryRow {
  action: 'add' | 'remove'
  admin: string
  member: string
  timestamp: number
}

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

// Member management functions
function approveMember(member: UserInfoWithAddress) {
  // TODO: Implement approve member logic
  console.log('Approve member:', member)
}

function rejectMember(member: UserInfoWithAddress) {
  // TODO: Implement reject member logic
  console.log('Reject member:', member)
}

function removeMember(member: UserInfoWithAddress) {
  // TODO: Implement remove member logic
  console.log('Remove member:', member)
}

// Computed filtered members
const filteredPendingMembers = computed(() => {
  if (!searchQuery.value) return pendingMembers.value
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return pendingMembers.value.filter(member => 
    member.name.toLowerCase().includes(lowerCaseQuery) || 
    member.address.toLowerCase().includes(lowerCaseQuery)
  )
})

// Load data
onMounted(async () => {
  // TODO: Load actual data from the backend
  // This is just mock data for now
  pendingMembers.value = []
  currentMembers.value = []
  memberHistory.value = []
  questions.value = []
})
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{
      width: 'max-w-3xl'
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">
            {{ t('private.area.management') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </template>

      <!-- Tabs -->
      <UTabs :items="modalTabs">
        <template #members>
          <div class="space-y-6">
            <!-- Pending Members Section -->
            <div>
              <h4 class="font-medium mb-2">
                {{ t('private.members.pending') }}
              </h4>
              <UTable
                :rows="filteredPendingMembers"
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
                    color="primary"
                    size="xs"
                    @click="approveMember(row)"
                  >
                    {{ t('private.members.approve') }}
                  </UButton>
                  <UButton
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="rejectMember(row)"
                  >
                    {{ t('private.members.reject') }}
                  </UButton>
                </template>
              </UTable>
            </div>

            <!-- Current Members Section -->
            <div>
              <h4 class="font-medium mb-2">
                {{ t('private.members.current') }}
              </h4>
              <UTable
                :rows="currentMembers"
                :columns="memberColumns"
              >
                <template #actions-data="{ row }">
                  <UButton
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="removeMember(row)"
                  >
                    {{ t('private.members.remove') }}
                  </UButton>
                </template>
              </UTable>
            </div>

            <!-- Member History Section -->
            <div>
              <h4 class="font-medium mb-2">
                {{ t('private.members.history') }}
              </h4>
              <UTable
                :rows="memberHistory"
                :columns="historyColumns"
              />
            </div>
          </div>
        </template>

        <template #questions>
          <div class="space-y-4">
            <div
              v-for="(question, index) in questions"
              :key="index"
              class="flex items-center space-x-2"
            >
              <UInput
                v-model="questions[index]"
                :placeholder="t('private.questions.placeholder')"
              />
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
                @click="questions.splice(index, 1)"
              />
            </div>
            <UButton
              color="gray"
              variant="soft"
              @click="questions.push('')"
            >
              {{ t('private.questions.add') }}
            </UButton>
          </div>
        </template>
      </UTabs>
    </UCard>
  </UModal>
</template> 