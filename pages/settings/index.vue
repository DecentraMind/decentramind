<script setup lang="ts">
import { arUrl, defaultUserAvatar } from '~/utils/arAssets'
import { userSchema } from '~/utils/schemas'

const { address } = $(aoStore())
const { userInfo, updateUser } = $(aoCommunityStore())
const { showMessage } = $(notificationStore())

const saveInfo = async () => {
  await updateUser(
    userForm.avatar,
    userForm.name,
  )
  // userInfo = [{...userForm}]
  showMessage('Profile updated')
}

const router = useRouter()
const isLoading = $computed(() => !userInfo?.length)

let userForm = $ref({
  name: userInfo[0]?.name || '',
  avatar: userInfo[0]?.avatar || ''
})

watch(() => userInfo, (userInfo) => {
  console.log('userInfo changed:', userInfo)
  if (userInfo?.length) {
    userForm = {...userInfo[0]}
  }
})

onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }

  if (userInfo?.length) {
    console.log('use userInfo[0]')
    userForm = {...userInfo[0]}
  }
  console.log({userForm})
})

const uploadInput = $ref<HTMLInputElement>()

const updateAvatar = () => {
  if (!uploadInput) return
  if (!uploadInput.files?.length) {
    throw new Error('No file selected.')
  }
  const file = uploadInput.files[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        if (img.width <= 400 && img.height <= 400 && img.width === img.height) {
          // console.log({res: e.target?.result})
          userForm.avatar = e.target!.result as string
        } else {
          alert('Image dimensions should be square and both dimensions should be less than or equal to 400px.')
        }
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }
}

</script>

<template>
  <UDashboardPanelContent class="pt-10 pb-24">
    <Input ref="uploadInput" type="file" size="sm" class="opacity-0 h-0" @change="updateAvatar" />

    <div v-if="isLoading" class="w-full h-52 flex justify-center items-center">
      <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" />
    </div>

    <UForm v-if="!isLoading" :schema="userSchema" :state="userForm">
      <div class="flex flex-col items-center mb-4 mt-3">
        <UFormGroup name="avatar" @click="uploadInput && uploadInput.click()">
          <div class="flex justify-center">
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
          </div>
        </UFormGroup>

        <UFormGroup name="name" class="mb-4 mt-4">
          <template #label>
            {{ $t('setting.person.name') }}
          </template>
          <UInput v-model="userForm.name" class="w-72" />
        </UFormGroup>

        <UButton type="submit" @click="saveInfo">
          {{ $t('setting.save') }}
        </UButton>
      </div>
    </UForm>
  </UDashboardPanelContent>
</template>
