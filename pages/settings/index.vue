<script setup lang="ts">
import { arUrl, userAvatar } from '~/utils/arAssets'
import { z } from 'zod'

const toast = useToast()

const accountForm = $ref({
  avatar: '',
  name: '',
  twitter: '',
  showtwitter: true,
  mail: '',
  showmail: true,
  phone: '',
  showtelegram: true,
  github: '',
})


const schema = z.object({
  name: z.string().min(2).max(10),
})

type Schema = z.infer<typeof schema>

function onSubmitAccount() {
  console.log('Submitted form:', accountForm)
}

const { userInfo, getUser: getInfo, personalInfo } = $(aoCommunityStore())

const saveInfo = async () => {

  await personalInfo(
    accountForm.avatar,
    accountForm.name,
    accountForm.twitter,
    accountForm.showtwitter,
    accountForm.mail,
    accountForm.showmail,
    accountForm.phone,
    accountForm.showtelegram,
    accountForm.github
  )
  toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
  await getInfo()
}
const { gettoken, getAccessToken } = $(linktwitter())
const gettwitter = async () => {
  await getAccessToken()
}

let connectTwitter = $ref(false)
let connectGithub = $ref(false)
onMounted(async () => {
  try {
    //info = await getInfo();
    //console.log("--",info)
    //const jsonData = info.Messages[0].Data;
    //const jsonObjects = jsonData.match(/\{.*?\}/g);
    //infoJson = jsonObjects.map(item => JSON.parse(item));
    //console.log(infoJson)
    await getInfo()
    accountForm.avatar = userInfo[0].avatar
    accountForm.name = userInfo[0].name
    accountForm.twitter = userInfo[0].twitter
    accountForm.showtwitter = userInfo[0].showtwitter
    accountForm.mail = userInfo[0].mail
    accountForm.showmail = userInfo[0].showmail
    accountForm.phone = userInfo[0].phone
    accountForm.showtelegram = userInfo[0].showphone
    accountForm.github = userInfo[0].github
    if (accountForm.twitter == 'Success') {
      connectTwitter = true
    }
    if (accountForm.github == 'Success') {
      connectGithub = true
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
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
          accountForm.avatar = e.target!.result as string
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
    <UForm ref="form" :schema="schema" :state="accountForm" class="w-1/3" @submit.prevent="onSubmitAccount">
      <div class="flex items-center mb-4 mt-3">
        <div @click="uploadInput && uploadInput.click()">
          <UAvatar
            v-if="accountForm.avatar === 'N/A'"
            alt=""
            class="ml-5"
            size="2xl"
          />
          <UAvatar
            v-else
            :src="accountForm.avatar || arUrl(userAvatar)"
            alt="Avatar"
            class="ml-5"
            size="2xl"
          />
        </div>
        <div class="flex items-center p-3 ml-2">
          <UFormGroup name="name" class="mb-3">
            <template #label>
              {{ $t('setting.person.name') }}
            </template>
            <UInput v-model="accountForm.name" />
          </UFormGroup>
        </div>
      </div>

      <div class="flex justify-center">
        <UButton type="submit" color="black" @click="saveInfo">
          {{ $t('setting.save') }}
        </UButton>
      </div>
    </UForm>
  </UDashboardPanelContent>
</template>
