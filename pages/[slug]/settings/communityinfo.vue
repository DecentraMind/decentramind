<script setup lang="ts">

const communityForm = $ref({
  showAll: true,
  communityName: '',
  showCommunitynum: true,
})
function onSubmit() {
  console.log('Submitted form:', communityForm)
}

const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'


const { joincommunityList, getCommunitylist } = $(aocommunityStore())

let communityLoading = $ref(true)

let result = $ref()
const getCommunity = async () => {

  result = await getCommunitylist()
  communityLoading = false
}

onMounted(async () => {
  try {
    if (joincommunityList)
      communityLoading = false
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmit">
      <template #header>
        <div class="flex justify-between pl-10 pr-20 items-center">
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
        <div v-for="(item, index) in joincommunityList" :key="index" class="w-1/2 pl-5">
          <div class="flex items-center mb-5">
            <UColorModeImage :light="light" :dark="dark" class="h-[100px]" />
            <UFormGroup :label="item.label" :name="item.name" class="ml-5 w-[300px]">
              <template #label>
                <div class="text-xl">
                  {{ item.name }}
                </div>
              </template>
              <UInput v-model="item.value" />
            </UFormGroup>
            <UToggle v-model="item.show" class="ml-10" size="xl" />{{ $t('show') }}
          </div>
        </div>
      </div>
      <UFormGroup name="new">
        <template #label>
          <div class="mt-10 text-xl flex items-center pl-10">
            {{ $t('setting.community.isjoin') }}： 50
            <UToggle v-model="communityForm.showCommunitynum" class="ml-10" size="xl" />
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
