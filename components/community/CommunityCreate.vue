<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { tradePlatforms, tokenNames, type TokenSupply } from '~/utils/constants'
import type { CommunitySetting } from '~/types'
import { communitySettingSchema, validateCommunitySetting, type CommunitySettingSchema } from '~/utils/schemas'
import { arUrl, defaultCommunityLogo, getCommunityBannerUrl } from '~/utils/arAssets'
import { createUuid } from '~/utils/util'
import { useUpload } from '~/composables/useUpload'

const props = defineProps<{
  uuid?: string
  initState?: CommunitySetting & {tokenSupply: TokenSupply[]}
}>()

const { updateCommunity, currentUuid, getLocalCommunity } = $(aoCommunityStore())

const { upload, isUploading, uploadError, uploadResponse } = $(useUpload())

const uploadInput = $ref<HTMLInputElement>()
async function upload2AR() {
  await upload({
    fileName: (props.uuid || createUuid()).slice(-4),
    pathName: 'communityLogo',
    file: uploadInput?.files?.[0]
  })

  if (uploadError || !uploadResponse) {
    showError('Failed to upload image.', uploadError)
    uploadInput!.value = ''
    return
  }

  state.logo = uploadResponse.ARHash!
}



let createdCommunityID = $ref('')

const state = reactive<CommunitySetting & {tokenSupply: TokenSupply[]}>({
  logo: defaultCommunityLogo,
  banner: 'banner6',
  input: undefined,
  inputMenu: undefined,
  name: undefined,
  desc: undefined,
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
    supply: '' as unknown as number,
  }],
  communityToken: undefined,
  communityChatID: undefined,
  owner: '',
  creator: '',
  time: new Date().getTime()
})

const form = ref()

async function onFormSubmit(event: FormSubmitEvent<CommunitySettingSchema>) {
  // Do something with event.data
  console.log('onCreateCommunitySubmit: ', event.data)
  createCommunity()
}

const emit = defineEmits(['close-modal', 'created'])

const { addCommunity, makeCommunityChat} = $(aoCommunityStore())
const { showError } = $(notificationStore())

let showWaitingModal = $ref(false)
/** control loading and disable status of save button */
let disableSave = $ref(false)
let showSpinner = $ref(false)

const createCommunity = async () => {
  if (disableSave) return
  disableSave = true
  showWaitingModal = true
  showSpinner = true
  try {
    state.communityChatID = await makeCommunityChat()

    if (!state.communityChatID) {
      throw new Error('Failed to create community chat')
    }

    createdCommunityID = await addCommunity(
      state.logo,
      state.banner,
      state.name,
      state.desc,          // introduction
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

  } catch (error) {
    console.error('Error creating community:', error)

    showWaitingModal = false
    disableSave = false
    showError('Failed to create community!', error as Error)
    return
  } finally {
    showSpinner = false
  }

}

const bannerItems = [
  'banner6',
  'banner7',
  'banner8',
  'banner9',
  'banner10',
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
  communityToken: [{
    tokenName: '',
    showTokenName: true
  }]
})

// 添加表单组函数
const addCommunityTokenForm = () => {
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
  if (!token.communityToken.length) {
    state.isPublished = false
  }
}

// 监听 state.isPublished 的变化
watch(() => state.isPublished, (newVal) => {
  if (newVal) {
    if (token.communityToken.length === 0) {
      addCommunityTokenForm()
    }
  } else {
    token.communityToken = []
  }
})

// 添加表单组函数
const addSupplyGroup = () => {
  state.tokenSupply.push({
    name: '',
    supply: '' as unknown as number,
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
  <div class="overflow-y-auto pt-10 pb-6 px-16 w-fit">
    <UAlert
      icon="heroicons:user-group"
      :title="$t('community.create')"
      :description="$t('community.create.description')"
      class="max-w-[75vw] w-[500px]"
    />
    <UForm
      ref="form"
      :validate="validateCommunitySetting"
      :schema="communitySettingSchema"
      :state="state"
      class="space-y-7 pt-10"
      @submit="onFormSubmit"
    >
      <UFormGroup required name="logo" :label="$t('community.logo')">
        <div class="relative flex-center w-fit cursor-pointer ring-1 ring-gray-300 dark:ring-gray-700" @click="uploadInput && !isUploading && uploadInput.click()">
          <img
            v-if="state.logo"
            :src="arUrl(state.logo)"
            width="64"
            height="64"
            alt="logo"
          >
          <UButton
            v-if="!state.logo"
            label="LOGO"
            size="xl"
            square
            variant="outline"
            class="flex justify-center w-16 h-16"
          />
          <Input
            ref="uploadInput"
            type="file"
            class="opacity-0 w-0 h-0"
            accept="image/x-png,image/jpeg"
            @change="upload2AR"
          />

          <div v-if="isUploading" class="absolute left-0 top-0 flex-center bg-primary-200 bg-opacity-50 w-16 h-16"><UIcon name="svg-spinners:gooey-balls-2" class="w-8 h-8 text-white" /></div>
        </div>
      </UFormGroup>

      <UFormGroup required name="banner" :label="$t('community.banner')">
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
          class="w-64"
        >
          <template #default="{ item }">
            <img :src="getCommunityBannerUrl(item)" class="w-full" draggable="false">
          </template>

          <template #indicator="{ onClick, page, active }">
            <UButton
              :label="String(page)"
              :variant="active ? 'solid' : 'outline'"
              size="2xs"
              class="rounded-full min-w-6 justify-center"
              @click="() => {
                currentIndex = page
                updateBanner(page)
                onClick(page)
              }"
            />
          </template>
        </UCarousel>
      </UFormGroup>

      <UFormGroup required name="name" :label="$t('community.name')">
        <UInput v-model="state.name" placeholder="Name" class="min-w-[100px] w-[430px]" />
      </UFormGroup>

      <UFormGroup required name="desc" :label="$t('community.intro')">
        <UTextarea v-model="state.desc" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
      </UFormGroup>

      <UFormGroup name="website">
        <template #label>
          <div>{{ $t('community.website') }}</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.website" placeholder="URL" class="w-52" />
        </div>
      </UFormGroup>

      <UFormGroup name="twitter">
        <template #label>
          <div>{{ $t('community.twitter') }}</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.twitter" placeholder="URL" class="w-52" />
        </div>
      </UFormGroup>

      <UFormGroup name="github">
        <template #label>
          <div>Github</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.github" placeholder="URL" class="w-52" />
        </div>
      </UFormGroup>

      <UFormGroup required name="typeReward" :label="$t('community.typereward')">
        <USelectMenu v-model="state.typeReward" class="w-52 mr-10" :options="tokenNames" multiple placeholder="Select Token" />
      </UFormGroup>

      <div class="!mt-12 !mb-8 font-bold text-xl text-left">{{ $t('community.project') }}</div>

      <UFormGroup :label="$t('community.token.release')" class="w-52 flex items-center justify-between relative" :ui="{container: 'mt-0'}">
        <div class="flex-center">
          <UToggle v-model="state.isPublished" />
          <UPopover mode="hover" :popper="{ placement: 'right-end' }" class="flex-center ml-2 absolute left-9">
            <template #panel>
              <div class="px-3 py-2 flex justify-center">
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

      <div v-for="(formGroup, index) in token.communityToken" :key="index" class="!mb-2 !mt-3">
        <UFormGroup :label="`Token ${index+1}`" :ui="{label: {base: 'font-medium'}, error: 'hidden'}">
          <div class="flex flex-row items-center gap-x-3">
            <USelect v-model="formGroup.tokenName" :options="tokenNames" />
            <UButton icon="material-symbols:close-rounded" variant="outline" @click="removeFormGroup(index)" />
            <UButton v-if="state.isPublished && token.communityToken.length<=1" variant="outline" icon="material-symbols:add" @click="addCommunityTokenForm" />
          </div>
        </UFormGroup>
      </div>

      <UFormGroup :label="$t('community.token.trade')" class="w-52 flex items-center justify-between space-x-10 !mt-8">
        <UToggle v-model="state.isTradable" />
      </UFormGroup>

      <UFormGroup v-if="state.isTradable" name="tradePlatform" :label="$t('community.token.platforms')" class="!mt-2" :ui="{label: {base: 'font-medium'}}">
        <USelectMenu v-model="state.tradePlatform" :options="tradePlatforms" multiple placeholder="Select trade platform" class="w-52" />
      </UFormGroup>

      <div class="!mt-12 !mb-8 font-bold text-xl text-left">{{ $t('community.economics') }}</div>


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
              class="w-52"
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
            :ui="{error: 'hidden'}"
          >
            <div class="flex flex-row items-center space-x-3">
              <UInput
                v-model="formGroup.name"
                placeholder="community"
                class="w-52"
              />
              <UInput
                v-model="formGroup.supply"
                type="number"
                :model-modifiers="{number: true}"
                placeholder="%"
                class="w-20"
              />
              <UButton v-if="state.tokenSupply.length > 1" icon="material-symbols:close-rounded" variant="outline" @click="removeSupplyGroup(index)" />

              <UButton v-if="index === state.tokenSupply.length - 1" variant="outline" icon="material-symbols:add" @click="addSupplyGroup" />
            </div>
          </UFormGroup>
        </UFormGroup>
      </div>

      <div class="flex-center !mt-12">
        <UButton color="white" type="submit" size="xl" :disabled="disableSave" :loading="showSpinner">
          {{ $t('Submit') }}
        </UButton>
      </div>
    </UForm>

    <UModal v-model="showWaitingModal" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-center">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Create Community
            </h3>
            <!--<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreated = false" />-->
          </div>
        </template>
        <UContainer v-if="showSpinner" class="w-full flex justify-around">
          <UIcon name="svg-spinners:6-dots-scale" />
        </UContainer>
        <UContainer v-else class="w-full flex justify-around">
          <UButton @click="$router.push(`/community/${createdCommunityID}`); emit('close-modal'); emit('created'); showWaitingModal = false">
            {{ $t('community.look') }}
          </UButton>
        </UContainer>
      </UCard>
    </UModal>
  </div>
</template>
