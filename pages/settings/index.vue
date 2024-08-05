<script setup lang="ts">
import { unref } from 'vue'
import type { UserInfo } from '~/types'
import { arUrl, defaultUserAvatar } from '~/utils/arAssets'
import { userSchema } from '~/utils/schemas'

const { address } = $(aoStore())
const { userInfo, updateUser } = $(aoCommunityStore())
const { showSuccess, showError } = $(notificationStore())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isSaving = $ref(false)
const saveInfo = async () => {
  isSaving = true
  try {
    await updateUser({
      name: userForm.name,
      avatar: userForm.avatar,
      avatarARHash: userForm.avatarARHash
    })
    // userInfo = [{...userForm}]
    showSuccess('Profile updated')
  } catch (e) {
    showError('Failed to save profile.', e as Error)
  }
  isSaving = false
}

const router = useRouter()
const isLoading = $computed(() => !userInfo?.length)

let userForm = $ref<UserInfo & {address: string}>({
  name: userInfo[0]?.name || '',
  avatar: userInfo[0]?.avatar || '',
  address: address || '',
  avatarARHash: userInfo[0]?.avatarARHash || '',
})

watch(() => userInfo, (userInfo) => {
  console.log('userInfo changed:', userInfo)
  if (userInfo?.length && address) {
    userForm = {...userInfo[0], address}
  }
})

onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }

  if (userInfo?.length) {
    console.log('use userInfo[0]')
    userForm = {
      ...userInfo[0],
      address
    }
  }
  console.log({userForm})

})

const uploadInput = $ref<HTMLInputElement>()

const { upload, isUploading, uploadError, uploadResponse } = $(useUpload())

async function upload2AR() {
  await upload({
    fileName: address.slice(-4),
    pathName: 'userAvatar',
    file: uploadInput?.files?.[0]
  })

  if (uploadError || !uploadResponse) {
    showError('Failed to upload image.', uploadError)
    return
  }

  // @caution 4everland's arweave gateway is at beta version,
  // try uploadResponse.url if it not works
  userForm.avatar = everlandGateway + uploadResponse.ARHash!
  userForm.avatarARHash = uploadResponse.ARHash!
}

</script>

<template>
  <UDashboardPanelContent class="pt-10 pb-24">
    <Input ref="uploadInput" type="file" size="sm" class="opacity-0 h-0" @change="upload2AR" />

    <div v-if="isLoading" class="w-full h-52 flex justify-center items-center">
      <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" />
    </div>

    <UForm v-if="!isLoading" :schema="userSchema" :state="userForm">
      <div class="flex flex-col items-center gap-4 w-fit mb-4 mt-3">
        <UFormGroup name="avatar" @click="uploadInput && !isUploading && uploadInput.click()">
          <div class="relative flex justify-center cursor-pointer">
            <UAvatar
              v-if="userForm.avatar === 'N/A' || isLoading"
              alt=""
              size="2xl"
            />
            <UAvatar
              v-else
              :src="userForm.avatar || arUrl(defaultUserAvatar)"
              alt="Avatar"
              size="2xl"
            />
            <div v-if="!isUploading" class="absolute bg-primary-500 bg-opacity-70 border-1 flex justify-center items-center w-6 h-6 right-0 bottom-0 rounded-full"><UIcon name="uil:image-upload" class="block w-4 h-4 text-white" /></div>

            <div v-if="isUploading" class="absolute left-0 top-0 flex justify-center items-center bg-primary-200 bg-opacity-50 rounded-full w-16 h-16"><UIcon name="svg-spinners:gooey-balls-2" class="w-8 h-8 text-white" /></div>
          </div>
        </UFormGroup>

        <UFormGroup
          name="name"
          :ui="{
            wrapper: 'ring-1 ring-gray-200 rounded-md p-2 hover:ring-primary-400',
            label: {
              base: 'font-normal w-full text-gray-500'
            }
          }"
        >
          <template #label>
            {{ $t('setting.person.name') }}
          </template>
          <UInput
            v-model="userForm.name"
            class="w-72"
            variant="none"
            :ui="{
              base: 'shadow-none px-0 font-medium',
              size: {
                '2xs': 'text-sm',
                xs: 'text-base',
                sm: 'text-base',
                md: 'text-base',
                lg: 'text-base',
                xl: 'text-base',
              },
              padding: {
                '2xs': 'px-0 py-1',
                xs: 'px-0 py-1.5',
                sm: 'px-0 py-1.5',
                md: 'px-0 py-2',
                lg: 'px-0 py-2.5',
                xl: 'px-0 py-2.5',
              }
            }"
          />
        </UFormGroup>

        <UButton type="submit" class="mt-4 text-center w-fit" :disabled="isSaving" :loading="isSaving" @click="saveInfo">
          {{ $t('setting.save') }}
        </UButton>
      </div>
    </UForm>
  </UDashboardPanelContent>
</template>
