<script setup lang="ts">
const state = $ref<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})


async function onChange () {
  // Do something with data
  console.log(state)
}

const communityForm = $ref({ 
    showAll: true, 
    communityName: '',
    showCommunitynum: true,
})


const taskForm = $ref({ 
    showTasknum: true, 
})
function onSubmit () {
  console.log('Submitted form:', taskForm)
}
const light = 'https://source.unsplash.com/random/200x200?sky'
const dark = 'https://source.unsplash.com/random/200x200?stars'

const formItems = $ref([
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
]);

const { getCommunityjoined } = $(aocommunityStore())

let communityLoading = $ref(true)

let communityList = $ref({})
let communityListJson = $ref({})
const getCommunity = async() => {
  
  communityList = await getCommunityjoined()
  const jsonData = communityList.Messages[0].Data; // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g); // 使用正则表达式匹配字符串中的 JSON 对象
  communityListJson = jsonObjects.map((item: any) => JSON.parse(item)); // 解析每个 JSON 对象并存储到数组中

  communityLoading = false
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
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard @submit.prevent="onSubmit">
      <div v-if="communityLoading" class="w-full flex justify-center">
        <UIcon name="svg-spinners:3-dots-fade" class="w-[210px]" size="xl" dynamic v-bind="$attrs" />
      </div>
      <div 
        v-for="(item, index) in communityListJson" 
        :key="index"
        class="flex items-center justify-between pr-[120px]" 
      >
        <div class="flex items-center mt-5">
          <UColorModeImage :light="light" :dark="dark" class="h-[100px]" />
          <div class="ml-3 text-xl">{{ item.name }}</div>
          <div class="ml-10 text-xl">{{ $t('setting.invited')}}</div>
          <UAvatarGroup size="sm" :max="2" class="ml-10">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="benjamincanac"
            />
            <UAvatar
              src="https://avatars.githubusercontent.com/u/904724?v=4"
              alt="Atinux"
            />
            <UAvatar
              src="https://avatars.githubusercontent.com/u/7547335?v=4"
              alt="smarroufin"
            />
          </UAvatarGroup>
        </div>
        <UButton class="flex-end text-xl text-center">{{ $t('setting.invite.check')}}</UButton>
      </div>
    </UCard>
  </udashboardpanelcontent>
</template>
