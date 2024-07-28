<script setup lang="ts">
const { doLogin, othentLogin, isLoginModalOpen } = $(aoStore())

const router = useRouter()
let isLoading = $ref(false)
let loginLoading = $ref(false)

const onClickArConnect = async () => {
  isLoading = true
  loginLoading = true
  try {
    const result = await doLogin()
    if (result) {
      router.push('/discovery')
    } else {
      console.log('User did not connect the wallet, not navigating to /signup')
    }
  } catch (error) {
    console.error('Error during async operation', error)
    alert('Please connect your Arweave Wallet to continue')
  } finally {
    loginLoading = false
    isLoading = false
  }
}

const onClickOthent = async () => {
  loginLoading = true
  try {
    const result = await othentLogin()
    if (result) {
      router.push('/discovery')
    } else {
      console.log('User did not connect the wallet, not navigating to /signup')
    }
  } catch (error) {
    console.error(error)
  }
  loginLoading = false
}
</script>

<template>
  <div>
    <Header />

    <slot />

    <UModal v-model="isLoginModalOpen">
      <UCard class="h-[200px] flex items-center justify-center">
        <div v-if="!loginLoading" class="flex justify-center space-x-3">
          <UButton color="white" class="w-[120px]" @click="onClickArConnect">
            <template #leading>
              <UAvatar
                src="wallet/arconnect.svg"
                size="2xs"
              />
            </template>
            ArConnect
          </UButton>
          <ClientOnly fallback-tag="span" fallback="Loading comments...">
            <UButton color="white" class="w-[120px]" @click="onClickOthent">
              <template #leading>
                <UIcon
                  name="logos:google-icon"
                  class="w-[25px] h-[23px]"
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
  </div>
</template>
