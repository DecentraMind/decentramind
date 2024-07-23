<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { CommunitySetting, TradePlatform } from '~/types'
import { tradePlatforms, tokenNames, type TokenName, type CommunityToken, type TokenSupply } from '~/utils/constants'
import defaultCommunityLogo from '~/utils/defaultCommunityLogo'
import { communitySettingSchema, type CommunitySettingSchema } from '~/utils/schemas'

let supportSelected: TradePlatform[] = $ref([])
let tokenSelected = $ref<TokenName[]>([])
let isCreated = $ref(false)

const state = $ref<CommunitySetting>({
  owner: undefined,
  creator: undefined,
  logoBase64Data: undefined,
  banner: 'banner6',
  input: undefined,
  inputMenu: undefined,
  name: undefined,
  inbro: undefined,
  website: undefined,
  twitter: undefined,
  github: undefined,
  builderNum: undefined,
  allReward: undefined,
  typeReward: undefined,
  isPublished: true,
  tokenName: undefined,
  showTokenName: true,
  isTradable: undefined,
  tradePlatform: undefined,
  allToken: undefined,
  communityToken: undefined,
  communityChatID: undefined,
  time: undefined,
})

let communityID = $ref('')

const emit = defineEmits(['close-setting'])

const form = ref()

async function onSubmit(event: FormSubmitEvent<CommunitySettingSchema>) {
  // Do something with event.data
  console.log(event.data)
}


const { settingCommunity, currentUuid, getLocalCommunity } = $(aoCommunityStore())
let isLoading = $ref(false)
let createSuccess = $ref(false)
const CreateCommunity = async () => {
  if (isLoading) return
  isLoading = true
  isCreated = true
  try {
    await settingCommunity(
      state,
      tokenSelected, // 选择的token类型
      token.communityToken, // 社区token分配比例额度
      supportSelected, // 交易平台
      token.tokenSupply, // 社区token分配比例详情
    )
  } catch (error) {
    console.error('Error setting community:', error)
    isCreated = false
    alert('Failed to setting community!')
    // 这里可以添加更多的错误处理逻辑，例如显示错误消息给用户
  } finally {
    isLoading = false
    createSuccess = true
  }

  isCreated = true
  isLoading = false
}

const handleUploadLogo = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) {
    throw new Error('No file selected.')
  }
  const file = input.files[0]

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    const b64 = e.target!.result?.toString() || defaultCommunityLogo
    img.onload = () => {
      if (img.width <= 400 && img.height <= 400 && img.width === img.height) {
        state.logoBase64Data = b64
      } else {
        alert('Image dimensions should be square and both dimensions should be less than or equal to 400px.')
      }
    }
    img.src = b64
  }
  reader.readAsDataURL(file)
}

const uploadLogo = () => {
  const input = document.querySelector('#uploadLogo') as any
  input.click()
}

const items = [
  '/task/banner6.jpg',
  '/task/banner7.jpg',
  '/task/banner8.jpg',
  '/task/banner9.jpg',
  '/task/banner10.jpg',
]
const currentIndex = $ref(0) // 用于存储当前选中的索引

const updateBanner = (index: number) => {
  if (index === 1) {
    state.banner = 'banner6'
  } else if (index === 2) {
    state.banner = 'banner7'
  } else if (index === 3) {
    state.banner = 'banner8'
  } else if (index === 4) {
    state.banner = 'banner9'
  } else if (index === 5) {
    state.banner = 'banner10'
  }
}


// 初始化表单组状态数组
const token = $ref<{
  communityToken: CommunityToken[],
  tokenSupply: TokenSupply[]
}>({
  communityToken: [
    {
      tokenName: '' as TokenName,
      showTokenName: true
    }
  ],
  tokenSupply: [
    {
      name: '' as TokenName,
      supply: '',
    }
  ]
})

// 添加表单组函数
const addFormGroup = () => {
  token.communityToken.push({
    tokenName: '' as TokenName,
    showTokenName: true
  })
}

// 移除表单组函数
const removeFormGroup = (index: any) => {
  token.communityToken.splice(index, 1)
}

// 监听 state.isPublished 的变化
watch(() => state.isPublished, (newVal) => {
  if (newVal) {
    if (token.communityToken.length === 0) {
      addFormGroup()
    }
  } else {
    token.communityToken = []
  }
})



// 添加表单组函数
const addSupplyGroup = () => {
  token.tokenSupply.push({
    name: '' as TokenName,
    supply: '',
  })
}

// 移除表单组函数
const removeSupplyGroup = (index: number) => {
  token.tokenSupply.splice(index, 1)
}

const setCommunityState = async () => {
  const communityInfo = await getLocalCommunity(currentUuid)
  if (!communityInfo) return

  console.log({ communityInfo })

  communityID = communityInfo.uuid

  //state.banner = a.banner;
  state.creator = communityInfo.creater
  state.owner = communityInfo.creater
  state.logoBase64Data = communityInfo.logo
  state.banner = communityInfo.banner
  state.name = communityInfo.name
  state.inbro = communityInfo.desc
  state.website = communityInfo.website
  state.twitter = communityInfo.twitter
  state.github = communityInfo.github
  state.builderNum = communityInfo.buildnum
  tokenSelected = communityInfo.bounty //选择的token类型
  state.isPublished = communityInfo.ispublished //是否有发行token
  token.communityToken = communityInfo.communitytoken //社区token分配比例额度
  state.isTradable = communityInfo.istradable //是否可以交易
  supportSelected = communityInfo.support //交易得平台
  state.allToken = communityInfo.alltoken //分配得token总量
  token.tokenSupply = communityInfo.tokensupply //社区token分配比例详情
  state.communityChatID = communityInfo.communitychatid
  state.time = communityInfo.timestamp
}

onMounted(async () => {
  await setCommunityState()
})
</script>

<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto px-10 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl p-2 flex justify-center">
            {{ $t('community.setting') }}
          </div>
        </template>
      </UAlert>
      <UForm ref="form" :schema="communitySettingSchema" :state="state" class="space-y-4 p-5 pl-20 pt-10" @submit="onSubmit">
        <UFormGroup name="Logo" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.logo') }}
            </div>
          </template>
          <img
            v-if="state.logoBase64Data"
            :src="state.logoBase64Data"
            width="75"
            height="75"
            alt="logo"
            @click="uploadLogo"
          >
          <UButton
            v-if="!state.logoBase64Data"
            label="LOGO"
            size="xl"
            square
            variant="outline"
            class="flex justify-center w-[150px] h-[120px]"
            @click="uploadLogo"
          />
          <Input id="uploadLogo" type="file" size="sm" class="opacity-0" @change="handleUploadLogo" />
        </UFormGroup>
        <!--<UButton @click="test">test</UButton>-->
        <UFormGroup name="Banner" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.banner') }}
            </div>
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
            <div class=" w-[300px]">
              {{ $t('community.name') }}
            </div>
          </template>
          <UInput v-model="state.name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Inbro" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.intro') }}
            </div>
          </template>
          <UTextarea v-model="state.inbro" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Website" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.website') }}
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.website" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Twitter" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.twitter') }}
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.twitter" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Github" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              Github
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.github" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Typereward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">
              {{ $t('community.typereward') }}
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <USelectMenu v-model="tokenSelected" class="w-[130px] mr-10" :options="tokenNames" multiple placeholder="Select Token" />
          </div>
        </UFormGroup>

        <div class="py-8 text-2xl">
          {{ $t('community.project') }}
        </div>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[450px]">
              {{ $t('community.token.release') }}
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isPublished" />
            <Text>{{ state.isPublished ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>

        <div v-for="(formGroup, index) in token.communityToken" :key="index">
          <UFormGroup name="range" label="Range">
            <template #label>
              <div class=" min-w-[100px]">
                {{ index+1 }}st Token
              </div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <div class="flex min-w-[477px]">
                <USelect v-model="formGroup.tokenName" :options="tokenNames" />
                <UButton icon="material-symbols:close-rounded" variant="outline" class="ml-3" @click="removeFormGroup(index)" />
              </div>
            </div>
          </UFormGroup>
        </div>
        <UButton v-if="state.isPublished" variant="outline" icon="material-symbols:add" @click="addFormGroup" />

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[452px]">
              {{ $t('community.token.trade') }}
            </div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isTradable" />
            <Text>{{ state.isTradable ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>
        <div v-if="state.isTradable">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class=" min-w-[270px]">
                {{ $t('community.token.platforms') }}
              </div>
            </template>
            <USelectMenu v-model="supportSelected" :options="tradePlatforms" multiple placeholder="Select people" />
          </UFormGroup>
        </div>

        <div class="py-8 text-2xl">
          {{ $t('community.economics') }}
        </div>


        <div class="space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class=" min-w-[410px]">
                {{ $t('community.token.all') }}
              </div>
            </template>
          </UFormGroup>
          <UFormGroup name="Alltoken" class="mb-2">
            <div class="flex flex-row items-center space-x-3">
              <UInput v-model="state.allToken" placeholder="" class="w-[120px]" />
            </div>
          </UFormGroup>

          <div v-for="(formGroup, index) in token.tokenSupply" :key="index">
            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="formGroup.name" placeholder="community" />
                <UInput v-model="formGroup.supply" placeholder="%" class="w-[50px]" />
                <UButton icon="material-symbols:close-rounded" variant="outline" @click="removeSupplyGroup(index)" />
              </div>
            </UFormGroup>
          </div>

          <UButton variant="outline" icon="material-symbols:add" @click="addSupplyGroup" />
        </div>
        <div class="flex justify-center">
          <UButton color="white" type="submit" size="xl" @click="CreateCommunity">
            {{ $t('add') }}
          </UButton>
        </div>
      </UForm>

      <UModal v-model="isCreated" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-center">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modify Community
              </h3>
            </div>
          </template>
          <UContainer v-if="!createSuccess" class="w-full flex justify-around">
            <UIcon name="svg-spinners:6-dots-scale" />
          </UContainer>
          <UContainer v-else class="w-full flex justify-around">
            <UButton @click="emit('close-setting')">
              {{ $t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
