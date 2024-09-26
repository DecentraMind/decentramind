<script setup lang="ts">
import type { UserInfo } from '~/types'
import { defaultUserAvatar } from '~/utils/arAssets'
import { userSchema } from '~/utils/schemas'
import { useUpload } from '~/composables/useUpload'

const { address } = $(aoStore())
const { updateUser } = $(communityStore())
const { showSuccess, showError } = $(notificationStore())

const { userInfo, isLoading, error: userInfoError, refetchUserInfo } = $(useUserInfo())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isSaving = $ref(false)
const saveInfo = async () => {
  isSaving = true
  try {
    await updateUser({
      name: userForm.name,
      avatar: userForm.avatar,
    })
    showSuccess('Profile updated')
    await refetchUserInfo()
  } catch (e) {
    showError('Failed to save profile.', e as Error)
  }
  isSaving = false
}

const router = useRouter()

let userForm = $ref<UserInfo & {address: string}>({
  name: userInfo?.name || '',
  avatar: userInfo?.avatar || '',
  address: address || '',
})

watch(() => userInfo, () => {
  console.log('userInfo changed:', userInfo)
  if (userInfo && address) {
    userForm = {...userInfo, address}
  }
})

onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }

  if (userInfo) {
    console.log('use userInfo[0]')
    userForm = {
      ...userInfo,
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
    uploadInput!.value = ''
    return
  }

  userForm.avatar = uploadResponse.ARHash!
}

</script>

<template>
  <UDashboardPanelContent class="pt-10 pb-24">
    <input ref="uploadInput" type="file" size="sm" class="opacity-0 h-0" @change="upload2AR">

    <div v-if="isLoading" class="w-full h-52 flex justify-center items-center">
      <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" />
    </div>
    <div v-else-if="userInfoError" class="w-full h-52 flex justify-center items-center">
      <UCard>
        <div class="flex-center text-center whitespace-pre-line text-xl text-gray-500">
          <div class="flex-col-center gap-y-4">
            <p>Failed to load data.</p>
            <UButton variant="soft" class="block" @click="refetchUserInfo()">Retry</UButton>
          </div>
        </div>
      </UCard>
    </div>

    <UForm v-if="!isLoading" :schema="userSchema" :state="userForm">
      <div class="flex-col-center gap-4 w-fit mb-4 mt-3">
        <UFormGroup
          name="avatar"
          @click="uploadInput && !isUploading && uploadInput.click()"
        >
          <div class="relative flex justify-center cursor-pointer">
            <ArAvatar
              v-if="!userForm.avatar || isLoading"
              alt=""
              size="2xl"
            />
            <ArAvatar
              v-else
              :src="userForm.avatar || defaultUserAvatar"
              alt="Avatar"
              size="2xl"
            />
            <div v-if="!isUploading" class="absolute bg-primary-500 bg-opacity-70 border-1 flex-center w-6 h-6 right-0 bottom-0 rounded-full"><UIcon name="uil:image-upload" class="block w-4 h-4 text-white" /></div>

            <div v-if="isUploading" class="absolute left-0 top-0 flex-center bg-primary-200 bg-opacity-50 rounded-full w-16 h-16"><UIcon name="svg-spinners:gooey-balls-2" class="w-8 h-8 text-white" /></div>
          </div>
        </UFormGroup>

        <UFormGroup
          name="name"
          :label="$t('setting.person.name')"
          :ui="{
            wrapper: 'ring-1 ring-gray-200 rounded-md px-2 pt-2 pb-0 hover:ring-primary-400'
          }"
        >
          <UInput
            v-model="userForm.name"
            type="text"
            class="w-72"
            variant="none"
            placeholder="Type your name"
            :ui="{
              padding: {
                '2xs': 'px-0',
                xs: 'px-0',
                sm: 'px-0',
                md: 'px-0',
                lg: 'px-0',
                xl: 'px-0',
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
