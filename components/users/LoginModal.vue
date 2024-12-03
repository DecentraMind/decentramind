<script setup lang="ts">
const { connectExtensionWallet, connectOthentWallet, registerOrLogin, updateVouchData, twitterVouched } = $(aoStore())
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
let { isLoginModalOpen, address } = $(aoStore())
const { showError } = $(notificationStore())
const { refetchUserInfo } = $(useUserInfo())

const emit = defineEmits(['login'])

type LoginWallet = 'extension' | 'othent'
let loginWallet = $ref<LoginWallet | null>(null)

type LoginStep = 'connecting' | 'vouching' | 'logging'
let loginStep = $ref<LoginStep>('connecting')

let isLoggingIn = $ref(false)
let isLoginSuccess = $ref(false)
const login = async () => {
  isLoggingIn = true
  try {
    await registerOrLogin(window.arweaveWallet)
    address = await window.arweaveWallet.getActiveAddress()
    console.log('update address after login', address)
    refetchUserInfo()
    isLoginSuccess = true
    console.log('show login success', isLoginSuccess)
    setTimeout(() => {
      console.log('emit login')
      isLoginModalOpen = false
      emit('login')
    }, 3000)
    setTimeout(() => {
      console.log('reset login step')
      loginStep = 'connecting'
    }, 3500)
  } catch (error) {
    showError('Failed to login.', error as Error)
    isLoginSuccess = false
  } finally {
    isLoggingIn = false
  }
}

const onClickLogin = async (wallet: LoginWallet) => {
  loginWallet = wallet

  const connectFunction = wallet === 'extension' ? connectExtensionWallet : 
    wallet === 'othent' ? connectOthentWallet :
    null

  try {
    if (!connectFunction) {
      throw new Error('Invalid login wallet')
    }
    if (await connectFunction()) {
      loginStep = 'vouching'
      await checkVouch(false)
    }
  } catch (error) {
    console.error('Error during login operation', error)
    showError('Failed to login.', error as Error)
  } finally {
    loginWallet = null
  }
}

let isCheckingVouch = $ref(false)
const checkVouch = async (showErrorMsg = true) => {
  isCheckingVouch = true
  await updateVouchData()
  isCheckingVouch = false
  if (!twitterVouched) {
    if (showErrorMsg) {
      showError('You are not vouched.')
    }
    return
  }
  loginStep = 'logging'
  await login()
}

const onClose = () => {
  isLoginModalOpen = false
  window.setTimeout(() => {
    loginWallet = null
    loginStep = 'connecting'
  }, 300)
}
</script>

<template>
  <UModal v-model="isLoginModalOpen" prevent-close @close-prevented="onClose">
    <UCard
      v-if="loginStep === 'connecting'"
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
      <div class="flex justify-center space-x-3">
        <UButton variant="outline" :loading="loginWallet === 'extension'" :disabled="!!loginWallet" @click="onClickLogin('extension')">
          <UAvatar
            src="/wallet/arconnect.svg"
            size="2xs"
          />
          ArConnect
        </UButton>
        <UButton variant="outline" :loading="loginWallet === 'othent'" :disabled="!!loginWallet" class="hidden" @click="onClickLogin('othent')">
          <UAvatar
            src="/wallet/google.svg"
            size="2xs"
          />
          Google
        </UButton>
      </div>
    </UCard>

    <UCard
      v-if="loginStep === 'vouching'"
      class="h-fit flex flex-col items-center justify-start"
      :ui="{
        header: {
          padding: 'py-4',
        },
        body: {
          base: 'w-full',
        },
      }"
    >
      <template #header>
        <h3 class="font-semibold leading-6 text-gray-900 dark:text-white">
          Vouch Required
        </h3>
      </template>
      <div v-if="!isCheckingVouch" class="w-full flex-center gap-x-4">
        <UButton
          color="gray"
          variant="ghost"
          title="I'm vouched, reload page"
          @click="checkVouch()"
        >
          I'm vouched
        </UButton>
        <NuxtLink
          to="https://g8way.io/Cikp3X7Zk4cI1RtBEq-pVh_fhz-npd5dZ5-0EgCxTQM"
          target="_blank"
        >
          <UButton icon="heroicons:arrow-top-right-on-square">
            Get Vouched
          </UButton>
        </NuxtLink>
      </div>
      <div v-else class="flex justify-center items-center gap-x-2">
        <UIcon name="svg-spinners:12-dots-scale-rotate" />
        <span>Checking vouch</span>
      </div>
    </UCard>

    <UCard
      v-if="loginStep === 'logging'"
      :ui="{
        header: {
          padding: 'py-4',
        },
        body: {
          base: 'w-full',
        },
      }"
      class="h-fit flex flex-col items-center justify-start"
    >
      <template #header>
        <h3 class="font-semibold leading-6 text-gray-900 dark:text-white">
          Login
        </h3>
      </template>
      <div v-if="isLoggingIn" class="flex justify-center">
        <UIcon name="svg-spinners:12-dots-scale-rotate" />
      </div>
      <div v-else-if="isLoginSuccess" class="flex justify-center">
        🎉 Welcome to DecentraMind!
      </div>
    </UCard>
  </UModal>
</template> 