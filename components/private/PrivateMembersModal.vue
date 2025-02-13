<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'

const props = defineProps<{
  modelValue: boolean
  uuid: string
  defaultTab?: string
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

// Get the default index based on the defaultTab prop
const defaultIndex = computed(() => {
  if (!props.defaultTab) return 0
  const index = modalTabs.findIndex(tab => tab.name === props.defaultTab)
  return index === -1 ? 0 : index
})

const activeTab = ref(0)

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

// Load data
onMounted(async () => {
  // Set initial active tab
  activeTab.value = defaultIndex.value

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
      <UTabs
        v-model="activeTab"
        :items="modalTabs"
        :default-index="defaultIndex"
      >
        <template #members>
          <div class="space-y-6">
            <!-- Pending Members Section -->
            <PrivatePendingMembers
              :members="pendingMembers"
              :questions="questions"
              @approve="approveMember"
              @reject="rejectMember"
            />

            <!-- Current Members Section -->
            <PrivateCurrentMembers
              :members="currentMembers"
              @remove="removeMember"
            />

            <!-- Member History Section -->
            <PrivateMemberHistory
              :history="memberHistory"
            />
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