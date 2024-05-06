<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const toast = useToast()


let info = $ref({})
let infoJson = $ref({})
let accountForm = $ref({ 
    name: '', 
    twitter: '', 
    showtwitter: true, 
    mail: '',
    showmail: true,
    phone: '',
    showtelegram: true,
})
let isLoading = $ref(false)

function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}

const { getInfo, personalInfo } = $(aocommunityStore())

const saveInfo = async () => {
  if (isLoading) return
  isLoading = true

  await personalInfo(accountForm.name, accountForm.twitter, accountForm.mail, accountForm.phone)
  toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
  isLoading = false
}

onMounted(async () => {
  try {
    info = await getInfo();
    const jsonData = info.Messages[0].Data;
    const jsonObjects = jsonData.match(/\{.*?\}/g);
    infoJson = jsonObjects.map(item => JSON.parse(item));
    accountForm.name = infoJson[0].username;
    accountForm.twitter = infoJson[0].twitter;
    accountForm.mail = infoJson[0].mail;
    accountForm.phone = infoJson[0].phone;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitAccount">
      <template #header>
        <div class="flex">
          <UAvatar
            src="https://avatars.githubusercontent.com/u/739984?v=4"
            alt="Avatar"
            class="ml-5"
            size="3xl"
          />
          <div class="flex items-center p-3 ml-5">
            <UFormGroup
              label="修改用户名"
              name="name" 
              class="mb-3"
            >
              <UInput v-model="accountForm.name" />
            </UFormGroup>
          </div>
        </div>
      </template>

      <div class="text-3xl font-semibold leading-6 text-gray-900 dark:text-white mb-10 ml-5">社交信息</div>
      <UFormGroup label="twitter" name="twitter" class="mb-5 pl-10">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.twitter" />
          <UToggle v-model="accountForm.showtwitter" />显示
        </div>
      </UFormGroup>
      <UFormGroup label="mail" name="mail" class="mb-5 pl-10">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.mail" />
          <UToggle v-model="accountForm.showmail" />显示
        </div>
      </UFormGroup>
      <UFormGroup label="phone" name="phone" class="mb-5 pl-10">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.phone" />
          <UToggle v-model="accountForm.showtelegram" />显示
        </div>
      </UFormGroup>

      <template #footer>
        <div class="flex justify-center">
          <UButton type="submit" color="black" @click="saveInfo">
            保存修改
          </UButton>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
