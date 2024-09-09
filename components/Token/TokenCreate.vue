
<script setup lang="ts">
import type { CreateToken } from '~/types'
import { createTokenSchema } from '~/utils/schemas'
import { arUrl, defaultTokenLogo } from '~/utils/arAssets'
import { useUpload } from '~/composables/useUpload'

const { address } = $(aoStore())
const { createToken } = $(communityStore())
const { showError } = $(notificationStore())

const state = $ref<CreateToken>({
  logo: defaultTokenLogo,
  name: '',
  ticker: '',
  totalSupply: '0'
})

const { upload, isUploading, uploadError, uploadResponse } = $(useUpload())

const uploadInput = $ref<HTMLInputElement>()
async function upload2AR() {
  await upload({
    fileName: address.slice(-4),
    pathName: 'tokenLogo',
    file: uploadInput?.files?.[0]
  })

  if (uploadError || !uploadResponse) {
    showError('Failed to upload image.', uploadError)
    uploadInput!.value = ''
    return
  }

  state.logo = uploadResponse.ARHash!
}

let creating = $ref(false)
let showSuccessModal = $ref(false)
let tokenProcessID = $ref('')
const onSubmit = async() => {
  creating = true
  try {
    tokenProcessID = await createToken(state)
    showSuccessModal = true
  } catch (error) {
    console.error('Failed to create token.')
    console.error(error)
    showError('Failed to create token.', error as Error)
  } finally {
    creating = false
  }
}

const emit = defineEmits(['close-modal'])
</script>

<template>
  <div class="w-full max-w-[800px] overflow-y-auto px-2 py-4 sm:px-3 sm:py-6">
    <UAlert
      icon="heroicons:currency-dollar"
      title="Create Token"
      class="max-w-[75vw] w-[500px]"
    >
      <template #description>
        <p v-html="$t('token.create.description', { lineBreak: '<br>' })" />
      </template>
    </UAlert>
    <UForm
      v-if="!showSuccessModal"
      :schema="createTokenSchema"
      :state="state"
      class="space-y-8 pt-10"
      @submit="onSubmit"
    >
      <UFormGroup
        name="logo"
        :label="$t('token.logo')"
      >
        <div
          class="relative self-start flex-center object-cover cursor-pointer w-fit ring-1 ring-gray-300 dark:ring-gray-700 rounded-full overflow-hidden"
          title="Click to upload new logo."
          @click="uploadInput && !isUploading && uploadInput.click()"
        >
          <img
            v-if="state.logo"
            :src="arUrl(state.logo)"
            width="64"
            height="64"
            alt="logo"
          >
          <img
            v-if="!state.logo"
            :src="arUrl(defaultTokenLogo)"
            width="64"
            height="64"
            alt="logo"
          >
          <input ref="uploadInput" type="file" size="sm" class="opacity-0 w-0 h-0" @change="upload2AR">

          <div v-if="isUploading" class="absolute left-0 top-0 flex justify-center items-center bg-primary-200 bg-opacity-50 w-16 h-16"><UIcon name="svg-spinners:gooey-balls-2" class="w-8 h-8 text-white" /></div>
        </div>
      </UFormGroup>

      <UFormGroup
        name="name"
        :label="$t('token.name')"
      >
        <UInput v-model.trim="state.name" @change="state.ticker = state.name.toUpperCase().replaceAll(' ', '-')" />
      </UFormGroup>

      <UFormGroup
        name="ticker"
        :label="$t('token.ticker')"
      >
        <UInput v-model="state.ticker" :model-modifiers="{trim: true}" />
      </UFormGroup>

      <UFormGroup
        name="totalSupply"
        :label="$t('token.totalSupply')"
      >
        <UInput
          v-model="state.totalSupply"
          placeholder="Ticker"
          class="font-mono"
        />
      </UFormGroup>

      <div class="flex justify-center">
        <UButton color="white" type="submit" size="md" :loading="creating" class="mt-4">
          {{ $t('Submit') }}
        </UButton>
      </div>
    </UForm>

    <UModal v-model="showSuccessModal" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-center">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Successfully created token {{ state.name }}
            </h3>
          </div>
        </template>
        <UContainer class="w-full flex justify-around">
          <UButton
            :to="`https://www.ao.link/#/token/${tokenProcessID}`"
            active-class="text-primary"
            target="_blank"
            inactive-class="text-primary"
            @click="showSuccessModal = false; emit('close-modal')"
          >
            {{ $t('view.token') }}
          </UButton>
        </UContainer>
      </UCard>
    </UModal>
  </div>
</template>
