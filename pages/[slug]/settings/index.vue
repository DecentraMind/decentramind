<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const fileRef = ref<HTMLInputElement>()
const isDeleteAccountModalOpen = ref(false)

const state = reactive({
  name: 'Benjamin Canac',
  email: 'ben@nuxtlabs.com',
  username: 'benjamincanac',
  avatar: '',
  bio: '',
  password_current: '',
  password_new: ''
})

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

function onFileClick () {
  fileRef.value?.click()
}

async function onSubmit (event: FormSubmitEvent<any>) {
  // Do something with data
  console.log(event.data)

  toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
}





const accountForm = reactive({ 
    name: 'tim', 
    twitter: 'Benjamin', 
    showtwitter: true, 
    mail: 'benjamincanac',
    showmail: true,
    telegram: '+12',
    showtelegram: true,
})

function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}




</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitAccount">
      <template #header>
        <div class="flex">
          <UAvatar
            src="https://avatars.githubusercontent.com/u/739984?v=4"
            alt="Avatar"
            size="3xl"
          />
          <div class="flex items-center p-3 ml-2">
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

      <div class="text-2xl">社交信息</div>
      <UFormGroup label="twitter" name="twitter" class="mb-3">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.twitter" />
          <UToggle v-model="accountForm.showtwitter" />显示
        </div>
      </UFormGroup>
      <UFormGroup label="mail" name="mail">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.mail" />
          <UToggle v-model="accountForm.showmail" />显示
        </div>
      </UFormGroup>
      <UFormGroup label="mail" name="mail">
        <div class="flex items-center space-x-3">
          <UInput v-model="accountForm.telegram" />
          <UToggle v-model="accountForm.showtelegram" />显示
        </div>
      </UFormGroup>

      <template #footer>
        <UButton type="submit" color="black">
          Save account
        </UButton>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
