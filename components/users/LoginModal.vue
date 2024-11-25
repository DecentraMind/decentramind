<script setup lang="ts">
const { doLogin, othentLogin, isLoginModalOpen } = $(aoStore())
const { showError } = $(notificationStore())
const router = useRouter()

let arconnectLogining = $ref(false)
let othentLogining = $ref(false)

const onClickArConnect = async () => {
  arconnectLogining = true
  othentLogining = true
  try {
    const result = await doLogin()
    if (result) {
      router.push('/discovery')
    } else {
      console.log('User did not connect the wallet, not navigating to /signup')
    }
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
    if (result) {
      router.push('/discovery')
    } else {
      console.log('User did not connect the wallet, not navigating to /signup')
    }
  } catch (error) {
    console.error(error)
  } finally {
    othentLogining = false
  }
}
</script>

<template>
  <UModal v-model="isLoginModalOpen">
    <UCard class="h-[200px] flex items-center justify-center">
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