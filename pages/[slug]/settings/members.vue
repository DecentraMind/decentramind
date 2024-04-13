<script setup lang="ts">
import type { Member } from '~/types'

const { data: members } = await useFetch<Member[]>('/api/members', { default: () => [] })

const q = ref('')
const isInviteModalOpen = ref(false)

const filteredMembers = computed(() => {
  return members.value.filter(member => {
    return member.name.search(new RegExp(q.value, 'i')) !== -1 || member.username.search(new RegExp(q.value, 'i')) !== -1
  })
})


const communityForm = reactive({ 
    showAll: true, 
    communityName: '',
    showCommunitynum: true,
})
function onSubmitPassword () {
  console.log('Submitted form:', communityForm)
}
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitPassword">
      <template #header>
        <div class="flex justify-between">
          <h3 class="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
            社区列表
          </h3>
          <div>
            全部隐藏<UToggle v-model="communityForm.showAll" />全部显示
          </div>
        </div>
      </template>
      <div class="flex flex-wrap">
        <div class="w-1/2" v-for="(item, index) in formItems" :key="index">
          <div class="flex items-center">
            <UColorModeImage :light="item.light" :dark="item.dark" class="h-[70px]" />
            <UFormGroup :label="item.label" :name="item.name" class="ml-5">
              <UInput v-model="item.value" />
            </UFormGroup>
            <UToggle v-model="item.show" class="ml-10" />显示
          </div>
        </div>
      </div>
      <UFormGroup name="new">
        <template #label>
          <div class="mt-10">
            已加入社区数量： 50
            <UToggle v-model="communityForm.showCommunitynum" class="ml-10" />显示
          </div>
        </template>
      </UFormGroup>

      <template #footer>
        <UButton type="submit" color="black">
          Save password
        </UButton>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
