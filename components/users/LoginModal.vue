<script setup lang="ts">
import { VOUCH_SITE_URL } from '~/utils/constants'

const { connectExtensionWallet, connectOthentWallet, registerOrLogin, updateVouchData, twitterVouched, twitterVouchedIDs } = $(aoStore())
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
    if (twitterVouchedIDs.length <= 0) {
      throw new Error('No vouched X identifiers found.')
    }
    await registerOrLogin(window.arweaveWallet, twitterVouchedIDs[0])

    // update localstorage cached address to remember the login status
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

const onClickConnect = async (wallet: LoginWallet) => {
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
let isCheckVouchSuccess = $ref(false)
const checkVouch = async (showErrorMsg = true) => {
  try {
    isCheckingVouch = true
    await updateVouchData()
    isCheckingVouch = false
    isCheckVouchSuccess = true

    if (!twitterVouched) {
      if (showErrorMsg) {
        showError('You are not vouched.')
      }
      return
    }

    loginStep = 'logging'
    await login()
  } catch (_) {
    // showError('Failed to check vouch.', error as Error)
    isCheckVouchSuccess = false
  } finally {
    isCheckingVouch = false
  }
}

const onClose = () => {
  if (loginStep === 'vouching') {
    return
  }
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
        <UButton variant="outline" :loading="loginWallet === 'extension'" :disabled="!!loginWallet" @click="onClickConnect('extension')">
          <UAvatar
            src="/wallet/arconnect.svg"
            size="2xs"
          />
          ArConnect
        </UButton>
        <UButton variant="outline" :loading="loginWallet === 'othent'" :disabled="!!loginWallet" class="hidden" @click="onClickConnect('othent')">
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

      <template v-if="!isCheckingVouch">
        <div v-if="isCheckVouchSuccess" class="w-full flex-center gap-x-4">
          <UButton
            color="gray"
            variant="ghost"
            title="I'm vouched, reload page"
            @click="checkVouch()"
          >
            I'm vouched
          </UButton>
          <NuxtLink :to="VOUCH_SITE_URL" target="_blank">
            <UButton icon="heroicons:arrow-top-right-on-square">
              Get Vouched
            </UButton>
          </NuxtLink>
        </div>
        <div v-else class="flex flex-col justify-center items-center gap-y-2">
          <span>Failed to check vouch.</span>
          <UButton variant="ghost" @click="checkVouch()">
            Try again
          </UButton>
        </div>
      </template>
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
      <template v-else>
        <div v-if="isLoginSuccess" class="flex justify-center">
          🎉 Welcome to DecentraMind!
        </div>

        <div v-else class="flex justify-center items-center flex-col gap-y-2">
          Failed to login.
          <UButton variant="ghost" @click="login()">
            Try again
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 