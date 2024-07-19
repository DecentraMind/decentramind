<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

const { data: navigation } = await useAsyncData("navigation", () => fetchContentNavigation(), { default: () => [] });
const { data: files } = useLazyFetch<ParsedContent[]>("/api/search.json", { default: () => [], server: false });



provide("navigation", navigation);

const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin, othentLogin } = $(aoStore())

const { registInfo } = $(aocommunityStore())
const router = useRouter();
const isLoading = ref(false);

const handleButtonClick = async () => {
  isLoading.value = true;
  loginLoading = true;
  try {
    const result = await doLogin();
    if (result) {
      loginLoading = false;
      router.push('/explore');
    } else {
      loginLoading = false;
      console.log('User did not connect the wallet, not navigating to /signup');
    }
  } catch (error) {
    loginLoading = false;
    console.error('Error during async operation', error);
    alert('Please connect your Arweave Wallet to continue');
  } finally {
    loginLoading = false;
    isLoading.value = false;
  }
};

const othent = async () => {
  try {
    loginLoading = true;
    const result = await othentLogin()
    if (result) {
      loginLoading = false;
      router.push('/dm');
    } else {
      loginLoading = false;
      console.log('User did not connect the wallet, not navigating to /signup');
    }
  } catch (error) {
    loginLoading = false;
    console.error(error)
  }
}

let loginModal = $ref(false)
let loginLoading = $ref(false)
</script>

<template>
  <div>
    <Header />

    <UMain>
      <!--<slot />-->
      <div class="flex flex-col h-screen items-center gap-4 justify-center">
        <UColorModeImage src="DMLogo.png" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-[600px] mb-6" />
        <div class="text-7xl font-bold">Start your real community journey</div>
        <div class="mt-3 mb-6" text-3xl>Try a better way than airdrop to build your community.</div>
        <UButton size="xl" color="black" @click="loginModal = true">
          Open to Build
          <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
        </UButton>
      </div>
    </UMain>
    <UModal v-model="loginModal">
      <UCard class="h-[200px] flex items-center justify-center">
        <div v-if="!loginLoading" class="flex justify-center space-x-3">
          <UButton color="white" class="w-[120px]" @click="handleButtonClick">
            <template #leading>
              <UAvatar
                src="wallet/arconnect.svg"
                size="2xs"
              />
            </template>
            ArConnect
          </UButton>
          <UButton color="white" disabled class="w-[120px]" @click="othent">
            <template #leading>
              <UIcon
                name="logos:google-icon"
                class="w-[25px] h-[23px]"
              />
            </template>
            Google
          </UButton>
        </div>
        <div v-else class="flex justify-center">
          <UIcon name="svg-spinners:12-dots-scale-rotate" />
        </div>
      </UCard>
    </UModal>
    <Footer />

    <ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly>
  </div>
</template>
