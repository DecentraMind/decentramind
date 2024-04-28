<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const fileRef = ref<HTMLInputElement>()
const isDeleteAccountModalOpen = ref(false)

const toast = useToast()

function validate (state: any): FormError[] {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Please enter your name.' })
  if (!state.email) errors.push({ path: 'email', message: 'Please enter your email.' })
  if ((state.password_current && !state.password_new) || (!state.password_current && state.password_new)) errors.push({ path: 'password', message: 'Please enter a valid password.' })
  return errors
}

function onFileChange (e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  state.avatar = URL.createObjectURL(input.files[0])
}

async function onSubmit (event: FormSubmitEvent<any>) {
  // Do something with data
  console.log(event.data)

  toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
}




let info = $ref({})
let infoJ = $ref({})
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

const { getInfo, personalInfo } = $(aocommunity())

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
    console.log('---');
    const jsonData = info.Messages[0].Data;
    const jsonObjects = jsonData.match(/\{.*?\}/g);
    infoJ = jsonObjects.map(item => JSON.parse(item));
    accountForm.name = infoJ[0].username;
    accountForm.twitter = infoJ[0].twitter;
    accountForm.mail = infoJ[0].mail;
    accountForm.phone = infoJ[0].phone;
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
