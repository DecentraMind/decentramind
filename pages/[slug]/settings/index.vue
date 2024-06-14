<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

import { z } from 'zod'

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


const schema = z.object({
  name: z.string().min(2).max(10),
})

type Schema = z.infer<typeof schema>

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
const { gettoken } = $(linktwitter())
const gettwitter = async () => {
  await gettoken()
}

let connectTwitter = $ref(false)
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
    if (accountForm.twitter == 'Success') {
      connectTwitter = true
    }
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
    <UForm ref="form" :schema="schema" :state="accountForm" @submit.prevent="onSubmitAccount">
      <div class="flex mb-10 mt-3">
        <div @click="logoupload">
          <UAvatar
            v-if="accountForm.avatar === 'N/A'"
            src="/community/chatavatar.jpg"
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


      <div class="text-3xl font-semibold leading-6 text-gray-900 dark:text-white mb-10 ml-5">{{ $t('setting.person.social') }}
      </div>
      <UFormGroup label="twitter" name="twitter" class="mb-5 pl-10">
        <template #label>
          {{ $t('setting.person.twitter') }}
        </template>
        <div class="flex items-center space-x-3">
          <UButton v-if="connectTwitter" color="white" class="mr-5 w-[150px]" disabled>Connected Twitter</UButton>
          <UButton v-else color="white" class="mr-20 w-[90px]" @click="gettwitter">{{ $t('twitter.link')}}</UButton>
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
          Telegram
        </template>
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.phone" />
          <UToggle v-model="accountForm.showtelegram" />
          <div>{{ $t('show') }}</div>
        </div>
      </UFormGroup>


      <div class="flex justify-center">
        <UButton type="submit" color="black" @click="saveInfo">
          {{ $t('setting.save')}}
        </UButton>
      </div>
    </UForm>
  </UDashboardPanelContent>
</template>
