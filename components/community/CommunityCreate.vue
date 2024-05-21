<script setup lang="ts">


import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const options = [
  { label: 'OKE', value: 'OKE' },
  { label: 'Binance', value: 'Binance' },
]
const supportSelect = ['OKE', 'Binance']
const supportSelected = $ref([])
const tokenselect = ['USDC', 'AR']
const tokenselected = $ref([])
let isCreated = $ref(false)

let state = $ref({
  logobase64Data: undefined,
  banner: undefined,
  input: undefined,
  inputMenu: undefined,
  Name: undefined,
  Inbro: undefined,
  Website: undefined,
  showWebsite: false,
  Twitter: undefined,
  showTwitter: false,
  Whitebook: undefined,
  showWhitebook: false,
  Github: undefined,
  showGithub: false,
  Buildernum: undefined,
  showBuildernum: false,
  Allreward: undefined,
  showAllreward: false,
  Typereward: undefined,
  showTypereward: false,
  showDetail: false,
  isPublished: false,
  TokenName: undefined,
  showTokenName: false,
  isTradable: undefined,
  TradePlatform: undefined,
  showAlltoken: false,
  Alltoken: undefined,
  Communitytoken: undefined,
  Teamtoken: undefined,
  Flowtoken: undefined,
})

const schema = z.object({
  Name: z.string().min(2),
  Inbro: z.string().min(3),

  TradePlatform: z.string().refine((value: string) => value === 'OKE', {
    message: 'Select OKE'
  }),
  /*
  Allreward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

type Schema = z.infer<typeof schema>

const form = ref()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}


const { addCommunity, communityCreate } = $(aocommunityStore())
let createCommunity = $ref('')
let isLoading = $ref(false)

const CreateCommunity = async () => {
  if (isLoading) return
  isLoading = true

  let communitySubmit = [
    {
      "name": state.Name,
      "desc": state.Inbro,
      "website": state.Website,
      "whitebook": state.Whitebook,
      "allreward": state.Allreward,
    }
  ]
  const jsonString = JSON.stringify(communitySubmit);
  console.log("---------------------------------")
  console.log(state.banner)
  createCommunity = await addCommunity(
    state.logobase64Data, 
    state.banner, 
    state.Name, 
    state.Inbro, 
    state.Website, 
    state.showWebsite,
    state.Twitter, 
    state.showTwitter,
    state.Whitebook, 
    state.showWhitebook,
    state.Github,
    state.showGithub,
    state.showBuildernum, //builder人数
    state.showAllreward, //所有总奖励
    tokenselected, //选择的token类型
    state.showTypereward, //奖励的token类型
    state.isPublished, //是否有发行token
    supportSelected
  )
  isCreated = true
  isLoading = false
}


const handleUp = (event) => {
  const file = event.target?.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      state.logobase64Data = e.target.result
      console.log("Base64 Data: ", state.logobase64Data)
    }
    reader.readAsDataURL(file)
  }
}

const logoupload = () => {
  const input = document.querySelector('#logoupload') as any
  input.click()
}

const bannerupload = () => {
  const input = document.querySelector('#bannerupload') as any
  input.click()
}


const items = [
  '/community/imageone.png',
  '/community/imagetwo.png',
  '/community/imagethree.png'
]
const currentIndex = $ref(0); // 用于存储当前选中的索引

const updateBanner = (index: number) => {
  console.log('-----------------bbbbbbbbbbbbbbbb')
  if (index === 1) {
    state.banner = 'imageone';
  } else if (index === 2) {
    state.banner = 'imagetwo';
  } else if (index === 3) {
    state.banner = 'imagethree'
  }
  console.log(state.banner)
};
const test = ()=> {
  console.log(state.showAllreward)
}
</script>

<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto pl-20 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl p-2">{{ $t('community.create') }}</div>
        </template>
      </UAlert>
      <UButton @click="test">test</UButton>
      <UForm ref="form" :schema="schema" :state="state" class="space-y-4 p-5 pl-20 pt-10" @submit="onSubmit">
        <UFormGroup name="Logo" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.logo') }}</div>
          </template>
          <UButton label="LOGO" size="xl" square variant="outline" class="flex justify-center w-[150px] h-[120px]"
            @click="logoupload" />
          <Input id="logoupload" type="file" size="sm" class="opacity-0" @change="handleUp" />
        </UFormGroup>

        <UFormGroup name="Banner" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.banner') }}</div>
          </template>
          <UCarousel
            v-model="currentIndex"
            :items="items"
            :ui="{
              item: 'basis-full',
              container: 'rounded-lg',
              indicators: {
                wrapper: 'relative bottom-0 mt-4'
              }
            }"
            indicators
            class="w-64 mx-auto"
          >
            <template #default="{ item }">
              <img :src="item" class="w-full" draggable="false">
            </template>

            <template #indicator="{ onClick, page, active }">
              <UButton 
                :label="String(page)" 
                :variant="active ? 'solid' : 'outline'" 
                size="2xs" 
                class="rounded-full min-w-6 justify-center" 
                @click="() => {
                  currentIndex = page; // 更新当前索引
                  updateBanner(page)
                  onClick(page); // 触发页面点击事件
                }"
              />
            </template>
          </UCarousel>
        </UFormGroup>

        <UFormGroup name="Name" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.name') }}</div>
          </template>
          <UInput v-model="state.Name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Inbro" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.intro') }}</div>
          </template>
          <UTextarea v-model="state.Inbro" :placeholder="`${$t('community.intro.label')}`"
            class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Website" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.website') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Website" placeholder="URL" />
            <UToggle v-model="state.showWebsite" />
            <Text>{{ state.showWebsite ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Twitter" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.twitter') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Twitter" placeholder="URL" />
            <UToggle v-model="state.showTwitter" />
            <Text>{{ state.showTwitter ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Whitebook" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.whitebook') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Whitebook" placeholder="URL" />
            <UToggle v-model="state.showWhitebook" />
            <Text>{{ state.showWhitebook ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>
        
        <UFormGroup name="Github" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">Github</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Github" placeholder="URL" />
            <UToggle v-model="state.showGithub" />
            <Text>{{ state.showGithub ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Buildernum" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.buildnum') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.showBuildernum" />
            <Text>{{ state.showBuildernum ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Allreward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.allreward') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.showAllreward" />
            <Text>{{ state.showAllreward ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Typereward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.typereward') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <USelectMenu v-model="tokenselected" :options="tokenselect" multiple placeholder="Select Token" />
            <UToggle v-model="state.showTypereward" />
            <Text>{{ state.showTypereward ? $t('show') : $t('hide') }}</Text>
          </div>
        </UFormGroup>

        <div class="py-8 text-2xl">{{ $t('community.project') }}</div>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class="text-sky-400 min-w-[100px]">{{ $t('community.after') }}</div>
          </template>
          {{ $t('hideall') }}
          <UToggle v-model="state.showDetail" />
          {{ $t('showall') }}
        </UFormGroup>

        <div v-show="state.showDetail" class="ml-10 space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[150px]">{{ $t('community.token.release') }}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UToggle v-model="state.isPublished" />
              <Text>{{ state.isPublished ? $t('yes') : $t('no') }}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" label="Range">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.name') }}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UInput v-model="state.TokenName" placeholder="" />
              <UToggle v-model="state.showTokenName" />
              <Text>{{ state.showTokenName ? $t('show') : $t('hide') }}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[150px]">{{ $t('community.token.trade') }}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UToggle v-model="state.isTradable" />
              <Text>{{ state.isTradable ? $t('yes') : $t('no') }}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.platforms') }}</div>
            </template>
            <USelectMenu v-model="supportSelected" :options="supportSelect" multiple placeholder="Select people" />
          </UFormGroup>
        </div>

        <div class="py-8 text-2xl">{{ $t('community.economics') }}</div>


        <div class="ml-10 space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.all') }}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <Text>{{ $t('hide') }}</Text>
              <UToggle v-model="state.showAlltoken" />
              <Text>{{ $t('show') }}</Text>
            </div>
          </UFormGroup>
          <div v-show="state.showAlltoken">
            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Alltoken" placeholder="" />
              </div>
            </UFormGroup>

            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Communitytoken" placeholder="community" />%
              </div>
            </UFormGroup>

            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Teamtoken" placeholder="team" />%
              </div>
            </UFormGroup>

            <UFormGroup name="range">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Flowtoken" placeholder="liquidity" />%
              </div>
            </UFormGroup>
          </div>
        </div>

        <UButton type="submit" class="ml-20" @click="CreateCommunity">
          {{ $t('add') }}
        </UButton>
      </UForm>
      <UModal v-model="isCreated" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modal
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                @click="isCreated = false" />
            </div>
          </template>
          <UContainer class="w-full flex justify-around">
            <UButton :to="`/${slug}/create-community`">{{ $t('community.continue') }}</UButton>
            <UButton :to="`/${slug}/discovery`" @click="communityCreate = false; isCreated = false">{{
            $t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
