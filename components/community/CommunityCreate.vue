<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { tradePlatforms, tokenNames, type TokenSupply } from '~/utils/constants'
import defaultCommunityLogo from '~/utils/defaultCommunityLogo'
import type { CommunitySetting } from '~/types'
import { communitySettingSchema, validateCommunitySetting, type CommunitySettingSchema } from '~/utils/schemas'

let isCommunityCreateModalOpen = $ref(false)
let createdCommunityID = $ref('')

const state = reactive<CommunitySetting & {tokenSupply: TokenSupply[]}>({
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
  typeReward: [],
  isPublished: true,
  tokenName: undefined,
  showTokenName: false,
  isTradable: undefined,
  tradePlatform: [],
  allToken: undefined,
  tokenSupply: [{
    name: '',
    supply: 0,
  }],
  communityToken: undefined,
  communityChatID: undefined,
  owner: '',
  creator: '',
  time: ''
})

const form = ref()

async function onFormSubmit(event: FormSubmitEvent<CommunitySettingSchema>) {
  // Do something with event.data
  console.log('onCreateCommunitySubmit: ', event.data)
  createCommunity()
}

const emit = defineEmits(['close-modal'])

const { addCommunity, getCommunityList, makeCommunityChat} = $(aoCommunityStore())

let isCreating = $ref(false)
let createSuccess = $ref(false)

const createCommunity = async () => {
  if (isCreating) return
  isCreating = true
  isCommunityCreateModalOpen = true
  try {
    state.communityChatID = await makeCommunityChat()

    if (!state.communityChatID) {
      throw new Error('Failed to create community chat')
    }

    createdCommunityID = await addCommunity(
      state.logoBase64Data,
      state.banner,
      state.name,
      state.inbro,          // introduction
      state.website,
      state.twitter,
      state.github,
      state.typeReward,     // 选择的 bounty token 类型
      state.isPublished,    // 是否有发行token
      token.communityToken, // 社区token分配比例额度
      state.isTradable,     // 是否可以交易
      state.tradePlatform,  // 交易的平台
      state.allToken,       // 分配的社区 token 总量
      state.tokenSupply.filter(tokenSupply => tokenSupply.name), // 社区 token 分配比例详情
      state.communityChatID
    )

    createSuccess = true
    isCommunityCreateModalOpen = true
  } catch (error) {
    console.error('Error creating community:', error)

    isCommunityCreateModalOpen = false
    createSuccess = false
    alert('Failed to create community!')
    throw new Error('create community Error' + error)
  } finally {
    isCreating = false
    //createSuccess = true
  }
  createSuccess = true

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
  const input = document.querySelector('#logoUpload') as HTMLInputElement
  input.click()
}

const bannerItems = [
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
const token = $ref({
  communityToken: [
    {
      tokenName: '',
      showTokenName: true
    }
  ]
})

// 添加表单组函数
const addFormGroup = () => {
  if (token.communityToken.length < 2) {
    token.communityToken.push({
      tokenName: '',
      showTokenName: true
    })
  } else {
    console.warn('Maximum of 2 community tokens allowed')
  }
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
  state.tokenSupply.push({
    name: '',
    supply: 0,
  })
}

// 移除表单组函数
const removeSupplyGroup = (index: number) => {
  state.tokenSupply.splice(index, 1)
  // 此处需要手动调用 validate，防止出现在删除有 error 的 tokenSupply 后，error 仍出现在页面上
  form.value.validate()
}
</script>

<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto px-10 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl text-center p-2">{{ $t('community.create') }}</div>
        </template>
      </UAlert>
      <UForm
        ref="form"
        :validate="validateCommunitySetting"
        :schema="communitySettingSchema"
        :state="state"
        class="space-y-4 p-5 pl-20 pt-10"
        @submit="onFormSubmit"
      >
        <UFormGroup name="logoBase64Data" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.logo') }}</div>
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
          <Input
            id="logoUpload"
            type="file"
            size="sm"
            class="opacity-0"
            accept="image/x-png,image/jpeg"
            @change="handleUploadLogo"
          />
        </UFormGroup>

        <UFormGroup name="banner" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.banner') }}</div>
          </template>
          <UCarousel
            v-model="currentIndex"
            :items="bannerItems"
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

        <UFormGroup name="name" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.name') }}</div>
          </template>
          <UInput v-model="state.name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="inbro" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.intro') }}</div>
          </template>
          <UTextarea v-model="state.inbro" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="website" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.website') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.website" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="twitter" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.twitter') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.twitter" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="github" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">Github</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.github" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="typeReward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.typereward') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <USelectMenu v-model="state.typeReward" class="w-[130px] mr-10" :options="tokenNames" multiple placeholder="Select Token" />
          </div>
        </UFormGroup>

        <div class="py-8 text-2xl">{{ $t('community.project') }}</div>

        <UFormGroup class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[450px]">{{ $t('community.token.release') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isPublished" />
            <Text>{{ state.isPublished ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>

        <div v-for="(formGroup, index) in token.communityToken" :key="index">
          <UFormGroup name="range" label="Range">
            <template #label>
              <div class=" min-w-[100px]">{{ index+1 }}st Token</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <div class="flex min-w-[477px]">
                <USelect v-model="formGroup.tokenName" :options="tokenNames" />

                <UButton icon="material-symbols:close-rounded" variant="outline" class="ml-3" @click="removeFormGroup(index)" />
              </div>
              <UPopover mode="hover" :popper="{ placement: 'right-end' }">
                <template #panel>
                  <div class="w-[160px] h-[25px] flex justify-center">
                    <ULink
                      to="https://forms.gle/RwWbeFphvyi8ZEU9A"
                      active-class="text-primary"
                      target="_blank"
                      inactive-class="text-primary-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-gray-200"
                    >
                      Add new tokens
                    </ULink>
                  </div>
                </template>
                <UIcon name="gravity-ui:circle-question" />
              </UPopover>
            </div>
          </UFormGroup>
        </div>
        <UButton v-if="state.isPublished" variant="outline" icon="material-symbols:add" @click="addFormGroup" />

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[452px]">{{ $t('community.token.trade') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isTradable" />
            <Text>{{ state.isTradable ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>
        <div v-if="state.isTradable">
          <UFormGroup name="tradePlatform" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class=" min-w-[270px]">{{ $t('community.token.platforms') }}</div>
            </template>
            <USelectMenu v-model="state.tradePlatform" :options="tradePlatforms" multiple placeholder="Select" />
          </UFormGroup>
        </div>

        <div class="py-8 text-2xl">{{ $t('community.economics') }}</div>


        <div class="space-y-3">
          <UFormGroup
            name="allToken"
            :label="$t('community.token.all')"
            class="mb-2"
          >
            <div class="flex flex-row items-center space-x-3">
              <UInput
                v-model="state.allToken"
                type="number"
                :model-modifiers="{number: true}"
                placeholder=""
                class="w-[120px]"
              />
            </div>
          </UFormGroup>

          <UFormGroup v-model="state.tokenSupply" name="tokenSupply">
            <UFormGroup
              v-for="(formGroup, index) in state.tokenSupply"
              :key="index"
              v-model="state.tokenSupply[index]"
              :name="`tokenSupply[${index}]`"
              class="mb-2"
            >
              <div class="flex flex-row items-center space-x-3">
                <UInput
                  v-model="formGroup.name"
                  placeholder="community"
                />
                <UInput
                  v-model="formGroup.supply"
                  type="number"
                  :model-modifiers="{number: true}"
                  placeholder="%"
                  class="w-[70px]"
                />
                <UButton icon="material-symbols:close-rounded" variant="outline" @click="removeSupplyGroup(index)" />
              </div>
            </UFormGroup>
          </UFormGroup>

          <UButton variant="outline" icon="material-symbols:add" @click="addSupplyGroup" />
        </div>

        <div class="flex justify-center">
          <UButton color="white" type="submit" size="xl" :disabled="isCreating" :loading="isCreating">
            {{ $t('add') }}
          </UButton>
        </div>
      </UForm>

      <UModal v-model="isCommunityCreateModalOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-center">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Create Community
              </h3>
              <!--<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreated = false" />-->
            </div>
          </template>
          <UContainer v-if="!createSuccess" class="w-full flex justify-around">
            <UIcon name="svg-spinners:6-dots-scale" />
          </UContainer>
          <UContainer v-else class="w-full flex justify-around">
            <UButton @click="getCommunityList(); emit('close-modal'); $router.push(`/community/${createdCommunityID}`); isCommunityCreateModalOpen = false">
              {{ $t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
