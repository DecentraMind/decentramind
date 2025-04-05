<script setup lang="ts">
import type { UserInfoWithAddress } from '~/types'
import { enableCommunityCreation } from '~/utils/community/community'
import { notificationStore } from '~/stores/notificationStore'
import { communityStore } from '~/stores/communityStore'
// Interface for the form state
interface EnableCommunityFormState {
  selectedUser: UserInfoWithAddress | undefined
}

const { showError, showSuccess } = $(notificationStore())

// Use reactive for form state to work with UForm
const formState = reactive<EnableCommunityFormState>({
  selectedUser: undefined
})

const isSaving = ref(false)
const allUsers = ref<UserInfoWithAddress[]>([])

// Fetch all users on component mount
onMounted(async () => {
  try {
    const { getAllUsers } = communityStore()
    const users = await getAllUsers()
    
    // Map users to include the needed properties
    allUsers.value = Object.entries(users).map(([address, userInfo]) => ({
      ...userInfo,
      address,
      name: userInfo.name || address,
      muted: false // Add the muted property
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    // Display error notification
    const { showError } = notificationStore()
    showError('Failed to load users')
  }
})

// Search function for the select menu
function search(query: string, users: UserInfoWithAddress[]) {
  if (!query) return users
  
  const lowercaseQuery = query.toLowerCase()
  return users.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) || 
    user.address.toLowerCase().includes(lowercaseQuery)
  )
}

// Handle enabling community creation
async function submit() {
  if (!formState.selectedUser) {
    showError('Please select a user')
    return
  }
  
  try {
    isSaving.value = true
    await enableCommunityCreation(formState.selectedUser.address)
    
    showSuccess(`Successfully enabled community creation for ${formState.selectedUser.name}`)
    // Reset form
    formState.selectedUser = undefined
  } catch (error) {
    console.error('Error enabling community creation:', error)
    showError('Failed to enable community creation:', error as Error)
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <div class="w-full h-[calc(100vh-var(--header-height))] gap-4 p-8 overflow-y-auto">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('community.admin.title') }}</h1>
      
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ $t('community.admin.enableCreation') }}</h2>
          </div>
        </template>
        
        <div class="space-y-6">
          <p class="text-gray-600">{{ $t('community.admin.enableCreationDescription') }}</p>
          
          <UForm :state="formState" @submit="submit">
            <UFormGroup :label="$t('community.admin.selectUser')">
              <USelectMenu
                v-model="formState.selectedUser"
                :searchable="true"
                :search="search"
                :search-attributes="['address', 'name']"
                searchable-placeholder="Search by name or address..."
                :options="allUsers"
                option-attribute="name"
                by="address"
                trailing
                placeholder="Search by address or name"
                class="w-full"
              >
                <template #option-empty="{ query }">
                  <q>{{ query }}</q> not found
                </template>
                <template #option="{ option }">
                  <div class="flex items-center space-x-2">
                    <ArAvatar
                      :src="option.avatar"
                      :alt="option.name"
                      class="w-6 h-6"
                    />
                    <div>
                      <span class="font-medium">{{ option.name }}</span>
                      <div class="text-xs text-gray-500 max-w-xs">{{ option.address }}</div>
                    </div>
                  </div>
                </template>
                <template #label>
                  <div v-if="formState.selectedUser" class="flex items-center space-x-2">
                    <ArAvatar
                      :src="formState.selectedUser.avatar"
                      :alt="formState.selectedUser.name"
                      class="w-6 h-6"
                    />
                    <div>
                      <span class="font-medium">{{ formState.selectedUser.name }}</span>
                      <div class="text-xs text-gray-500 max-w-xs">{{ formState.selectedUser.address }}</div>
                    </div>
                  </div>
                  <span v-else>{{ $t('community.admin.selectPlaceholder') }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>
            
            <div class="flex justify-end mt-4">
              <UButton type="submit" :loading="isSaving" :disabled="isSaving || !formState.selectedUser">
                {{ $t('community.admin.enable') }}
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </div>
  </div>
</template>
