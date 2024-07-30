<script setup lang="ts">
import { arUrl, defaultUserAvatar } from '~/utils/arAssets'
import { z } from 'zod'

const userForm = $ref({
  avatar: '',
  name: ''
})

const schema = z.object({
  name: z.string().min(2).max(28),
})

type Schema = z.infer<typeof schema>

const { address } = $(aoStore())
const { getUserByAddress, personalInfo } = $(aoCommunityStore())
const { showMessage } = $(notificationStore())

const saveInfo = async () => {
  await personalInfo(
    userForm.avatar,
    userForm.name,
  )
  showMessage('Profile updated')
}

const router = useRouter()
let isLoading = $ref(true)
onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }

  try {
    const user = await getUserByAddress(address)
    userForm.avatar = user.avatar
    userForm.name = user.name
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  isLoading = false
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
  <UDashboardPanelContent class="pb-24">
    <Input ref="uploadInput" type="file" size="sm" class="opacity-0" @change="updateAvatar" />
    <UForm ref="form" :schema="schema" :state="userForm" class="w-fit">
      <div class="flex items-center mb-4 mt-3">
        <div @click="uploadInput && uploadInput.click()">
          <UAvatar
            v-if="userForm.avatar === 'N/A' || isLoading"
            alt=""
            class="ml-5"
            size="2xl"
          />
          <UAvatar
            v-else
            :src="userForm.avatar || arUrl(defaultUserAvatar)"
            alt="Avatar"
            class="ml-5"
            size="2xl"
          />
        </div>
        <div class="flex items-center ml-6">
          <UFormGroup name="name" class="mb-3">
            <template #label>
              {{ $t('setting.person.name') }}
            </template>
            <UInput v-model="userForm.name" />
          </UFormGroup>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton type="submit" color="black" @click="saveInfo">
          {{ $t('setting.save') }}
        </UButton>
      </div>
    </UForm>
  </UDashboardPanelContent>
</template>
