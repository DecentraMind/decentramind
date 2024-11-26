<script setup lang="ts">
const { doLogin, othentLogin, isLoginModalOpen } = $(aoStore())
const { showError } = $(notificationStore())

const emit = defineEmits(['login'])

let arconnectLogining = $ref(false)
let othentLogining = $ref(false)

const onClickArConnect = async () => {
  arconnectLogining = true
  othentLogining = true
  try {
    const result = await doLogin()
    if (!result) {
      console.log('User did not connect the wallet.')
    }
    emit('login')
  } catch (error) {
    console.error('Error during login operation', error)
    showError('Failed to login.', error as Error)
  } finally {
    othentLogining = false
    arconnectLogining = false
  }
}

const onClickOthent = async () => {
  othentLogining = true
  try {
    const result = await othentLogin()
    if (!result) {
      console.log('User did not connect the wallet.')
    }
    emit('login')
  } catch (error) {
    console.error(error)
  } finally {
    othentLogining = false
  }
}
</script>

<template>
  <UModal v-model="isLoginModalOpen">
    <UCard
      class="h-fit flex flex-col items-center justify-start"
      :ui="{
        body: {
          base: 'w-full',
        }
      }"
    >
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Connect Your Wallet
        </h3>
      </template>
      <div v-if="!othentLogining && !arconnectLogining" class="flex justify-center space-x-3">
        <UButton :loading="arconnectLogining" color="white" class="w-[120px]" @click="onClickArConnect">
          <template #leading>
            <UAvatar
              src="/wallet/arconnect.svg"
              size="2xs"
            />
          </template>
          ArConnect
        </UButton>
        <ClientOnly fallback-tag="span" fallback="Loading...">
          <UButton :loading="othentLogining" color="white" class="w-[120px] hidden" @click="onClickOthent">
            <template #leading>
              <UAvatar
                src="/wallet/google.svg"
                size="2xs"
              />
            </template>
            Google
          </UButton>
        </ClientOnly>
      </div>
      <div v-else class="flex justify-center">
        <UIcon name="svg-spinners:12-dots-scale-rotate" />
      </div>
    </UCard>
  </UModal>
</template> 