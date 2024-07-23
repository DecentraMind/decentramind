<script setup lang="ts">

const communityForm = $ref({
  showAll: true,
  communityName: '',
  showCommunityNum: true,
})
function onSubmit() {
  console.log('Submitted form:', communityForm)
}

const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'


const { joinedCommunities, getCommunityList } = $(aoCommunityStore())

let communityLoading = $ref(true)

let result = $ref()
const getCommunity = async () => {
  result = await getCommunityList()
  communityLoading = false
}

onMounted(async () => {
  try {
    if (Array.isArray(joinedCommunities) && joinedCommunities.length !== 0) {
      communityLoading = false
    }
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmit">
      <template #header>
        <div class="flex justify-between pl-5 pr-20 items-center">
          <h3 class="text-3xl font-semibold leading-6 text-gray-900 dark:text-white">
            {{ $t('setting.community.list') }}
          </h3>
          <div class="flex items-center text-xl space-x-5">
            <div>{{ $t('hideall') }}</div>
            <UToggle v-model="communityForm.showAll" size="xl" />
            <div>{{ $t('showall') }}</div>
          </div>
        </div>
      </template>
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div class="flex flex-wrap">
        <div v-for="(item, index) in joinedCommunities" :key="index" class="w-1/2 pl-5">
          <div class="flex items-center mb-5">
            <UColorModeImage :src="item.logo" :light="light" :dark="dark" class="h-[70px] w-[70px] rounded-lg border" />
            <UFormGroup :label="item.label" :name="item.name" class="ml-5 w-[300px]">
              <template #label>
                <div class="text-xl">
                  {{ item.name }}
                </div>
              </template>
              <!--<UInput v-model="item.value" />-->
            </UFormGroup>
            <UToggle v-model="item.show" class="ml-10 mr-3" size="xl" />
            <Text>
              {{ $t('show') }}
            </Text>
          </div>
        </div>
      </div>
      <UFormGroup name="new">
        <template #label>
          <div class="mt-20 text-xl flex items-center pl-5">
            <Text class="w-[420px]">
              {{ $t('setting.community.isjoin') }}： {{ joinedCommunities.length }}
            </Text>
            <UToggle v-model="communityForm.showCommunityNum" class="ml-10" size="xl" />
            <div class="ml-3">{{ $t('show') }}</div>
          </div>
        </template>
      </UFormGroup>

      <template #footer>
        <div class="flex justify-center">
          <UButton type="submit" color="black">
            {{ $t('setting.save') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
