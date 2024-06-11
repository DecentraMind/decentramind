<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

const { data: navigation } = await useAsyncData("navigation", () => fetchContentNavigation(), { default: () => [] });
const { data: files } = useLazyFetch<ParsedContent[]>("/api/search.json", { default: () => [], server: false });



provide("navigation", navigation);

const {
  // currentChain, selectedWallet,
  address,
  credBalance,
  init, doLogout, doLogin } = $(aoStore())

const { registInfo } = $(aocommunityStore())
const router = useRouter();
const isLoading = ref(false);

const handleButtonClick = async () => {
  isLoading.value = true;
  try {
    const result = await doLogin();
    registInfo()
    if (result) {
      router.push('/dm');
    } else {
      console.log('User did not connect the wallet, not navigating to /signup');
    }
  } catch (error) {
    console.error('Error during async operation', error);
    alert('Please connect your Arweave Wallet to continue');
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div>
    <Header />

    <UMain>
      <!--<slot />-->
      <div class="flex flex-col h-screen items-center gap-4 justify-center">
        <UColorModeImage src="DMLogo.png" :dark="'darkImagePath'" :light="'lightImagePath'" class="w-[600px] mb-6" />
        <div class="text-7xl font-bold">Start your real community journey</div>
        <div class="mt-3 mb-6">Try a better way than airdrop to build your community.</div>
        <UButton size="xl" color="black" @click="handleButtonClick">
          Open to Build
          <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
        </UButton>
      </div>
    </UMain>

    <Footer />

    <ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly>
  </div>
</template>
