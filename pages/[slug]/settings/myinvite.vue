<script setup lang="ts">
const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

const sections = [{
  title: 'Notification channels',
  description: 'Where can we notify you?',
  fields: [{
    name: 'email',
    label: 'Email',
    description: 'Receive a daily email digest.'
  }, {
    name: 'desktop',
    label: 'Desktop',
    description: 'Receive desktop notifications.'
  }]
}, {
  title: 'Account updates',
  description: 'Receive updates about Nuxt UI.',
  fields: [{
    name: 'weekly_digest',
    label: 'Weekly digest',
    description: 'Receive a weekly digest of news.'
  }, {
    name: 'product_updates',
    label: 'Product updates',
    description: 'Receive a monthly email with all new features and updates.'
  }, {
    name: 'important_updates',
    label: 'Important updates',
    description: 'Receive emails about important updates like security fixes, maintenance, etc.'
  }]
}]

async function onChange () {
  // Do something with data
  console.log(state)
}

const communityForm = reactive({ 
    showAll: true, 
    communityName: '',
    showCommunitynum: true,
})


const taskForm = reactive({ 
    showTasknum: true, 
})
function onSubmitPassword () {
  console.log('Submitted form:', taskForm)
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
]);
</script>

<template>
  <UDashboardPanelContent class="p-0 pb-24 divide-y divide-gray-200 dark:divide-gray-800">
    <UCard @submit.prevent="onSubmitPassword">
      <div 
        v-for="(item, index) in formItems" 
        :key="index"
        class="flex items-center justify-between pr-[120px]" 
      >
        <div class="flex items-center mt-5">
          <UColorModeImage :light="item.light" :dark="item.dark" class="h-[100px]" />
          <div class="ml-3 text-xl">{{ item.label }}</div>
          <div class="ml-10 text-xl">已邀请xx位好友</div>
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
        <UButton class="flex-end text-xl text-center">查看所有好友</UButton>
      </div>
    </UCard>
  </udashboardpanelcontent>
</template>
