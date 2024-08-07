<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { tradePlatforms, tokenNames, type TokenSupply } from '~/utils/constants'
import type { CommunitySetting } from '~/types'
import { communitySettingSchema, validateCommunitySetting, type CommunitySettingSchema } from '~/utils/schemas'
import { arUrl, defaultCommunityLogo, getCommunityBannerUrl } from '~/utils/arAssets'
import { useUpload } from '~/composables/useUpload'

const props = defineProps<{
  uuid: string
  initState: CommunitySetting & {tokenSupply: TokenSupply[]}
}>()

const { updateCommunity, currentUuid, getLocalCommunity } = $(aoCommunityStore())

const { upload, isUploading, uploadError, uploadResponse } = $(useUpload())

const uploadInput = $ref<HTMLInputElement>()
async function upload2AR() {
  await upload({
    fileName: props.uuid.slice(-4),
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
    supply: 0,
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
      <UAlert
        icon="heroicons:user-group"
        :title="$t('community.create')"
        :description="$t('community.create.description')"
      />
      <UForm
        ref="form"
        :validate="validateCommunitySetting"
        :schema="communitySettingSchema"
        :state="state"
        class="space-y-6 p-5 px-10 pt-10"
        @submit="onFormSubmit"
      >
        <UFormGroup name="logo" :label="$t('community.logo')">
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

        <UFormGroup name="banner" :label="$t('community.banner')">
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
              <img :src="getCommunityBannerUrl(item)" class="w-full" draggable="false">
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

        <UFormGroup name="name" :label="$t('community.name')">
          <UInput v-model="state.name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="desc" :label="$t('community.intro')">
          <UTextarea v-model="state.desc" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="website">
          <template #label>
            <div>{{ $t('community.website') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.website" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="twitter">
          <template #label>
            <div>{{ $t('community.twitter') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.twitter" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="github">
          <template #label>
            <div>Github</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.github" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="typeReward" :label="$t('community.typereward')">
          <USelectMenu v-model="state.typeReward" class="w-[130px] mr-10" :options="tokenNames" multiple placeholder="Select Token" />
        </UFormGroup>

        <div class="!mt-20 !mb-12 font-bold text-xl text-center">{{ $t('community.project') }}</div>

        <UFormGroup :label="$t('community.token.release')" class="flex flex-row items-center space-x-10">
          <UToggle v-model="state.isPublished" />
        </UFormGroup>

        <div v-for="(formGroup, index) in token.communityToken" :key="index" class="!mb-3 !mt-3 pl-8">
          <UFormGroup name="range" :label="`${index+1}st Token`">
            <div class="flex flex-row items-center">
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
        <UButton v-if="state.isPublished" variant="outline" icon="material-symbols:add" class="!mt-2" @click="addCommunityTokenForm" />

        <UFormGroup name="range" :label="$t('community.token.trade')" class="flex flex-row items-center space-x-10">
          <UToggle v-model="state.isTradable" />
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
          <UButton color="white" type="submit" size="xl" :disabled="disableSave" :loading="disableSave">
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
          <UContainer v-if="!showSpinner" class="w-full flex justify-around">
            <UIcon name="svg-spinners:6-dots-scale" />
          </UContainer>
          <UContainer v-else class="w-full flex justify-around">
            <UButton @click="$router.push(`/community/${createdCommunityID}`); emit('close-modal'); emit('created'); showWaitingModal = false">
              {{ $t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
