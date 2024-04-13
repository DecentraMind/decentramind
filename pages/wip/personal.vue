<script setup lang="ts">
definePageMeta({
  layout: "wip",
});


const items = [{
  slot: 'account',
  label: '个人信息设置',
  name: '社交信息'
}, {
  slot: 'community',
  label: '社区信息设置',
  name: '社区列表'
}, {
  slot: 'task',
  label: '任务信息设置'
}, {
  slot: 'invite',
  label: '我的邀请'
}]

const accountForm = reactive({ 
    name: 'tim', 
    twitter: 'Benjamin', 
    showtwitter: true, 
    mail: 'benjamincanac',
    showmail: true,
    telegram: '+12',
    showtelegram: true,
})
const communityForm = reactive({ 
    showAll: true, 
    communityName: '',
    showCommunitynum: true,
})
const taskForm = reactive({ 
    showTasknum: true, 
})

function onSubmitAccount () {
  console.log('Submitted form:', accountForm)
}

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
]);

</script>

<template>
  <div class="bg-red-400">
    <UTabs :items="items" class="w-full">
      <template #account="{ item }">
        <UCard @submit.prevent="onSubmitAccount">
          <template #header>
            <div class="flex">
              <UAvatar
                src="https://avatars.githubusercontent.com/u/739984?v=4"
                alt="Avatar"
                size="3xl"
              />
              <div class="flex items-center p-3 ml-2">
                <UFormGroup
                  label="修改用户名"
                  name="name" 
                  class="mb-3"
                >
                  <UInput v-model="accountForm.name" />
                </UFormGroup>
              </div>
            </div>
          </template>

          <div class="text-2xl">{{ item.name }}</div>
          <UFormGroup label="twitter" name="twitter" class="mb-3">
            <div class="flex items-center space-x-3">
              <UInput v-model="accountForm.twitter" />
              <UToggle v-model="accountForm.showtwitter" />显示
            </div>
          </UFormGroup>
          <UFormGroup label="mail" name="mail">
            <div class="flex items-center space-x-3">
              <UInput v-model="accountForm.mail" />
              <UToggle v-model="accountForm.showmail" />显示
            </div>
          </UFormGroup>
          <UFormGroup label="mail" name="mail">
            <div class="flex items-center space-x-3">
              <UInput v-model="accountForm.telegram" />
              <UToggle v-model="accountForm.showtelegram" />显示
            </div>
          </UFormGroup>

          <template #footer>
            <UButton type="submit" color="black">
              Save account
            </UButton>
          </template>
        </UCard>
      </template>

      <template #community="{ item }">
        <UCard @submit.prevent="onSubmitPassword">
          <template #header>
            <div class="flex justify-between">
              <h3 class="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                {{ item.name }}
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
      </template>
      <template #task>
        <UCard @submit.prevent="onSubmitPassword">
          已完成任务数量： 50
          <UToggle v-model="taskForm.showTasknum" class="ml-10" />显示
        </UCard>
      </template>
      <template #invite>
        <UCard @submit.prevent="onSubmitPassword">
          <div class="flex items-center justify-between" v-for="(item, index) in formItems" :key="index">
            <div class="flex items-center">
              <UColorModeImage :light="item.light" :dark="item.dark" class="h-[70px]" />
              <div class="ml-3">{{ item.label }}</div>
              <div class="ml-10">已邀请xx位好友</div>
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
            <UButton class="flex-end">查看所有好友</UButton>
          </div>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>
