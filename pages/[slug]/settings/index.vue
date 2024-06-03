<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const toast = useToast()

let info = $ref({})
let infoJson = $ref({})
let accountForm = $ref({
  avatar: '',
  name: '',
  twitter: '',
  showtwitter: true,
  mail: '',
  showmail: true,
  phone: '',
  showtelegram: true,
})
let isLoading = $ref(false)

function onSubmitAccount() {
  console.log('Submitted form:', accountForm)
}

const { userInfo, getInfo, personalInfo } = $(aocommunityStore())

const saveInfo = async () => {

  await personalInfo(
    accountForm.avatar, 
    accountForm.name, 
    accountForm.twitter, 
    accountForm.showtwitter,
    accountForm.mail, 
    accountForm.showmail,
    accountForm.phone,
    accountForm.showtelegram
  )
  toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
  await getInfo()
}

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
    accountForm.name = userInfo[0].name;
    accountForm.twitter = userInfo[0].twitter;
    accountForm.showtwitter = userInfo[0].showtwitter;
    accountForm.mail = userInfo[0].mail;
    accountForm.showmail = userInfo[0].showmail;
    accountForm.phone = userInfo[0].phone;
    accountForm.showtelegram = userInfo[0].showphone;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const logoupload = () => {
  const input = document.querySelector('#logoupload') as any
  input.click()
}

const handleUp = (event) => {
  const file = event.target?.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      accountForm.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <Input id="logoupload" type="file" size="sm" class="opacity-0" @change="handleUp" />
    <UCard @submit.prevent="onSubmitAccount">
      <template #header>
        <div class="flex">
          <div @click="logoupload">
            <UAvatar
              v-if="accountForm.avatar === 'N/A'"
              src="https://avatars.githubusercontent.com/u/739984?v=4" 
              alt="Avatar" 
              class="ml-5" 
              size="3xl" 
            />
            <UAvatar
              v-else
              :src="accountForm.avatar"
              alt="Avatar" 
              class="ml-5" 
              size="3xl" 
            />
          </div>
          <div class="flex items-center p-3 ml-5">
            <UFormGroup name="name" class="mb-3">
              <template #label>
                {{ $t('setting.person.name') }}
              </template>
              <UInput v-model="accountForm.name" />
            </UFormGroup>
          </div>
        </div>
      </template>

      <div class="text-3xl font-semibold leading-6 text-gray-900 dark:text-white mb-10 ml-5">{{ $t('setting.person.social') }}
      </div>
      <UFormGroup label="twitter" name="twitter" class="mb-5 pl-10">
        <template #label>
          {{ $t('setting.person.twitter') }}
        </template>
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.twitter" />
          <UToggle v-model="accountForm.showtwitter" />
          <div>{{ $t('show') }}</div>
        </div>
      </UFormGroup>
      <UFormGroup label="mail" name="mail" class="mb-5 pl-10">
        <template #label>
          {{ $t('setting.person.mail') }}
        </template>
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.mail" />
          <UToggle v-model="accountForm.showmail" />
          <div>{{ $t('show') }}</div>
        </div>
      </UFormGroup>
      <UFormGroup label="phone" name="phone" class="mb-5 pl-10">
        <template #label>
          {{ $t('setting.person.phone') }}
        </template>
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.phone" />
          <UToggle v-model="accountForm.showtelegram" />
          <div>{{ $t('show') }}</div>
        </div>
      </UFormGroup>

      <template #footer>
        <div class="flex justify-center">
          <UButton type="submit" color="black" @click="saveInfo">
            {{ $t('setting.save')}}
          </UButton>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
