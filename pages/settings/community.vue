<script setup lang="ts">
import { arUrl, defaultCommunityLogo } from '~/utils/arAssets'

const { address } = $(aoStore())
const { joinedCommunities } = $(aoCommunityStore())

const router = useRouter()

onMounted(async () => {
  if(!address) {
    router.push('/')
    return
  }
})
</script>

<template>
  <UDashboardPanelContent>
    <UCard :ui="{ring: 'ring-0', shadow: 'shadow-none'}">
      <template #header>
        <div class="text-xl flex items-center pl-5">
          <h3 class="w-[420px]">
            {{ $t('setting.community.isjoin') }}： {{ joinedCommunities.length }}
          </h3>
        </div>
      </template>
      <div v-if="!joinedCommunities.length" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div class="flex flex-wrap">
        <div v-for="(community, index) in joinedCommunities" :key="index" class="w-1/2 pl-5">
          <div class="flex items-center mb-5">
            <UColorModeImage :src="community.logo || arUrl(defaultCommunityLogo)" class="h-[64px] w-[64px] rounded-lg border" />
            <UFormGroup :label="community.label" :name="community.name" class="ml-5 w-[300px]">
              <template #label>
                <div class="text-xl max-w-40 max-h-14 break-all overflow-hidden" :title="community.name">
                  {{ community.name }}
                </div>
              </template>
              <!--<UInput v-model="item.value" />-->
            </UFormGroup>
          </div>
        </div>
      </div>
    </UCard>
  </UDashboardPanelContent>
</template>
