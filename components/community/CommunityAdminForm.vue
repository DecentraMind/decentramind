<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { validateCommunityAdmin, type CommunityAdminSchema } from '~/utils/schemas'
import type { Community, UserInfoWithAddress } from '~/types'

const props = defineProps<{
  uuid: string
  initState: Community['admins']
  class?: string
}>()

const { updateCommunityAdmins, getCommunityUser } = $(communityStore())
const { showSuccess, showError } = $(notificationStore())

const formState = $ref<CommunityAdminSchema>({ admins: [] })

function addEmptyAdmin() {
  formState.admins.push({ address: '', name: 'Search by address or name', avatar: '' })
  console.log('formState.admins: ', formState.admins)
}

async function removeAdmin(index: number) {
  if (formState.admins.length === 1) {
    formState.admins[0] = { address: '', name: '', avatar: '' }
  } else {
    formState.admins.splice(index, 1)
  }
}

let isSaving = $ref(false)
async function onFormSubmit(event: FormSubmitEvent<CommunityAdminSchema>) {
  console.log('onCommunityAdminFormSubmit: ', event.data)
  try {
    isSaving = true
    const filteredUniqAdminAddresses = [...new Set(event.data.admins.filter(admin => admin.address).map(admin => admin.address))]
    console.log('filteredUniqAdminAddresses: ', filteredUniqAdminAddresses)
    await updateCommunityAdmins(props.uuid, filteredUniqAdminAddresses)
    showSuccess('Successfully updated community admins.')
  } catch (error) {
    console.error('Error updating community admins:', error)
    showError('Failed to update community admins!', error as Error)
  } finally {
    isSaving = false
  }
}

async function search(query: string) {
  if (!query) {
    return communityUsers
  }
  const lowerCaseQuery = query.toLowerCase()
  return communityUsers.filter(user => user.name.toLowerCase().includes(lowerCaseQuery) || user.address.toLowerCase().includes(lowerCaseQuery))
}

let communityUsers = $ref<UserInfoWithAddress[]>([])
onMounted(async () => {
  communityUsers = Object.values(await getCommunityUser(props.uuid)).map(user => ({
    ...user,
    name: user.name || user.address
  }))

  console.log('props.initState: ', props.initState)
  if (props.initState.length > 0) {
    formState.admins = props.initState.map(adminAddress => {
      const user = communityUsers.find(user => user.address === adminAddress)
      if (!user) {
        console.error('User not found: ', adminAddress)
        return { address: adminAddress, name: adminAddress, avatar: '' }
      }
      return { ...user, address: adminAddress, avatar: user.avatar || '' }
    })
    console.log('formState.admins: ', formState.admins)
  } else {
    addEmptyAdmin()
  }
  console.log('communityUsers: ', communityUsers)
})
</script>

<template>
  <div :class="cn('pt-10 pb-6 px-6 md:px-16 w-fit min-h-[260px]', props.class)">
    <UAlert
      icon="heroicons:user-group"
      :title="$t('community.admins.title')"
      class="max-w-[75vw] w-full md:w-[580px]"
    >
      <template #description>
        <p v-html="$t('community.admins.modalDescription', { lineBreak: '<br>' })" />
      </template>
    </UAlert>

    <UForm
      :validate="validateCommunityAdmin"
      :state="formState"
      class="flex flex-col items-center space-y-7 pt-10"
      @submit="onFormSubmit"
    >
      <UFormGroup
        v-for="(admin, index) in formState.admins"
        :key="index"
        :name="`admins[${index}]`"
        class="w-full"
      >
        <div class="flex w-full items-center space-x-2">
          <USelectMenu
            v-model="formState.admins[index]"
            :searchable="search"
            :search-attributes="['address', 'name']"
            searchable-placeholder="Search..."
            :options="communityUsers"
            option-attribute="name"
            by="address"
            trailing
            leading

            placeholder="Search by address or name"
            class="flex-grow"
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
                <span>{{ option.name }}</span>
              </div>
            </template>
            <template #label>
              <div class="flex items-center space-x-2">
                <ArAvatar
                  v-if="formState.admins[index].avatar"
                  :src="formState.admins[index].avatar"
                  :alt="formState.admins[index].name"
                  class="w-6 h-6"
                />
                <span>{{ formState.admins[index].name }}</span>
              </div>
            </template>
          </USelectMenu>
          <UButton
            variant="outline"
            icon="heroicons:x-mark"
            :class="cn({
              '!mr-10': index !== formState.admins.length - 1,
            })"
            @click="removeAdmin(index)"
          />
          <UButton
            v-if="index === formState.admins.length-1"
            variant="outline"
            icon="heroicons:plus"
            @click="addEmptyAdmin"
          />
        </div>
      </UFormGroup>

      <UButton type="submit" :loading="isSaving" :disabled="isSaving">
        {{ $t('Save') }}
      </UButton>
    </UForm>
  </div>
</template>
