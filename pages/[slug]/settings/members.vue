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


const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

const formItems = ref([
  { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, { 
    light: light, 
    dark: dark, 
    label: '社区A', 
    name: 'current', 
    value: communityForm.communityName,
    show: true 
  }, 
  // 其他表单项
])

const { getCommunityjoined, joinCommunity } = $(aocommunity())

let cList = $ref({})
let cListj = $ref({})
const getCommunity = async() => {
  
  cList = await getCommunityjoined()
  console.log("nogoods")
  console.log(cList.Messages)
  const jsonData = cList.Messages[0].Data; // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g); // 使用正则表达式匹配字符串中的 JSON 对象
  cListj = jsonObjects.map(item => JSON.parse(item)); // 解析每个 JSON 对象并存储到数组中

  console.log(cListj)
  console.log("goods")
  console.log(cListj)
}

onMounted(async () => {
  try {
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <UDashboardPanelContent class="pb-24">
    <UCard @submit.prevent="onSubmitPassword">
      <template #header>
        <div class="flex justify-between pl-10 pr-20 items-center">
          <h3 class="text-3xl font-semibold leading-6 text-gray-900 dark:text-white">
            社区列表
          </h3>
          <div class="flex items-center text-xl space-x-5">
            <div>全部隐藏</div>
            <UToggle v-model="communityForm.showAll" size="xl" />
            <div>全部显示</div>
          </div>
        </div>
      </template>
      <div class="flex flex-wrap">
        <div
          v-for="(item, index) in cListj" 
          :key="index"
          class="w-1/2 pl-5" 
        >
          <div class="flex items-center mb-5" v-if="item.isJoined">
            <UColorModeImage :light="light" :dark="dark" class="h-[100px]" />
            <UFormGroup :label="item.label" :name="item.name" class="ml-5 w-[300px]">
              <template #label>
                <div class="text-xl">
                  {{ item.name }}
                </div>
              </template>
              <UInput v-model="item.value" />
            </UFormGroup>
            <UToggle v-model="item.show" class="ml-10" size="xl" />显示
          </div>
        </div>
      </div>
      <UFormGroup name="new">
        <template #label>
          <div class="mt-10 text-xl flex items-center pl-10">
            已加入社区数量： 50
            <UToggle v-model="communityForm.showCommunitynum" class="ml-10" size="xl" />
            <div class="ml-3">显示</div>
          </div>
        </template>
      </UFormGroup>

      <template #footer>
        <div class="flex justify-center">
          <UButton type="submit" color="black">
            保存修改
          </UButton>
        </div>
      </template>
    </UCard>
  </UDashboardPanelContent>
</template>
